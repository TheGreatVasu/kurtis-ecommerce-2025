// Modern Admin Panel JS
import config from './config.js';

const adminContent = document.getElementById('adminContent');
const adminNav = document.getElementById('adminNav');
const adminNameSpan = document.getElementById('adminName');
const adminAvatar = document.getElementById('adminAvatar');
const loginContainer = document.getElementById('loginContainer');
const adminPanel = document.getElementById('adminPanel');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');

let adminToken = localStorage.getItem('adminToken') || '';
let adminName = 'Admin';
let currentTab = 'dashboard';

// Toast notification
function showToast(msg, type = 'info') {
  let toast = document.createElement('div');
  toast.textContent = msg;
  toast.className = `admin-toast admin-toast-${type}`;
  document.body.appendChild(toast);
  setTimeout(() => { toast.remove(); }, 2500);
}

// Loading spinner
function showLoading() {
  adminContent.innerHTML = `<div class="center" style="padding:2rem;"><span class="spinner"></span></div>`;
}

// Show/hide error message in login form
function showLoginError(message) {
  loginError.textContent = message;
  loginError.style.display = 'block';
  loginForm.classList.add('shake');
  setTimeout(() => {
    loginForm.classList.remove('shake');
  }, 500);
  setTimeout(() => {
    loginError.style.opacity = '0';
    setTimeout(() => {
      loginError.style.display = 'none';
      loginError.style.opacity = '1';
    }, 300);
  }, 3000);
}

// Show login form
function showLogin() {
  loginContainer.style.display = 'flex';
  adminPanel.style.display = 'none';
  adminToken = '';
  localStorage.removeItem('adminToken');
  // Clear form
  emailInput.value = '';
  passwordInput.value = '';
  loginError.style.display = 'none';
}

// Show admin panel
function showAdminPanel() {
  loginContainer.style.display = 'none';
  adminPanel.style.display = 'flex';
  renderTab('dashboard');
}

