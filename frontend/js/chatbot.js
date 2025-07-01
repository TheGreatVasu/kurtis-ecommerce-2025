/* Futuristic Chatbot Widget Styles */
const style = document.createElement('style');
style.innerHTML = `
#chatbot-widget { position: fixed; bottom: 32px; right: 32px; z-index: 9999; font-family: 'Space Grotesk', Arial, sans-serif; }
#chatbot-toggle {
  width: 180px;
  height: 60px;
  background: linear-gradient(120deg, #e44d6c 0%, #fff0f6 100%);
  color: #b8004c;
  border: none;
  border-radius: 18px;
  font-size: 1.18rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  box-shadow: 0 8px 32px 0 rgba(228,77,108,0.18), 0 0 0 4px rgba(255,240,246,0.15);
  cursor: pointer;
  transition: background 0.3s, box-shadow 0.3s, transform 0.2s;
  display: flex; align-items: center; justify-content: center;
  text-shadow: 0 2px 8px #fff0f6cc;
  backdrop-filter: blur(8px) saturate(160%);
  outline: none;
}
#chatbot-toggle:hover {
  background: linear-gradient(120deg, #fff0f6 0%, #e44d6c 100%);
  color: #e44d6c;
  box-shadow: 0 0 16px 4px #e44d6c, 0 8px 32px 0 rgba(228,77,108,0.18);
  transform: scale(1.04);
}
#chatbot-window {
  width: 370px; max-width: 95vw;
  background: rgba(30, 30, 60, 0.65);
  border-radius: 1.5rem;
  box-shadow: 0 12px 48px 0 rgba(126,48,255,0.18), 0 0 0 4px rgba(0,255,193,0.10);
  position: absolute; bottom: 80px; right: 0;
  display: flex; flex-direction: column; overflow: hidden;
  backdrop-filter: blur(16px) saturate(180%);
  border: 1.5px solid rgba(126,48,255,0.18);
  animation: chatbot-pop 0.4s cubic-bezier(.68,-0.55,.27,1.55);
}
@keyframes chatbot-pop {
  0% { transform: scale(0.85) translateY(40px); opacity: 0; }
  100% { transform: scale(1) translateY(0); opacity: 1; }
}
#chatbot-window.d-none { display: none; }
.chatbot-header {
  background: linear-gradient(120deg, #7e30ff 0%, #0fffc1 100%);
  color: #fff;
  font-weight: 700;
  padding: 1.1rem 1.5rem;
  display: flex; justify-content: space-between; align-items: center;
  font-size: 1.15rem;
  letter-spacing: 0.03em;
  box-shadow: 0 2px 12px 0 rgba(126,48,255,0.10);
}
#chatbot-close {
  background: none; border: none; color: #fff; font-size: 1.7rem; cursor: pointer;
  transition: color 0.2s;
}
#chatbot-close:hover { color: #0fffc1; }
.chatbot-body {
  padding: 1.2rem 1.5rem 0.7rem 1.5rem;
  flex: 1 1 auto;
  overflow-y: auto;
  max-height: 340px;
  display: flex; flex-direction: column;
  gap: 0.5em;
}
.chatbot-message {
  margin-bottom: 0.7em;
  padding: 0.8em 1.2em;
  border-radius: 1.2em;
  max-width: 90%;
  word-break: break-word;
  font-size: 1.08em;
  box-shadow: 0 2px 12px 0 rgba(126,48,255,0.08);
  position: relative;
  transition: background 0.2s, color 0.2s;
}
.chatbot-message.bot {
  background: rgba(126,48,255,0.13);
  color: #0fffc1;
  align-self: flex-start;
  border: 1.2px solid #7e30ff44;
  box-shadow: 0 0 8px 0 #7e30ff33;
}
.chatbot-message.user {
  background: linear-gradient(120deg, #0fffc1 0%, #7e30ff 100%);
  color: #fff;
  align-self: flex-end;
  margin-left: auto;
  border: 1.2px solid #0fffc144;
  box-shadow: 0 0 8px 0 #0fffc133;
}
.chatbot-keywords {
  display: flex; flex-wrap: wrap; gap: 0.6em; margin-bottom: 0.7em;
}
.chatbot-keyword {
  background: rgba(30,30,60,0.7);
  color: #0fffc1;
  border: 1.2px solid #7e30ff88;
  border-radius: 1.2em;
  padding: 0.45em 1.3em;
  font-weight: 600;
  cursor: pointer;
  font-size: 1em;
  transition: background 0.2s, color 0.2s, border 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 8px 0 #0fffc122;
}
.chatbot-keyword:hover {
  background: linear-gradient(120deg, #7e30ff 0%, #0fffc1 100%);
  color: #fff;
  border: 1.2px solid #0fffc1;
  box-shadow: 0 0 8px 0 #0fffc1;
}
#chatbot-form {
  display: flex; border-top: 1.5px solid #7e30ff33; background: rgba(30,30,60,0.7);
}
#chatbot-input {
  flex: 1 1 auto;
  border: none;
  padding: 1.1em;
  font-size: 1.08em;
  border-radius: 0 0 0 1.5rem;
  outline: none;
  background: transparent;
  color: #fff;
  transition: background 0.2s;
}
#chatbot-input::placeholder { color: #bdbdfc; opacity: 1; }
#chatbot-send {
  background: none;
  border: none;
  color: #0fffc1;
  font-size: 1.7em;
  padding: 0 1.1em;
  cursor: pointer;
  transition: color 0.2s, transform 0.2s;
}
#chatbot-send:hover { color: #7e30ff; transform: scale(1.15); }
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