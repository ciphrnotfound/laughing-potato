(function () {
    // Bothive Headless Widget
    const script = document.currentScript;
    const botId = script.getAttribute('data-bot-id');
    const color = script.getAttribute('data-color') || '#8b5cf6'; // Violet-500

    if (!botId) {
        console.error('Bothive Error: Missing data-bot-id');
        return;
    }

    // Styles
    const style = document.createElement('style');
    style.innerHTML = `
        .bothive-widget-container {
            position: fixed;
            bottom: 24px;
            right: 24px;
            z-index: 999999;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
        .bothive-bubbles {
            width: 56px;
            height: 56px;
            background: #000;
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 8px 32px rgba(0,0,0,0.4);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
        }
        .bothive-bubbles:hover {
            transform: scale(1.05) translateY(-2px);
            border-color: ${color};
            box-shadow: 0 12px 48px rgba(139, 92, 246, 0.3);
        }
        .bothive-bubbles svg {
            width: 24px;
            height: 24px;
            color: #fff;
            transition: transform 0.3s ease;
        }
        .bothive-bubbles.active svg {
            transform: rotate(90deg) scale(0.8);
        }
        .bothive-panel {
            position: absolute;
            bottom: 72px;
            right: 0;
            width: 360px;
            max-height: 500px;
            background: #000;
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 16px;
            display: none;
            flex-direction: column;
            overflow: hidden;
            box-shadow: 0 12px 48px rgba(0,0,0,0.5);
        }
        .bothive-panel.active {
            display: flex;
            animation: bothive-slide-up 0.3s ease-out;
        }
        @keyframes bothive-slide-up {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .bothive-header {
            padding: 20px;
            background: linear-gradient(to bottom right, #111, #000);
            border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .bothive-header h3 {
            margin: 0;
            color: #fff;
            font-size: 14px;
            font-weight: 700;
        }
        .bothive-header p {
            margin: 4px 0 0;
            color: #666;
            font-size: 11px;
        }
        .bothive-chat {
            flex: 1;
            overflow-y: auto;
            padding: 20px;
            max-height: 300px;
        }
        .bothive-message {
            margin-bottom: 12px;
            font-size: 13px;
            line-height: 1.5;
            max-width: 85%;
            padding: 8px 12px;
            border-radius: 12px;
        }
        .bothive-message.bot {
            background: rgba(255,255,255,0.05);
            color: #ccc;
            border-bottom-left-radius: 2px;
            align-self: flex-start;
        }
        .bothive-message.user {
            background: ${color};
            color: #fff;
            border-bottom-right-radius: 2px;
            align-self: flex-end;
            margin-left: auto;
        }
        .bothive-input-area {
            padding: 16px;
            border-top: 1px solid rgba(255,255,255,0.05);
            display: flex;
            gap: 8px;
        }
        .bothive-input {
            flex: 1;
            background: rgba(255,255,255,0.03);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 8px;
            padding: 8px 12px;
            color: #fff;
            font-size: 13px;
            outline: none;
        }
        .bothive-input:focus {
            border-color: ${color};
        }
        .bothive-send {
            background: #fff;
            color: #000;
            border: none;
            border-radius: 8px;
            padding: 0 12px;
            font-size: 12px;
            font-weight: 700;
            cursor: pointer;
        }
    `;
    document.head.appendChild(style);

    // HTML
    const container = document.createElement('div');
    container.className = 'bothive-widget-container';
    container.innerHTML = `
        <div class="bothive-panel" id="bothive-panel">
            <div class="bothive-header">
                <h3 id="bothive-bot-name">Bothive Bot</h3>
                <p>Powered by Neural Intelligence</p>
            </div>
            <div class="bothive-chat" id="bothive-chat">
                <div class="bothive-message bot">Hello! How can I help you today?</div>
            </div>
            <div class="bothive-input-area">
                <input type="text" class="bothive-input" id="bothive-input" placeholder="Type a message...">
                <button class="bothive-send" id="bothive-send">Send</button>
            </div>
        </div>
        <div class="bothive-bubbles" id="bothive-bubble">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
        </div>
    `;
    document.body.appendChild(container);

    // Logic
    const bubble = document.getElementById('bothive-bubble');
    const panel = document.getElementById('bothive-panel');
    const input = document.getElementById('bothive-input');
    const send = document.getElementById('bothive-send');
    const chat = document.getElementById('bothive-chat');
    const botNameEl = document.getElementById('bothive-bot-name');

    // Fetch bot info
    fetch(`https://bothive.cloud/api/bots/${botId}/public`)
        .then(res => res.json())
        .then(data => {
            if (data.bot) {
                botNameEl.innerText = data.bot.name;
            }
        });

    bubble.onclick = () => {
        const isActive = panel.classList.toggle('active');
        bubble.classList.toggle('active');
    };

    const sendMessage = async () => {
        const text = input.value.trim();
        if (!text) return;

        // Add user message
        const userMsg = document.createElement('div');
        userMsg.className = 'bothive-message user';
        userMsg.innerText = text;
        chat.appendChild(userMsg);
        input.value = '';
        chat.scrollTop = chat.scrollHeight;

        try {
            const res = await fetch(`https://bothive.cloud/api/bots/${botId}/public`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text })
            });
            const data = await res.json();

            const botMsg = document.createElement('div');
            botMsg.className = 'bothive-message bot';
            botMsg.innerText = data.response;
            chat.appendChild(botMsg);
            chat.scrollTop = chat.scrollHeight;
        } catch (e) {
            console.error('Bothive API Error:', e);
        }
    };

    send.onclick = sendMessage;
    input.onkeypress = (e) => { if (e.key === 'Enter') sendMessage(); };
})();