// Handle login form submission
loginForm.onsubmit = async (e) => {
  e.preventDefault();
  const email = emailInput.value;
  const password = passwordInput.value;
  
  // Disable form while submitting
  const submitBtn = loginForm.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Logging in...';
  
  try {
    const res = await fetch(`${config.API_URL}/auth/admin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Login failed');
    }
    
    adminToken = data.token;
    localStorage.setItem('adminToken', adminToken);
    if (data.admin) {
      adminName = data.admin.name;
      adminNameSpan.textContent = adminName;
      adminAvatar.textContent = adminName[0]?.toUpperCase() || 'A';
    }
    showAdminPanel();
    showToast('Login successful', 'success');
  } catch (err) {
    showLoginError(err.message || 'Login failed. Please try again.');
  } finally {
    // Re-enable form
    submitBtn.disabled = false;
    submitBtn.textContent = 'Login';
  }
};

// Sidebar navigation
adminNav.addEventListener('click', (e) => {
  if (e.target.closest('.admin-nav-btn')) {
    const tab = e.target.closest('.admin-nav-btn').dataset.tab;
    if (tab === 'logout') {
      logoutAdmin();
    } else {
      renderTab(tab);
    }
  }
});

function setActiveSidebar(tab) {
  document.querySelectorAll('.admin-nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });
}

function logoutAdmin() {
  showLogin();
  showToast('Logged out successfully', 'info');
}

// Fetch admin profile
async function fetchAdminProfile() {
  try {
    const res = await api('/auth/admin-me');
    if (res.success && res.admin) {
      adminName = res.admin.name || 'Admin';
      adminNameSpan.textContent = adminName;
      adminAvatar.textContent = adminName[0]?.toUpperCase() || 'A';
    }
  } catch (err) {
    if (err.message === 'Unauthorized') {
      showLogin();
    }
  }
}

// Render tab content
function renderTab(tab) {
  if (!checkAuth()) return;
  currentTab = tab;
  setActiveSidebar(tab);
  if (tab === 'dashboard') renderDashboard();
  if (tab === 'products') renderProducts();
  if (tab === 'orders') renderOrders();
  if (tab === 'users') renderUsers();
}

// Check authentication
function checkAuth() {
  if (!adminToken) {
    showLogin();
    return false;
  }
  return true;
}

// Dashboard
async function renderDashboard() {
  showLoading();
  try {
    const [users, products, orders] = await Promise.all([
      api('/auth/users/summary'),
      api('/products/summary'),
      api('/orders/summary')
    ]);
    adminContent.innerHTML = `
      <h2 style="color:#e44d6c;">Dashboard</h2>
      <div class="admin-stats" style="margin-bottom:2.2rem;">
        <div class="stat-box">Users<br><span style="font-size:1.3rem;">${users.count || 0}</span></div>
        <div class="stat-box">Products<br><span style="font-size:1.3rem;">${products.data?.count || products.count || 0}</span></div>
        <div class="stat-box">Orders<br><span style="font-size:1.3rem;">${orders.count || 0}</span></div>
      </div>
      <div style="margin-top:2rem; color:#b8004c; font-weight:500;">Welcome, ${adminName}!</div>
    `;
  } catch {
    adminContent.innerHTML = '<div class="center error-msg">Failed to load dashboard.</div>';
  }
}

// Products CRUD
async function renderProducts() {
  showLoading();
  try {
    const data = await api('/products');
    adminContent.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.2rem;">
        <h2 style="color:#e44d6c;">Products</h2>
        <button class="admin-btn" id="addProductBtn">+ Add Product</button>
      </div>
      <div id="productTableWrap"></div>
      <div id="productModal" style="display:none;"></div>
    `;
    renderProductTable(data.products || []);
    document.getElementById('addProductBtn').onclick = () => showProductModal();
  } catch {
    adminContent.innerHTML = '<div class="center error-msg">Failed to load products.</div>';
  }
}

function renderProductTable(products) {
  const wrap = document.getElementById('productTableWrap');
  if (!products.length) {
    wrap.innerHTML = '<div class="center">No products found.</div>';
    return;
  }
  wrap.innerHTML = `<table class="admin-table">
    <tr><th>Title</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th></tr>
    ${products.map(p => `<tr>
      <td>${p.title}</td><td>${p.category}</td><td>₹${p.price}</td><td>${p.stock}</td>
      <td>
        <button class="admin-btn admin-edit" data-id="${p._id}">Edit</button>
        <button class="admin-btn admin-delete" data-id="${p._id}">Delete</button>
      </td>
    </tr>`).join('')}
  </table>`;
  // Edit/Delete handlers
  wrap.querySelectorAll('.admin-edit').forEach(btn => btn.onclick = () => showProductModal(btn.dataset.id));
  wrap.querySelectorAll('.admin-delete').forEach(btn => btn.onclick = () => deleteProduct(btn.dataset.id));
}

async function showProductModal(id = null) {
  const modal = document.getElementById('productModal');
  modal.style.display = 'block';
  let product = { title:'', category:'Kurtis', price:'', stock:'', _id:null };
  if (id) {
    try {
      const data = await api(`/products/${id}`);
      if (data.product) product = data.product;
    } catch {}
  }
  modal.innerHTML = `
    <div class="modal-bg"></div>
    <div class="modal-card">
      <h3>${id ? 'Edit' : 'Add'} Product</h3>
      <form id="productForm">
        <input type="text" name="title" placeholder="Title" value="${product.title || ''}" required>
        <input type="text" name="category" placeholder="Category" value="${product.category || 'Kurtis'}" required>
        <input type="number" name="price" placeholder="Price" value="${product.price || ''}" required>
        <input type="number" name="stock" placeholder="Stock" value="${product.stock || ''}" required>
        <div style="margin-top:1rem;display:flex;gap:0.7rem;justify-content:flex-end;">
          <button type="button" class="admin-btn admin-cancel">Cancel</button>
          <button type="submit" class="admin-btn admin-save">Save</button>
        </div>
      </form>
    </div>
  `;
  modal.querySelector('.modal-bg').onclick = () => { modal.style.display = 'none'; };
  modal.querySelector('.admin-cancel').onclick = () => { modal.style.display = 'none'; };
  modal.querySelector('#productForm').onsubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const payload = {
      title: form.title.value,
      category: form.category.value,
      price: Number(form.price.value),
      stock: Number(form.stock.value)
    };
    try {
      if (id) {
        await api(`/products/${id}`, 'PUT', payload);
        showToast('Product updated', 'success');
    } else {
        await api('/products', 'POST', payload);
        showToast('Product added', 'success');
    }
      modal.style.display = 'none';
      renderProducts();
  } catch {
      showToast('Failed to save product', 'error');
    }
  };
}

async function deleteProduct(id) {
  if (!confirm('Delete this product?')) return;
  try {
    await api(`/products/${id}`, 'DELETE');
    showToast('Product deleted', 'success');
    renderProducts();
  } catch {
    showToast('Failed to delete product', 'error');
  }
}

// Orders
async function renderOrders() {
  showLoading();
  try {
    const data = await api('/orders');
    adminContent.innerHTML = `<h2 style="color:#e44d6c;">Orders</h2><div id="ordersTableWrap"></div>`;
    renderOrdersTable(data.orders || []);
  } catch {
    adminContent.innerHTML = '<div class="center error-msg">Failed to load orders.</div>';
  }
}

