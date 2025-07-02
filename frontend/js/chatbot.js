/* Futuristic Chatbot Widget Styles */
const style = document.createElement('style');
style.innerHTML = `
#chatbot-widget { position: fixed; bottom: 32px; right: 32px; z-index: 9999; font-family: Arial, sans-serif; }
#chatbot-toggle {
  width: 160px;
  height: 48px;
  background: #e44d6c;
  color: #fff;
  border: none;
  border-radius: 16px;
  font-size: 1.1rem;
  font-weight: 600;
  box-shadow: none;
  cursor: pointer;
  transition: background 0.2s, transform 0.15s;
  display: flex; align-items: center; justify-content: center;
  outline: none;
}
#chatbot-toggle:hover {
  background: #c92c53;
  color: #fff;
  transform: scale(1.03);
}
#chatbot-window {
  width: 340px; max-width: 95vw;
  background: #fff0f4;
  border-radius: 1rem;
  box-shadow: 0 2px 16px 0 rgba(228,77,108,0.10);
  position: absolute; bottom: 64px; right: 0;
  display: flex; flex-direction: column; overflow: hidden;
  border: 1.5px solid #e44d6c33;
  animation: chatbot-pop 0.3s cubic-bezier(.68,-0.55,.27,1.55);
}
@keyframes chatbot-pop {
  0% { transform: scale(0.95) translateY(20px); opacity: 0; }
  100% { transform: scale(1) translateY(0); opacity: 1; }
}
#chatbot-window.d-none { display: none; }
.chatbot-header {
  background: #e44d6c;
  color: #fff;
  font-weight: 600;
  padding: 0.9rem 1.2rem;
  display: flex; justify-content: space-between; align-items: center;
  font-size: 1rem;
  border-bottom: 1px solid #e44d6c33;
}
#chatbot-close {
  background: none; border: none; color: #fff; font-size: 1.5rem; cursor: pointer;
  transition: color 0.2s;
}
#chatbot-close:hover { color: #c92c53; }
.chatbot-body {
  padding: 1rem 1.2rem 0.6rem 1.2rem;
  flex: 1 1 auto;
  overflow-y: auto;
  max-height: 320px;
  display: flex; flex-direction: column;
  gap: 0.5em;
}
.chatbot-message {
  margin-bottom: 0.6em;
  padding: 0.7em 1em;
  border-radius: 1em;
  max-width: 90%;
  word-break: break-word;
  font-size: 1em;
  box-shadow: none;
  position: relative;
  border: 1px solid #e44d6c22;
}
.chatbot-message.bot {
  background: #fff;
  color: #e44d6c;
  align-self: flex-start;
}
.chatbot-message.user {
  background: #e44d6c;
  color: #fff;
  align-self: flex-end;
  margin-left: auto;
}
.chatbot-keywords {
  display: flex; flex-wrap: wrap; gap: 0.5em; margin-bottom: 0.6em;
}
.chatbot-keyword {
  background: #fff0f4;
  color: #e44d6c;
  border: 1px solid #e44d6c55;
  border-radius: 1em;
  padding: 0.35em 1em;
  font-weight: 500;
  cursor: pointer;
  font-size: 0.98em;
  transition: background 0.2s, color 0.2s, border 0.2s;
}
.chatbot-keyword:hover {
  background: #e44d6c;
  color: #fff;
  border: 1px solid #e44d6c;
}
#chatbot-form {
  display: flex; border-top: 1px solid #e44d6c22; background: #fff0f4;
}
#chatbot-input {
  flex: 1 1 auto;
  border: none;
  padding: 1em;
  font-size: 1em;
  border-radius: 0 0 0 1rem;
  outline: none;
  background: transparent;
  color: #e44d6c;
}
#chatbot-input::placeholder { color: #e44d6c99; opacity: 1; }
#chatbot-send {
  background: none;
  border: none;
  color: #e44d6c;
  font-size: 1.4em;
  padding: 0 1em;
  cursor: pointer;
  transition: color 0.2s, transform 0.2s;
}
#chatbot-send:hover { color: #c92c53; transform: scale(1.08); }
@media (max-width: 600px) {
  #chatbot-window { width: 99vw; right: -10vw; }
  #chatbot-widget { right: 8px; bottom: 8px; }
}
`;
document.head.appendChild(style);

