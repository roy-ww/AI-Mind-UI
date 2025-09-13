// 全局变量
const API_BASE_URL = 'http://localhost:8080/api';
let currentMindSpaceId = null;
let currentEditingId = null;

// DOM元素
const elements = {
    // 标签页
    navItems: document.querySelectorAll('.nav-item'),
    tabContents: document.querySelectorAll('.tab-content'),
    
    // 思维空间相关
    mindSpaceTableBody: document.getElementById('mind-spaces-table-body'),
    createMindSpaceBtn: document.getElementById('create-mind-space-btn'),
    mindSpaceSearch: document.getElementById('mind-space-search'),
    
    // 节点相关
    nodesTableBody: document.getElementById('nodes-table-body'),
    createNodeBtn: document.getElementById('create-node-btn'),
    nodeSearch: document.getElementById('node-search'),
    mindSpaceSelector: document.getElementById('mind-space-selector'),
    
    // 模态框
    mindSpaceModal: document.getElementById('mind-space-modal'),
    nodeModal: document.getElementById('node-modal'),
    confirmModal: document.getElementById('confirm-modal'),
    
    // 表单
    mindSpaceForm: document.getElementById('mind-space-form'),
    nodeForm: document.getElementById('node-form'),
    
    // 按钮
    saveMindSpace: document.getElementById('save-mind-space'),
    saveNode: document.getElementById('save-node'),
    generateNodeId: document.getElementById('generate-node-id'),
    confirmDelete: document.getElementById('confirm-delete')
};

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// 初始化应用
function initializeApp() {
    setupEventListeners();
    loadMindSpaces();
    setupTabNavigation();
}

// 设置事件监听器
function setupEventListeners() {
    // 标签页切换
    elements.navItems.forEach(item => {
        item.addEventListener('click', () => switchTab(item.dataset.tab));
    });
    
    // 思维空间相关
    elements.createMindSpaceBtn.addEventListener('click', () => openMindSpaceModal());
    elements.mindSpaceSearch.addEventListener('input', filterMindSpaces);
    elements.saveMindSpace.addEventListener('click', saveMindSpace);
    
    // 节点相关
    elements.createNodeBtn.addEventListener('click', () => openNodeModal());
    elements.nodeSearch.addEventListener('input', filterNodes);
    elements.mindSpaceSelector.addEventListener('change', onMindSpaceSelect);
    elements.saveNode.addEventListener('click', saveNode);
    elements.generateNodeId.addEventListener('click', generateNodeId);
    
    // 模态框关闭
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });
    
    // 取消按钮
    document.getElementById('cancel-mind-space').addEventListener('click', closeAllModals);
    document.getElementById('cancel-node').addEventListener('click', closeAllModals);
    document.getElementById('cancel-delete').addEventListener('click', closeAllModals);
    
    // 确认删除
    elements.confirmDelete.addEventListener('click', confirmDelete);
    
    // 点击模态框背景关闭
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeAllModals();
            }
        });
    });
}

// 标签页切换
function switchTab(tabName) {
    // 更新导航状态
    elements.navItems.forEach(item => {
        item.classList.toggle('active', item.dataset.tab === tabName);
    });
    
    // 更新内容显示
    elements.tabContents.forEach(content => {
        content.classList.toggle('active', content.id === tabName);
    });
    
    // 根据标签页加载数据
    if (tabName === 'mind-spaces') {
        loadMindSpaces();
    } else if (tabName === 'nodes') {
        loadMindSpacesForSelector();
    }
}

// API调用函数
async function apiCall(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API调用失败:', error);
        showNotification('操作失败: ' + error.message, 'error');
        throw error;
    }
}