function renderOrdersTable(orders) {
  const wrap = document.getElementById('ordersTableWrap');
  if (!orders.length) {
    wrap.innerHTML = '<div class="center">No orders found.</div>';
    return;
  }
  wrap.innerHTML = `<table class="admin-table">
    <tr><th>ID</th><th>User</th><th>Amount</th><th>Status</th><th>Date</th><th>Actions</th></tr>
    ${orders.map(o => `<tr>
      <td>${o._id}</td><td>${o.user?.name || 'N/A'}</td><td>₹${o.totalAmount || o.total || 0}</td><td>${o.status}</td><td>${new Date(o.createdAt).toLocaleDateString()}</td>
      <td><button class="admin-btn admin-edit" data-id="${o._id}">Update</button></td>
    </tr>`).join('')}
  </table>`;
  wrap.querySelectorAll('.admin-edit').forEach(btn => btn.onclick = () => showOrderModal(btn.dataset.id));
}

async function showOrderModal(id) {
  const modal = document.createElement('div');
  modal.className = 'modal-order';
  document.body.appendChild(modal);
  let order = { status: '', _id: id };
  try {
    const data = await api(`/orders/${id}`);
    if (data.order) order = data.order;
  } catch {}
  modal.innerHTML = `
    <div class="modal-bg"></div>
    <div class="modal-card">
      <h3>Update Order Status</h3>
      <form id="orderForm">
        <select name="status" required>
          <option value="pending" ${order.status==='pending'?'selected':''}>Pending</option>
          <option value="processing" ${order.status==='processing'?'selected':''}>Processing</option>
          <option value="shipped" ${order.status==='shipped'?'selected':''}>Shipped</option>
          <option value="delivered" ${order.status==='delivered'?'selected':''}>Delivered</option>
          <option value="cancelled" ${order.status==='cancelled'?'selected':''}>Cancelled</option>
        </select>
        <div style="margin-top:1rem;display:flex;gap:0.7rem;justify-content:flex-end;">
          <button type="button" class="admin-btn admin-cancel">Cancel</button>
          <button type="submit" class="admin-btn admin-save">Save</button>
        </div>
      </form>
    </div>
  `;
  modal.querySelector('.modal-bg').onclick = () => { modal.remove(); };
  modal.querySelector('.admin-cancel').onclick = () => { modal.remove(); };
  modal.querySelector('#orderForm').onsubmit = async (e) => {
    e.preventDefault();
    const status = e.target.status.value;
    try {
      await api(`/orders/${id}`, 'PUT', { status });
      showToast('Order updated', 'success');
      modal.remove();
      renderOrders();
    } catch {
      showToast('Failed to update order', 'error');
    }
  };
}

// Users
async function renderUsers() {
  showLoading();
  try {
    const data = await api('/auth/users');
    adminContent.innerHTML = `<h2 style="color:#e44d6c;">Users</h2><div id="usersTableWrap"></div>`;
    renderUsersTable(data.users || []);
  } catch {
    adminContent.innerHTML = '<div class="center error-msg">Failed to load users.</div>';
  }
}

function renderUsersTable(users) {
  const wrap = document.getElementById('usersTableWrap');
  if (!users.length) {
    wrap.innerHTML = '<div class="center">No users found.</div>';
    return;
  }
  wrap.innerHTML = `<table class="admin-table">
    <tr><th>Name</th><th>Email</th><th>Role</th><th>Actions</th></tr>
    ${users.map(u => `<tr>
      <td>${u.name}</td><td>${u.email}</td><td>${u.role}</td>
      <td>
        <button class="admin-btn admin-edit" data-id="${u._id}">Edit</button>
        <button class="admin-btn admin-delete" data-id="${u._id}">Delete</button>
      </td>
    </tr>`).join('')}
  </table>`;
  wrap.querySelectorAll('.admin-edit').forEach(btn => btn.onclick = () => showUserModal(btn.dataset.id));
  wrap.querySelectorAll('.admin-delete').forEach(btn => btn.onclick = () => deleteUser(btn.dataset.id));
}

