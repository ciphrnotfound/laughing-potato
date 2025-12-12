/**
 * BotHive Embeddable Widget
 * Usage: <script src="https://bothive.app/widget.js" data-bot-id="your-bot-id"></script>
 */
(function () {
    'use strict';

    // Get configuration from script tag
    const script = document.currentScript;
    const botId = script?.getAttribute('data-bot-id');
    const position = script?.getAttribute('data-position') || 'bottom-right';
    const theme = script?.getAttribute('data-theme') || 'dark';

    if (!botId) {
        console.error('[BotHive] Missing data-bot-id attribute');
        return;
    }

    // API base URL
    const API_BASE = script?.getAttribute('data-api-base') || 'https://localhost:3000';

    // Styles
    const styles = `
        .bothive-widget-container {
            position: fixed;
            ${position === 'bottom-right' ? 'bottom: 20px; right: 20px;' : ''}
            ${position === 'bottom-left' ? 'bottom: 20px; left: 20px;' : ''}
            z-index: 999999;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .bothive-toggle-btn {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%);
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 20px rgba(139, 92, 246, 0.4);
            transition: transform 0.2s, box-shadow 0.2s;
        }

        .bothive-toggle-btn:hover {
            transform: scale(1.05);
            box-shadow: 0 6px 25px rgba(139, 92, 246, 0.5);
        }

        .bothive-toggle-btn svg {
            width: 28px;
            height: 28px;
            fill: white;
        }

        .bothive-chat-window {
            position: absolute;
            bottom: 70px;
            ${position.includes('right') ? 'right: 0;' : 'left: 0;'}
            width: 380px;
            height: 520px;
            background: ${theme === 'dark' ? '#0A0A0A' : '#FFFFFF'};
            border-radius: 16px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            display: none;
            flex-direction: column;
            overflow: hidden;
            border: 1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
        }

        .bothive-chat-window.open {
            display: flex;
            animation: bothive-slide-up 0.3s ease;
        }

        @keyframes bothive-slide-up {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .bothive-header {
            padding: 16px;
            background: linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%);
            color: white;
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .bothive-header-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: rgba(255,255,255,0.2);
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .bothive-header-avatar img {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            object-fit: cover;
        }

        .bothive-header-info h3 {
            margin: 0;
            font-size: 16px;
            font-weight: 600;
        }

        .bothive-header-info p {
            margin: 2px 0 0;
            font-size: 12px;
            opacity: 0.8;
        }

        .bothive-close-btn {
            margin-left: auto;
            background: transparent;
            border: none;
            color: white;
            cursor: pointer;
            padding: 4px;
        }

        .bothive-messages {
            flex: 1;
            overflow-y: auto;
            padding: 16px;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .bothive-message {
            max-width: 85%;
            padding: 12px 16px;
            border-radius: 16px;
            font-size: 14px;
            line-height: 1.5;
        }

        .bothive-message.bot {
            align-self: flex-start;
            background: ${theme === 'dark' ? 'rgba(139, 92, 246, 0.15)' : '#F3F0FF'};
            color: ${theme === 'dark' ? '#E9D5FF' : '#5B21B6'};
            border-bottom-left-radius: 4px;
        }

        .bothive-message.user {
            align-self: flex-end;
            background: linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%);
            color: white;
            border-bottom-right-radius: 4px;
        }

        .bothive-input-area {
            padding: 12px 16px;
            border-top: 1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
            display: flex;
            gap: 8px;
        }

        .bothive-input {
            flex: 1;
            padding: 12px 16px;
            border: 1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
            border-radius: 24px;
            background: ${theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#F9FAFB'};
            color: ${theme === 'dark' ? 'white' : 'black'};
            font-size: 14px;
            outline: none;
        }

        .bothive-input:focus {
            border-color: #8B5CF6;
        }

        .bothive-send-btn {
            width: 44px;
            height: 44px;
            border-radius: 50%;
            background: linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%);
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.2s;
        }

        .bothive-send-btn:hover {
            transform: scale(1.05);
        }

        .bothive-send-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .bothive-send-btn svg {
            width: 20px;
            height: 20px;
            fill: white;
        }

        .bothive-typing {
            display: flex;
            gap: 4px;
            padding: 12px 16px;
            align-self: flex-start;
        }

        .bothive-typing span {
            width: 8px;
            height: 8px;
            background: #8B5CF6;
            border-radius: 50%;
            animation: bothive-bounce 1s infinite;
        }

        .bothive-typing span:nth-child(2) { animation-delay: 0.1s; }
        .bothive-typing span:nth-child(3) { animation-delay: 0.2s; }

        @keyframes bothive-bounce {
            0%, 60%, 100% { transform: translateY(0); }
            30% { transform: translateY(-8px); }
        }

        .bothive-powered {
            padding: 8px;
            text-align: center;
            font-size: 11px;
            color: ${theme === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'};
        }

        .bothive-powered a {
            color: #8B5CF6;
            text-decoration: none;
        }
    `;

    // Inject styles
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    // Create widget HTML
    const container = document.createElement('div');
    container.className = 'bothive-widget-container';
    container.innerHTML = `
        <div class="bothive-chat-window" id="bothive-chat">
            <div class="bothive-header">
                <div class="bothive-header-avatar" id="bothive-avatar">
                    <svg viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>
                </div>
                <div class="bothive-header-info">
                    <h3 id="bothive-name">Bot</h3>
                    <p>Powered by BotHive</p>
                </div>
                <button class="bothive-close-btn" id="bothive-close">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                </button>
            </div>
            <div class="bothive-messages" id="bothive-messages"></div>
            <div class="bothive-input-area">
                <input type="text" class="bothive-input" id="bothive-input" placeholder="Type a message..." />
                <button class="bothive-send-btn" id="bothive-send">
                    <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                </button>
            </div>
            <div class="bothive-powered">
                Powered by <a href="https://bothive.app" target="_blank">BotHive</a>
            </div>
        </div>
        <button class="bothive-toggle-btn" id="bothive-toggle">
            <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>
        </button>
    `;

    document.body.appendChild(container);

    // Get elements
    const chatWindow = document.getElementById('bothive-chat');
    const toggleBtn = document.getElementById('bothive-toggle');
    const closeBtn = document.getElementById('bothive-close');
    const messagesEl = document.getElementById('bothive-messages');
    const inputEl = document.getElementById('bothive-input');
    const sendBtn = document.getElementById('bothive-send');
    const nameEl = document.getElementById('bothive-name');
    const avatarEl = document.getElementById('bothive-avatar');

    let isOpen = false;
    let isLoading = false;
    let botConfig = null;

    // Load bot config
    async function loadConfig() {
        try {
            const res = await fetch(`${API_BASE}/api/bots/${botId}/widget`);
            if (res.ok) {
                botConfig = await res.json();
                nameEl.textContent = botConfig.name || 'Bot';
                if (botConfig.avatarUrl) {
                    avatarEl.innerHTML = `<img src="${botConfig.avatarUrl}" alt="${botConfig.name}" />`;
                }
                // Add welcome message
                addMessage(botConfig.welcomeMessage || 'Hi! How can I help you today?', 'bot');
            }
        } catch (e) {
            console.error('[BotHive] Failed to load config:', e);
        }
    }

    // Add message to chat
    function addMessage(text, sender) {
        const msg = document.createElement('div');
        msg.className = `bothive-message ${sender}`;
        msg.textContent = text;
        messagesEl.appendChild(msg);
        messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    // Show typing indicator
    function showTyping() {
        const typing = document.createElement('div');
        typing.className = 'bothive-typing';
        typing.id = 'bothive-typing';
        typing.innerHTML = '<span></span><span></span><span></span>';
        messagesEl.appendChild(typing);
        messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function hideTyping() {
        const typing = document.getElementById('bothive-typing');
        if (typing) typing.remove();
    }

    // Send message
    async function sendMessage() {
        const text = inputEl.value.trim();
        if (!text || isLoading) return;

        addMessage(text, 'user');
        inputEl.value = '';
        isLoading = true;
        sendBtn.disabled = true;
        showTyping();

        try {
            const res = await fetch(`${API_BASE}/api/bots/${botId}/run`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: text }),
            });

            hideTyping();

            if (res.ok) {
                const data = await res.json();
                addMessage(data.response, 'bot');
            } else {
                addMessage('Sorry, I encountered an error. Please try again.', 'bot');
            }
        } catch (e) {
            hideTyping();
            addMessage('Sorry, I\'m having trouble connecting. Please try again.', 'bot');
        } finally {
            isLoading = false;
            sendBtn.disabled = false;
        }
    }

    // Toggle chat
    function toggleChat() {
        isOpen = !isOpen;
        chatWindow.classList.toggle('open', isOpen);
        if (isOpen && !botConfig) {
            loadConfig();
        }
    }

    // Event listeners
    toggleBtn.addEventListener('click', toggleChat);
    closeBtn.addEventListener('click', toggleChat);
    sendBtn.addEventListener('click', sendMessage);
    inputEl.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

})();
