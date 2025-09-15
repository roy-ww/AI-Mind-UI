// 全局变量
const API_BASE_URL = 'http://localhost:8080';
let currentModel = 'qwen-turbo';
let conversationHistory = [];

// DOM 元素
const elements = {
    chatMessages: document.getElementById('chat-messages'),
    messageInput: document.getElementById('message-input'),
    sendButton: document.getElementById('send-button'),
    modelSelect: document.getElementById('model-select'),
    loadingIndicator: document.getElementById('loading-indicator'),
    settingsModal: document.getElementById('settings-modal'),
    settingsButton: document.getElementById('settings-button'),
    bailianApiKey: document.getElementById('bailian-api-key'),
    temperature: document.getElementById('temperature'),
    temperatureValue: document.getElementById('temperature-value')
};

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadSettings();
});

// 初始化应用
function initializeApp() {
    // 设置默认模型
    currentModel = localStorage.getItem('selectedModel') || 'qwen-turbo';
    elements.modelSelect.value = currentModel;
    
    // 设置温度值显示
    updateTemperatureDisplay();
}

// 设置事件监听器
function setupEventListeners() {
    // 发送消息
    elements.sendButton.addEventListener('click', sendMessage);
    elements.messageInput.addEventListener('keydown', handleKeyDown);
    
    // 模型选择
    elements.modelSelect.addEventListener('change', handleModelChange);
    
    // 快捷按钮
    document.querySelectorAll('.shortcut-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const text = e.target.getAttribute('data-text');
            elements.messageInput.value = text;
            elements.messageInput.focus();
        });
    });
    
    // 字符计数
    elements.messageInput.addEventListener('input', updateCharCount);
    
    // 设置相关
    elements.settingsButton.addEventListener('click', openSettings);
    document.getElementById('cancel-settings').addEventListener('click', closeSettings);
    document.getElementById('save-settings').addEventListener('click', saveSettings);
    document.querySelector('.modal-close').addEventListener('click', closeSettings);
    
    // 温度滑块
    elements.temperature.addEventListener('input', updateTemperatureDisplay);
    
    // 点击模态框外部关闭
    elements.settingsModal.addEventListener('click', (e) => {
        if (e.target === elements.settingsModal) {
            closeSettings();
        }
    });
}

// 处理键盘事件
function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
}

// 发送消息
async function sendMessage() {
    const message = elements.messageInput.value.trim();
    if (!message) return;
    
    // 禁用输入
    elements.messageInput.disabled = true;
    elements.sendButton.disabled = true;
    
    // 添加用户消息到界面
    addMessage('user', message);
    
    // 清空输入框
    elements.messageInput.value = '';
    updateCharCount();
    
    // 显示加载指示器
    showLoading();
    
    try {
        // 调用API
        const response = await callLLMAPI(message);
        
        // 隐藏加载指示器
        hideLoading();
        
        // 添加AI回复到界面
        addMessage('assistant', response.content);
        
        // 更新对话历史
        conversationHistory.push(
            { role: 'user', content: message },
            { role: 'assistant', content: response.content }
        );
        
    } catch (error) {
        console.error('发送消息失败:', error);
        hideLoading();
        addMessage('assistant', '抱歉，我遇到了一些问题。请检查您的API设置或稍后再试。');
        showNotification('发送失败: ' + error.message, 'error');
    } finally {
        // 重新启用输入
        elements.messageInput.disabled = false;
        elements.sendButton.disabled = false;
        elements.messageInput.focus();
    }
}

// 调用大模型API
async function callLLMAPI(message) {
    const apiKey = getCurrentApiKey();
    if (!apiKey) {
        throw new Error('请先设置API Key');
    }
    
    const temperature = parseFloat(elements.temperature.value);
    
    const requestBody = {
        model: currentModel,
        message: message,
        apiKey: apiKey,
        temperature: temperature,
        conversationHistory: conversationHistory.slice(-10) // 只保留最近10轮对话
    };
    
    const response = await fetch(`${API_BASE_URL}/llm/chat`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
}

// 获取当前模型的API Key
function getCurrentApiKey() {
    return elements.bailianApiKey.value || localStorage.getItem('bailianApiKey');
}

// 添加消息到聊天界面
function addMessage(role, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = role === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.innerHTML = formatMessage(content);
    
    const messageTime = document.createElement('div');
    messageTime.className = 'message-time';
    messageTime.textContent = new Date().toLocaleTimeString();
    
    messageContent.appendChild(messageTime);
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(messageContent);
    
    // 移除欢迎消息
    const welcomeMessage = elements.chatMessages.querySelector('.welcome-message');
    if (welcomeMessage) {
        welcomeMessage.remove();
    }
    
    elements.chatMessages.appendChild(messageDiv);
    
    // 滚动到底部
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
}

// 格式化消息内容
function formatMessage(content) {
    // 简单的Markdown支持
    return content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/\n/g, '<br>');
}

// 处理模型切换
function handleModelChange(e) {
    currentModel = e.target.value;
    localStorage.setItem('selectedModel', currentModel);
    
    // 检查是否有API Key
    const apiKey = getCurrentApiKey();
    if (!apiKey) {
        const modelNames = {
            'qwen-turbo': '通义千问 Turbo',
            'qwen-plus': '通义千问 Plus', 
            'kimi': 'Kimi K2 Instruct'
        };
        showNotification('请先设置阿里百炼的 API Key', 'warning');
        openSettings();
    }
}

// 更新字符计数
function updateCharCount() {
    const count = elements.messageInput.value.length;
    const charCount = document.querySelector('.char-count');
    charCount.textContent = `${count}/2000`;
    
    if (count > 1800) {
        charCount.style.color = '#ff6b6b';
    } else {
        charCount.style.color = '#666';
    }
}

// 显示加载指示器
function showLoading() {
    elements.loadingIndicator.classList.add('show');
}

// 隐藏加载指示器
function hideLoading() {
    elements.loadingIndicator.classList.remove('show');
}

// 打开设置
function openSettings() {
    elements.settingsModal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

// 关闭设置
function closeSettings() {
    elements.settingsModal.classList.remove('show');
    document.body.style.overflow = '';
}

// 保存设置
function saveSettings() {
    const bailianApiKey = elements.bailianApiKey.value;
    const temperature = elements.temperature.value;
    
    if (bailianApiKey) {
        localStorage.setItem('bailianApiKey', bailianApiKey);
    }
    
    localStorage.setItem('temperature', temperature);
    
    showNotification('设置已保存', 'success');
    closeSettings();
}

// 加载设置
function loadSettings() {
    const bailianApiKey = localStorage.getItem('bailianApiKey');
    const temperature = localStorage.getItem('temperature') || '0.7';
    
    if (bailianApiKey) {
        elements.bailianApiKey.value = bailianApiKey;
    }
    
    elements.temperature.value = temperature;
    updateTemperatureDisplay();
}

// 更新温度值显示
function updateTemperatureDisplay() {
    elements.temperatureValue.textContent = elements.temperature.value;
}

// 显示通知
function showNotification(message, type = 'info') {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? '#ff6b6b' : type === 'warning' ? '#ffa500' : '#4caf50'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 1001;
        animation: slideInRight 0.3s ease;
        max-width: 300px;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // 3秒后自动移除
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