// Chatbot logic
const chatbotToggle = document.getElementById('chatbot-toggle');
const chatbotWindow = document.getElementById('chatbot-window');
const chatbotClose = document.getElementById('chatbot-close');
const chatbotForm = document.getElementById('chatbot-form');
const chatbotInput = document.getElementById('chatbot-input');
const chatbotMessages = document.getElementById('chatbot-messages');
const chatbotKeywords = document.querySelectorAll('.chatbot-keyword');

const responses = {
  'party wear': 'Party Wear kurtis are perfect for festive occasions and celebrations. Check out our latest Party Wear collection in the Shop!',
  'cotton kurtis': 'Cotton Kurtis are comfortable and stylish for daily wear. Browse our Cotton Kurtis in the Shop section!',
  'designer': 'Our Designer Kurtis feature unique patterns and premium fabrics. Explore Designer options in the Shop!',
  'traditional': 'Traditional Kurtis blend classic Indian styles with modern comfort. See our Traditional collection in Shop!',
  'casual': 'Casual Kurtis are great for everyday use. Find your favorite Casual styles in the Shop!',
};

const categoryRedirects = {
  'party wear': 'Party Wear',
  'cotton kurtis': 'Cotton',
  'designer': 'Designer',
  'traditional': 'Traditional',
  'casual': 'Casual',
};

function addMessage(text, sender = 'bot') {
  const msg = document.createElement('div');
  msg.className = 'chatbot-message ' + sender;
  msg.innerHTML = text;
  chatbotMessages.appendChild(msg);
  chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

function addKeywords(keywords) {
  if (!keywords || !keywords.length) return;
  const keywordsDiv = document.createElement('div');
  keywordsDiv.className = 'chatbot-keywords';
  keywords.forEach(kw => {
    const btn = document.createElement('button');
    btn.className = 'chatbot-keyword';
    btn.textContent = kw;
    btn.onclick = () => {
      chatbotInput.value = kw;
      chatbotForm.dispatchEvent(new Event('submit'));
    };
    keywordsDiv.appendChild(btn);
  });
  chatbotMessages.appendChild(keywordsDiv);
}

async function handleChatbotResponse(data) {
  addMessage(data.reply, 'bot');
  if (data.keywords) addKeywords(data.keywords);
}

chatbotToggle.onclick = () => chatbotWindow.classList.toggle('d-none');
chatbotClose.onclick = () => chatbotWindow.classList.add('d-none');

chatbotKeywords.forEach(btn => {
  btn.onclick = async () => {
    const keyword = btn.textContent.trim().toLowerCase();
    addMessage(btn.textContent, 'user');
    setTimeout(async () => {
      addMessage(responses[keyword] || 'Sorry, I do not have info on that category yet.', 'bot');
      if (categoryRedirects[keyword]) {
        addMessage('Checking products in this category...', 'bot');
        try {
          const res = await fetch(`/api/products?category=${encodeURIComponent(categoryRedirects[keyword])}`);
          const data = await res.json();
          if (data.data && data.data.length === 1) {
            setTimeout(() => {
              window.location.href = `product.html?id=${data.data[0]._id}`;
            }, 1000);
          } else {
            setTimeout(() => {
              window.location.href = `shop.html?category=${encodeURIComponent(categoryRedirects[keyword])}`;
            }, 1000);
          }
        } catch (err) {
          setTimeout(() => {
            window.location.href = `shop.html?category=${encodeURIComponent(categoryRedirects[keyword])}`;
          }, 1000);
        }
      }
    }, 500);
  };
});

chatbotForm.onsubmit = async e => {
  e.preventDefault();
  const userMsg = chatbotInput.value.trim();
  if (!userMsg) return;
  addMessage(userMsg, 'user');
  chatbotInput.value = '';
  addMessage('<span class="chatbot-typing">● ● ●</span>', 'bot'); // Futuristic typing indicator

  try {
    const res = await fetch('/api/chatbot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMsg })
    });
    chatbotMessages.lastChild.remove(); // Remove typing indicator
    const data = await res.json();
    handleChatbotResponse(data);
  } catch {
    chatbotMessages.lastChild.remove();
    addMessage('Sorry, something went wrong.', 'bot');
  }
}; 