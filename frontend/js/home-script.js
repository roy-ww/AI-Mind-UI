// Home页面JavaScript代码
document.addEventListener('DOMContentLoaded', function() {
    const mindInput = document.getElementById('mindInput');
    const tipsContainer = document.getElementById('tipsContainer');
    const tipsMessage = document.getElementById('tipsMessage');
    
    // Modal相关元素
    const profileButton = document.getElementById('profileButton');
    const signInModal = document.getElementById('signInModal');
    const closeModal = document.getElementById('closeModal');
    const googleSignIn = document.getElementById('googleSignIn');
    
    // 调试信息
    console.log('Profile button:', profileButton);
    console.log('Sign in modal:', signInModal);
    console.log('Close modal:', closeModal);
    console.log('Google sign in:', googleSignIn);
    
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
    
    // Modal功能
    // 显示模态框
    function showModal() {
        console.log('showModal called'); // 调试信息
        console.log('signInModal element:', signInModal); // 调试信息
        console.log('Current classes before:', signInModal.className);
        
        // 移除hidden类
        signInModal.classList.remove('hidden');
        
        // 强制设置display样式
        signInModal.style.display = 'flex';
        signInModal.style.position = 'fixed';
        signInModal.style.zIndex = '9999';
        
        console.log('Current classes after:', signInModal.className);
        console.log('Computed style display:', window.getComputedStyle(signInModal).display);
        console.log('Computed style position:', window.getComputedStyle(signInModal).position);
        console.log('Computed style z-index:', window.getComputedStyle(signInModal).zIndex);
        
        document.body.style.overflow = 'hidden'; // 防止背景滚动
        console.log('Modal should be visible now'); // 调试信息
    }
    
    // 隐藏模态框
    function hideModal() {
        signInModal.classList.add('hidden');
        signInModal.style.display = 'none';
        document.body.style.overflow = 'auto'; // 恢复背景滚动
    }
    
    // Profile按钮点击事件
    profileButton.addEventListener('click', function() {
        console.log('Profile button clicked!'); // 调试信息
        showModal();
    });
    
    // 关闭按钮点击事件
    closeModal.addEventListener('click', function() {
        hideModal();
    });
    
    // 点击模态框背景关闭
    signInModal.addEventListener('click', function(e) {
        if (e.target === signInModal) {
            hideModal();
        }
    });
    
    // ESC键关闭模态框
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && !signInModal.classList.contains('hidden')) {
            hideModal();
        }
    });
    
    // Google登录按钮点击事件
    googleSignIn.addEventListener('click', function() {
        // 这里可以添加实际的Google登录逻辑
        console.log('Google登录被点击');
        showTips('Google登录功能开发中...', 'loading');
        
        // 模拟登录过程
        setTimeout(() => {
            hideModal();
            showTips('登录功能开发中，敬请期待！', 'success');
        }, 2000);
    });
});