// 加载思维空间列表
async function loadMindSpaces() {
    try {
        showLoading('mind-spaces-table-body');
        
        // 获取所有节点，然后按思维空间分组
        const nodes = await apiCall('/nodes');
        const mindSpaceMap = new Map();
        
        nodes.forEach(node => {
            if (!mindSpaceMap.has(node.mindId)) {
                mindSpaceMap.set(node.mindId, {
                    mindId: node.mindId,
                    rootNode: null,
                    nodeCount: 0,
                    createdAt: node.createdAt
                });
            }
            
            const mindSpace = mindSpaceMap.get(node.mindId);
            mindSpace.nodeCount++;
            
            if (node.nodeId === 'root') {
                mindSpace.rootNode = node;
            }
        });
        
        displayMindSpaces(Array.from(mindSpaceMap.values()));
    } catch (error) {
        showError('mind-spaces-table-body', '加载思维空间失败');
    }
}

// 显示思维空间列表
function displayMindSpaces(mindSpaces) {
    const tbody = elements.mindSpaceTableBody;
    tbody.innerHTML = '';
    
    if (mindSpaces.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-state">
                    <i class="fas fa-project-diagram"></i>
                    <h3>暂无思维空间</h3>
                    <p>点击"创建思维空间"开始使用</p>
                </td>
            </tr>
        `;
        return;
    }
    
    mindSpaces.forEach(mindSpace => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${mindSpace.mindId}</td>
            <td>${mindSpace.rootNode ? mindSpace.rootNode.title : '无'}</td>
            <td class="time-format">${formatDateTime(mindSpace.createdAt)}</td>
            <td>${mindSpace.nodeCount}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn edit" onclick="editMindSpace('${mindSpace.mindId}')">
                        <i class="fas fa-edit"></i> 编辑
                    </button>
                    <button class="action-btn delete" onclick="deleteMindSpace('${mindSpace.mindId}')">
                        <i class="fas fa-trash"></i> 删除
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// 加载节点列表
async function loadNodes(mindSpaceId = null) {
    try {
        showLoading('nodes-table-body');
        
        let nodes;
        if (mindSpaceId) {
            nodes = await apiCall(`/nodes/mind/${mindSpaceId}`);
        } else {
            nodes = await apiCall('/nodes');
        }
        
        displayNodes(nodes);
    } catch (error) {
        showError('nodes-table-body', '加载节点失败');
    }
}

// 显示节点列表
function displayNodes(nodes) {
    const tbody = elements.nodesTableBody;
    tbody.innerHTML = '';
    
    if (nodes.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    <i class="fas fa-sitemap"></i>
                    <h3>暂无节点</h3>
                    <p>点击"创建节点"开始添加</p>
                </td>
            </tr>
        `;
        return;
    }
    
    nodes.forEach(node => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${node.nodeId}</td>
            <td>${node.title}</td>
            <td>${node.parentId || '根节点'}</td>
            <td class="content-truncate">${node.body || '无'}</td>
            <td class="time-format">${formatDateTime(node.createdAt)}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn edit" onclick="editNode(${node.id})">
                        <i class="fas fa-edit"></i> 编辑
                    </button>
                    <button class="action-btn delete" onclick="deleteNode(${node.id})">
                        <i class="fas fa-trash"></i> 删除
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// 为选择器加载思维空间
async function loadMindSpacesForSelector() {
    try {
        const nodes = await apiCall('/nodes');
        const mindSpaceIds = [...new Set(nodes.map(node => node.mindId))];
        
        const selector = elements.mindSpaceSelector;
        const nodeSelector = document.getElementById('node-mind-id');
        
        // 清空现有选项
        selector.innerHTML = '<option value="">选择思维空间</option>';
        nodeSelector.innerHTML = '<option value="">请选择思维空间</option>';
        
        mindSpaceIds.forEach(mindId => {
            const option1 = document.createElement('option');
            option1.value = mindId;
            option1.textContent = mindId;
            selector.appendChild(option1);
            
            const option2 = document.createElement('option');
            option2.value = mindId;
            option2.textContent = mindId;
            nodeSelector.appendChild(option2);
        });
    } catch (error) {
        console.error('加载思维空间选择器失败:', error);
    }
}

// 思维空间选择事件
function onMindSpaceSelect(event) {
    const mindSpaceId = event.target.value;
    currentMindSpaceId = mindSpaceId;
    
    elements.createNodeBtn.disabled = !mindSpaceId;
    
    if (mindSpaceId) {
        loadNodes(mindSpaceId);
    } else {
        elements.nodesTableBody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    <i class="fas fa-sitemap"></i>
                    <h3>请选择思维空间</h3>
                    <p>选择一个思维空间来查看其节点</p>
                </td>
            </tr>
        `;
    }
}

// 打开思维空间模态框
function openMindSpaceModal(mindSpaceId = null) {
    currentEditingId = mindSpaceId;
    
    const modal = elements.mindSpaceModal;
    const title = document.getElementById('mind-space-modal-title');
    const form = elements.mindSpaceForm;
    
    if (mindSpaceId) {
        title.textContent = '编辑思维空间';
        // 这里可以预填充表单数据
    } else {
        title.textContent = '创建思维空间';
        form.reset();
    }
    
    showModal(modal);
}

// 打开节点模态框
function openNodeModal(nodeId = null) {
    if (!currentMindSpaceId) {
        showNotification('请先选择思维空间', 'warning');
        return;
    }
    
    currentEditingId = nodeId;
    
    const modal = elements.nodeModal;
    const title = document.getElementById('node-modal-title');
    const form = elements.nodeForm;
    
    if (nodeId) {
        title.textContent = '编辑节点';
        // 这里可以预填充表单数据
    } else {
        title.textContent = '创建节点';
        form.reset();
        document.getElementById('node-mind-id').value = currentMindSpaceId;
        loadParentNodeOptions(currentMindSpaceId);
    }
    
    showModal(modal);
}

// 保存思维空间
async function saveMindSpace() {
    try {
        const formData = new FormData(elements.mindSpaceForm);
        const data = Object.fromEntries(formData);
        
        if (currentEditingId) {
            // 编辑逻辑（如果需要的话）
            showNotification('思维空间编辑功能待实现', 'info');
        } else {
            await apiCall(`/nodes/mind-space?mindId=${encodeURIComponent(data.mindId)}`, {
                method: 'POST'
            });
            showNotification('思维空间创建成功', 'success');
        }
        
        closeAllModals();
        loadMindSpaces();
    } catch (error) {
        console.error('保存思维空间失败:', error);
    }
}

// 保存节点
async function saveNode() {
    try {
        const formData = new FormData(elements.nodeForm);
        const data = Object.fromEntries(formData);
        
        if (currentEditingId) {
            // 编辑节点
            await apiCall(`/nodes/${currentEditingId}`, {
                method: 'PUT',
                body: JSON.stringify({
                    title: data.title,
                    body: data.body
                })
            });
            showNotification('节点更新成功', 'success');
        } else {
            // 创建节点
            if (!data.parentId) {
                showNotification('请选择父节点', 'warning');
                return;
            }
            
            await apiCall('/nodes', {
                method: 'POST',
                body: JSON.stringify({
                    mindId: data.mindId,
                    parentId: data.parentId,
                    nodeId: data.nodeId,
                    title: data.title,
                    body: data.body
                })
            });
            showNotification('节点创建成功', 'success');
        }
        
        closeAllModals();
        loadNodes(currentMindSpaceId);
    } catch (error) {
        console.error('保存节点失败:', error);
    }
}

// 加载父节点选项
async function loadParentNodeOptions(mindId) {
    try {
        const nodes = await apiCall(`/nodes/mind/${mindId}`);
        const parentSelect = document.getElementById('node-parent-id');
        
        // 清空现有选项
        parentSelect.innerHTML = '<option value="">请选择父节点</option>';
        
        // 添加非根节点作为父节点选项
        nodes.forEach(node => {
            if (node.parentId !== null) { // 只添加非根节点
                const option = document.createElement('option');
                option.value = node.nodeId;
                option.textContent = `${node.title} (${node.nodeId})`;
                parentSelect.appendChild(option);
            }
        });
        
        // 如果没有可选的父节点，显示提示
        if (parentSelect.children.length === 1) {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = '暂无可用父节点';
            option.disabled = true;
            parentSelect.appendChild(option);
        }
    } catch (error) {
        console.error('加载父节点选项失败:', error);
    }
}

// 生成节点ID
async function generateNodeId() {
    try {
        const nodeId = await apiCall('/nodes/generate-node-id');
        document.getElementById('node-id').value = nodeId;
    } catch (error) {
        console.error('生成节点ID失败:', error);
    }
}

// 编辑思维空间
function editMindSpace(mindSpaceId) {
    openMindSpaceModal(mindSpaceId);
}

// 编辑节点
function editNode(nodeId) {
    openNodeModal(nodeId);
}

// 删除思维空间
function deleteMindSpace(mindSpaceId) {
    showConfirmModal(
        '确定要删除这个思维空间吗？',
        '删除后，该思维空间下的所有节点也将被删除，此操作不可恢复。',
        () => performDeleteMindSpace(mindSpaceId)
    );
}

// 删除节点
function deleteNode(nodeId) {
    showConfirmModal(
        '确定要删除这个节点吗？',
        '删除后，该节点的所有子节点也将被删除，此操作不可恢复。',
        () => performDeleteNode(nodeId)
    );
}

// 执行删除思维空间
async function performDeleteMindSpace(mindSpaceId) {
    try {
        await apiCall(`/nodes/mind/${mindSpaceId}`, {
            method: 'DELETE'
        });
        showNotification('思维空间删除成功', 'success');
        loadMindSpaces();
    } catch (error) {
        console.error('删除思维空间失败:', error);
    }
}

// 执行删除节点
async function performDeleteNode(nodeId) {
    try {
        await apiCall(`/nodes/${nodeId}`, {
            method: 'DELETE'
        });
        showNotification('节点删除成功', 'success');
        loadNodes(currentMindSpaceId);
    } catch (error) {
        console.error('删除节点失败:', error);
    }
}

// 显示确认模态框
function showConfirmModal(title, message, onConfirm) {
    const modal = elements.confirmModal;
    const messageEl = document.getElementById('confirm-message');
    
    messageEl.innerHTML = `<strong>${title}</strong><br><br>${message}`;
    
    // 移除之前的事件监听器
    elements.confirmDelete.replaceWith(elements.confirmDelete.cloneNode(true));
    elements.confirmDelete = document.getElementById('confirm-delete');
    
    // 添加新的事件监听器
    elements.confirmDelete.addEventListener('click', () => {
        onConfirm();
        closeAllModals();
    });
    
    showModal(modal);
}

// 确认删除
function confirmDelete() {
    // 这个函数会被动态替换
}

// 显示模态框
function showModal(modal) {
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

// 关闭所有模态框
function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('show');
    });
    document.body.style.overflow = 'auto';
    currentEditingId = null;
}

// 显示加载状态
function showLoading(containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = `
        <tr>
            <td colspan="100%" class="loading">
                <i class="fas fa-spinner"></i>
                <p>加载中...</p>
            </td>
        </tr>
    `;
}

// 显示错误状态
function showError(containerId, message) {
    const container = document.getElementById(containerId);
    container.innerHTML = `
        <tr>
            <td colspan="100%" class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>加载失败</h3>
                <p>${message}</p>
            </td>
        </tr>
    `;
}

// 显示通知
function showNotification(message, type = 'info') {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${getNotificationIcon(type)}"></i>
        <span>${message}</span>
    `;
    
    // 添加样式
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 15px 20px;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 3000;
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideInRight 0.3s ease;
    `;
    
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

// 获取通知图标
function getNotificationIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    return icons[type] || 'info-circle';
}

// 获取通知颜色
function getNotificationColor(type) {
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8'
    };
    return colors[type] || '#17a2b8';
}

// 过滤思维空间
function filterMindSpaces() {
    const searchTerm = elements.mindSpaceSearch.value.toLowerCase();
    const rows = elements.mindSpaceTableBody.querySelectorAll('tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

// 过滤节点
function filterNodes() {
    const searchTerm = elements.nodeSearch.value.toLowerCase();
    const rows = elements.nodesTableBody.querySelectorAll('tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

// 格式化日期时间
function formatDateTime(dateString) {
    if (!dateString) return '未知';
    
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
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
