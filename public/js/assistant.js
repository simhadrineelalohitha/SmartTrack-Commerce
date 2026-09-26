// Smart Product Assistant for SmartTrack Commerce

class ProductAssistant {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.chatHistory = [];
    this.currentProductId = null;
    this.init();
  }

  init() {
    if (!this.container) return;
    
    this.container.innerHTML = `
      <div class="assistant-widget">
        <button class="assistant-toggle" onclick="assistant.toggle()">
          <span class="assistant-icon">💬</span>
          <span class="assistant-text">Ask Assistant</span>
        </button>
        
        <div class="assistant-panel" style="display: none;">
          <div class="assistant-header">
            <h3>🤖 Smart Product Assistant</h3>
            <button class="assistant-minimize" onclick="assistant.toggle()">×</button>
          </div>
          
          <div class="assistant-messages" id="assistant-messages">
            <div class="assistant-message assistant-bot">
              <div class="message-content">
                Hi! I'm your Smart Product Assistant. I can help you with:
                <ul>
                  <li>Product information and features</li>
                  <li>Product comparisons</li>
                  <li>Recommendations</li>
                  <li>Availability and stock</li>
                </ul>
                Ask me anything about our products!
              </div>
            </div>
          </div>
          
          <div class="assistant-suggestions" id="assistant-suggestions">
            <button onclick="assistant.askQuestion('What is this product?')">What is this product?</button>
            <button onclick="assistant.askQuestion('What are the main features?')">Main features?</button>
            <button onclick="assistant.askQuestion('Is it in stock?')">In stock?</button>
            <button onclick="assistant.askQuestion('Show similar products')">Similar products</button>
          </div>
          
          <div class="assistant-input">
            <input 
              type="text" 
              id="assistant-question" 
              placeholder="Ask about products..."
              onkeypress="if(event.key==='Enter') assistant.sendQuestion()"
            />
            <button onclick="assistant.sendQuestion()">Send</button>
          </div>
        </div>
      </div>
    `;
  }

  toggle() {
    const panel = this.container.querySelector('.assistant-panel');
    const isVisible = panel.style.display !== 'none';
    panel.style.display = isVisible ? 'none' : 'block';
    
    if (!isVisible) {
      document.getElementById('assistant-question')?.focus();
    }
  }

  setProduct(productId) {
    this.currentProductId = productId;
  }

  async askQuestion(question) {
    document.getElementById('assistant-question').value = question;
    await this.sendQuestion();
  }

  async sendQuestion() {
    const input = document.getElementById('assistant-question');
    const question = input.value.trim();
    
    if (!question) return;

    // Add user message
    this.addMessage(question, 'user');
    input.value = '';

    // Show typing indicator
    this.showTyping();

    try {
      const payload = {
        question: question,
        productId: this.currentProductId
      };

      const response = await fetch('/api/assistant/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      this.hideTyping();
      
      if (data.answer) {
        this.addMessage(data.answer, 'bot');
        
        // Show related products if any
        if (data.products && data.products.length > 0) {
          this.showProductsSuggestion(data.products);
        }
      } else {
        this.addMessage('Sorry, I couldn\'t process that request. Please try again.', 'bot');
      }
    } catch (error) {
      this.hideTyping();
      this.addMessage('Sorry, I\'m having trouble connecting. Please try again later.', 'bot');
      console.error('Assistant error:', error);
    }
  }

  addMessage(content, type) {
    const messagesContainer = document.getElementById('assistant-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `assistant-message assistant-${type}`;
    
    // Convert markdown-style formatting
    const formatted = content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
    
    messageDiv.innerHTML = `<div class="message-content">${formatted}</div>`;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    this.chatHistory.push({ type, content });
  }

  showTyping() {
    const messagesContainer = document.getElementById('assistant-messages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'assistant-message assistant-bot typing-indicator';
    typingDiv.id = 'typing-indicator';
    typingDiv.innerHTML = `
      <div class="message-content">
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
      </div>
    `;
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  hideTyping() {
    const typing = document.getElementById('typing-indicator');
    if (typing) typing.remove();
  }

  showProductsSuggestion(products) {
    const messagesContainer = document.getElementById('assistant-messages');
    const productsDiv = document.createElement('div');
    productsDiv.className = 'assistant-products';
    
    productsDiv.innerHTML = `
      <div class="products-slider">
        ${products.map(product => `
          <div class="product-card-mini" onclick="window.location.href='product.html?id=${product.id}'">
            <img src="${product.image_url || 'https://via.placeholder.com/150'}" alt="${product.name}">
            <div class="product-mini-info">
              <h4>${product.name}</h4>
              <p class="price">$${parseFloat(product.price).toFixed(2)}</p>
              ${product.avg_rating > 0 ? `<span class="rating">${product.avg_rating.toFixed(1)}⭐</span>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    `;
    
    messagesContainer.appendChild(productsDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  clearChat() {
    const messagesContainer = document.getElementById('assistant-messages');
    messagesContainer.innerHTML = `
      <div class="assistant-message assistant-bot">
        <div class="message-content">Chat cleared. How can I help you?</div>
      </div>
    `;
    this.chatHistory = [];
  }
}

// Initialize assistant on page load
let assistant;
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('product-assistant')) {
      assistant = new ProductAssistant('product-assistant');
    }
  });
} else {
  if (document.getElementById('product-assistant')) {
    assistant = new ProductAssistant('product-assistant');
  }
}