async function showUserModal(id) {
  const modal = document.createElement('div');
  modal.className = 'modal-user';
  document.body.appendChild(modal);
  let user = { name: '', email: '', role: 'user', _id: id };
  try {
    const data = await api(`/auth/users`);
    if (data.users) user = data.users.find(u => u._id === id) || user;
  } catch {}
  modal.innerHTML = `
    <div class="modal-bg"></div>
    <div class="modal-card">
      <h3>Edit User</h3>
      <form id="userForm">
        <input type="text" name="name" placeholder="Name" value="${user.name || ''}" required>
        <input type="email" name="email" placeholder="Email" value="${user.email || ''}" required>
        <select name="role">
          <option value="user" ${user.role==='user'?'selected':''}>User</option>
          <option value="admin" ${user.role==='admin'?'selected':''}>Admin</option>
        </select>
        <div style="margin-top:1rem;display:flex;gap:0.7rem;justify-content:flex-end;">
          <button type="button" class="admin-btn admin-cancel">Cancel</button>
          <button type="submit" class="admin-btn admin-save">Save</button>
        </div>
      </form>
    </div>
  `;
  modal.querySelector('.modal-bg').onclick = () => { modal.remove(); };
  modal.querySelector('.admin-cancel').onclick = () => { modal.remove(); };
  modal.querySelector('#userForm').onsubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const payload = {
      name: form.name.value,
      email: form.email.value,
      role: form.role.value
    };
    try {
      await api(`/auth/users/${id}`, 'PUT', payload);
      showToast('User updated', 'success');
      modal.remove();
      renderUsers();
    } catch {
      showToast('Failed to update user', 'error');
    }
  };
}

async function deleteUser(id) {
  if (!confirm('Delete this user?')) return;
  try {
    await api(`/auth/users/${id}`, 'DELETE');
    showToast('User deleted', 'success');
    renderUsers();
  } catch {
    showToast('Failed to delete user', 'error');
  }
}

// API helper function
async function api(endpoint, method = 'GET', body = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      }
    };
    if (body) options.body = JSON.stringify(body);
    
    const response = await fetch(`${config.API_URL}${endpoint}`, options);
    const data = await response.json();
    
    if (!data.success && data.error === 'Unauthorized') {
      showLogin();
      throw new Error('Unauthorized');
    }
    
    return data;
  } catch (err) {
    console.error(`API Error (${endpoint}):`, err);
    throw err;
  }
}

// Toast styles and modal styles
const style = document.createElement('style');
style.innerHTML = `
.admin-toast { position: fixed; top: 1.2rem; right: 1.2rem; z-index: 9999; background: #fff; color: #e44d6c; border-radius: 8px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); padding: 0.8rem 1.2rem; font-weight: 600; font-size: 1rem; margin-bottom: 0.5rem; animation: fadeInOut 2.5s; }
.admin-toast-success { color: #0a7c3a; }
.admin-toast-error { color: #b8004c; }
@keyframes fadeInOut { 0%{opacity:0;transform:translateY(-20px);} 10%{opacity:1;transform:translateY(0);} 90%{opacity:1;} 100%{opacity:0;transform:translateY(-20px);} }
.spinner { display:inline-block; width:32px; height:32px; border:4px solid #ffeaf1; border-top:4px solid #e44d6c; border-radius:50%; animation:spin 1s linear infinite; }
@keyframes spin { 0%{transform:rotate(0);} 100%{transform:rotate(360deg);} }
.modal-bg { position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.18);z-index:1000; }
.modal-card { position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#fff;border-radius:16px;box-shadow:0 8px 32px 0 rgba(228,77,108,0.13);padding:2rem 1.5rem;z-index:1001;min-width:300px;max-width:95vw; }
.modal-card h3{color:#e44d6c;margin-bottom:1rem;}
.modal-card input, .modal-card select{width:100%;padding:0.7rem;margin-bottom:0.7rem;border-radius:6px;border:1px solid #ddd;font-size:1rem;}
.admin-btn{background:#e44d6c;color:#fff;border:none;border-radius:6px;padding:0.5rem 1.1rem;font-weight:600;cursor:pointer;transition:background 0.18s;}
.admin-btn:hover{background:#b8004c;}
`;
document.head.appendChild(style);

// Initial check
if (adminToken) {
  showAdminPanel();
  fetchAdminProfile();
    } else {
  showLogin();
}

// Seed Products
document.getElementById('seedProductsBtn').addEventListener('click', async () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please login first');
            return;
        }

        const confirmed = confirm('This will delete all existing products and seed new ones. Are you sure?');
        if (!confirmed) return;

        const response = await fetch(`${config.API_URL}/products/seed`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        
        if (data.success) {
            alert(`Successfully seeded ${data.count} products!`);
            location.reload();
        } else {
            alert('Failed to seed products: ' + data.error);
        }
    } catch (error) {
        console.error('Error seeding products:', error);
        alert('Error seeding products. Please try again.');
    }
}); 