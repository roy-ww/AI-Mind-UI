// Home页面JavaScript代码
document.addEventListener('DOMContentLoaded', function() {
    const mindInput = document.getElementById('mindInput');
    const tipsContainer = document.getElementById('tipsContainer');
    const tipsMessage = document.getElementById('tipsMessage');
    
    // 添加回车事件监听器
    mindInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const inputText = mindInput.value.trim();
            if (inputText) {
                createMindSpaceByAI(inputText);
            }
        }
    });
    
    // 调用 createMindSpaceByAI API
    async function createMindSpaceByAI(rootTitle) {
        try {
            // 显示加载状态
            showTips('正在创建思维空间...', 'loading');
            
            const response = await fetch('/nodes/mind-space-by-ai', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(rootTitle)
            });
            
            if (response.ok) {
                const result = await response.json();
                showTips('思维空间创建成功！', 'success');
                console.log('创建的思维空间:', result);
            } else {
                showTips('创建失败，请重试', 'error');
            }
        } catch (error) {
            console.error('API调用错误:', error);
            showTips('网络错误，请检查连接', 'error');
        }
    }
    
    // 显示提示信息
    function showTips(message, type) {
        tipsMessage.textContent = message;
        tipsContainer.classList.remove('hidden');
        
        // 根据类型设置不同的样式
        tipsMessage.className = 'text-sm';
        if (type === 'success') {
            tipsMessage.classList.add('text-green-400');
        } else if (type === 'error') {
            tipsMessage.classList.add('text-red-400');
        } else if (type === 'loading') {
            tipsMessage.classList.add('text-yellow-400');
        } else {
            tipsMessage.classList.add('text-gray-400');
        }
        
        // 如果是成功或错误消息，3秒后自动隐藏
        if (type === 'success' || type === 'error') {
            setTimeout(() => {
                tipsContainer.classList.add('hidden');
            }, 3000);
        }
    }
});
