const CONFIG = {
  levelGap: 120,
  baseNodeWidth: 420,
  baseNodeHeight: 40,
  siblingGap: 40, // 增加兄弟节点间距，从22增加到40
  paddingTop: 24,
  paddingLeft: 24,
  nodePaddingX: 12,
  nodePaddingY: 10,
  titleBodyGap: 20,
  titleLineHeight: 15,
  bodyLineHeight: 15,
  minNodeHeight: 36,
  minCollapsedHeight: 28,
  fontFamily: "12px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial"
};


let zoomScale = 1;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2.5;
const ZOOM_STEP = 0.1;
let panX = 0;
let panY = 0;

const TextMeasurer = (() => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  function setFont(font) { ctx.font = font; }
  function measure(text, font) { if (font) setFont(font); return ctx.measureText(text).width; }
  return { measure };
})();



function isCJK(str) { return /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/.test(str); }

function wrapParagraph(text, maxWidth) {
  if (!text) return [""];
  const font = CONFIG.fontFamily;
  const hasCJK = isCJK(text);
  if (hasCJK) {
    const chars = Array.from(text);
    const lines = []; let current = "";
    for (const ch of chars) {
      const trial = current + ch; const w = TextMeasurer.measure(trial, font);
      if (w <= maxWidth) current = trial; else { if (current.length > 0) lines.push(current); current = ch; }
    }
    if (current.length > 0) lines.push(current);
    return lines.length > 0 ? lines : [""];
  } else {
    const tokens = text.split(/(\s+)/).filter(t => t.length > 0);
    const lines = []; let current = "";
    for (const tok of tokens) {
      const trial = current + tok; const w = TextMeasurer.measure(trial, font);
      if (w <= maxWidth) current = trial; else {
        if (current.trim().length > 0) lines.push(current.trimEnd());
        if (TextMeasurer.measure(tok.trim(), font) > maxWidth) {
          const chars = Array.from(tok); let chunk = "";
          for (const ch of chars) { const t2 = chunk + ch; const w2 = TextMeasurer.measure(t2, font); if (w2 <= maxWidth) chunk = t2; else { lines.push(chunk); chunk = ch; } }
          current = chunk || "";
        } else { current = tok.trimStart(); }
      }
    }
    if (current.trim().length > 0) lines.push(current.trimEnd());
    return lines.length > 0 ? lines : [""];
  }
}

function parseBodyContent(body) {
  if (!body) return [];
  
  return parseSectionsContent(body);
}


function parseSectionsContent(body) {
   /*
    sections: 数组，每个元素是一个对象，包含以下字段：
      title: 字符串，标题
      content: 字符串，内容
    concepts: 数组，每个元素是一个字符串，概念
    questions: 数组，每个元素是一个字符串，问题
  */
  const sections = body;
// 将HTML转换为适合SVG的格式
const contentText = [];
  for (let i = 0; i < sections.length; i++) {
    const title = sections[i].title;
    const content = sections[i].content;

    contentText.push({ type: "subtitle", text: title, level: 3 });
    contentText.push({ type: "paragraph", text: content });
  }
  return contentText;
}



function wrapBodyText(body, innerWidth) {
  const content = parseBodyContent(body);
  const allLines = [];
  
  for (let i = 0; i < content.length; i++) {
    const item = content[i];
    if (item.type === "empty") {
      allLines.push({ type: "empty", text: "" });
    } else {
      const lines = wrapParagraph(item.text, innerWidth);
      for (let j = 0; j < lines.length; j++) {
        allLines.push({ type: item.type, text: lines[j] });
      }
      // 在非空内容后添加空行（除了最后一个）
      if (i < content.length - 1 && item.type !== "empty") {
        allLines.push({ type: "empty", text: "" });
      }
    }
  }
  
  // 移除末尾的空行
  while (allLines.length > 0 && allLines[allLines.length - 1].type === "empty") {
    allLines.pop();
  }
  
  return allLines;
}


function makeNode(id, title, body = "", children = [], height, concepts = [], questions = []) {
  return { id, title, body, children, collapsed: false, width: CONFIG.baseNodeWidth, height: height ?? undefined, x: 0, y: 0, subtreeHeight: 0, _wrappedBodyLines: undefined, concepts, questions };
}

function generateUniqueId() {
  return 'node_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// 高亮concepts匹配的文字
function highlightConcepts(text, concepts) {
  if (!concepts || concepts.length === 0) {
    return [{ text, highlighted: false }];
  }
  
  const parts = [];
  let lastIndex = 0;
  
  // 创建正则表达式来匹配所有concepts
  const conceptPattern = concepts.map(concept => 
    concept.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // 转义特殊字符
  ).join('|');
  
  const regex = new RegExp(`(${conceptPattern})`, 'gi');
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    // 添加匹配前的文本
    if (match.index > lastIndex) {
      parts.push({
        text: text.substring(lastIndex, match.index),
        highlighted: false
      });
    }
    
    // 添加匹配的文本
    parts.push({
      text: match[0],
      highlighted: true,
      concept: match[0]
    });
    
    lastIndex = match.index + match[0].length;
  }
  
  // 添加剩余的文本
  if (lastIndex < text.length) {
    parts.push({
      text: text.substring(lastIndex),
      highlighted: false
    });
  }
  
  return parts.length > 0 ? parts : [{ text, highlighted: false }];
}

// 从URL参数获取mindId
function getMindIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('mindId');
}

// 构建节点树结构
function buildNodeTree(nodes, parentId = null) {
  const children = nodes.filter(node => node.parentId === parentId);
  return children.map(node => {
    const childNodes = buildNodeTree(nodes, node.nodeId);
    return makeNode(node.nodeId, node.title, node.body, childNodes);
  });
}

async function buildSampleData() {
  // 从URL参数获取mindId
  const mindId = getMindIdFromUrl();
  
  if (!mindId) {
    console.error('未找到mindId参数');
    // 返回默认示例数据
    return makeNode("root", "请提供mindId参数", "请在URL中添加?mindId=your_mind_id", []);
  }

  try {
    // 通过mindId获取所有节点信息
    const response = await fetch(`/nodes/mind/${mindId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const nodes = await response.json();
    console.log('获取到的节点数据:', nodes);
    
    if (!nodes || nodes.length === 0) {
      return makeNode("root", "思维空间为空", "该思维空间下没有节点", []);
    }

    // 找到根节点（parentId为null或空的节点）
    const rootNodes = nodes.filter(node => !node.parentId || node.parentId === '');
    
    if (rootNodes.length === 0) {
      return makeNode("root", "未找到根节点", "该思维空间下没有根节点", []);
    }

    // 如果有多个根节点，选择第一个作为主根节点
    const rootNode = rootNodes[0];
    
    // 解析body内容
    let bodyContent = [];
    let concepts = [];
    let questions = [];
    try {
      if (rootNode.body) {
        const parsedBody = JSON.parse(rootNode.body);
        if (parsedBody.sections) {
          bodyContent = parsedBody.sections;
        } else {
          bodyContent = [{ title: "内容", content: rootNode.body }];
        }
        if (parsedBody.concepts) {
          concepts = parsedBody.concepts;
        }
        if (parsedBody.questions) {
          questions = parsedBody.questions;
        }
      }
    } catch (e) {
      console.warn('解析body内容失败:', e);
      bodyContent = [{ title: "内容", content: rootNode.body || "" }];
    }

    // 构建完整的节点树
    const root = makeNode(rootNode.nodeId, rootNode.title, bodyContent, [], undefined, concepts, questions);
    
    // 递归构建子节点
    function buildChildren(parentNode, allNodes) {
      const children = allNodes.filter(node => node.parentId === parentNode.id);
      parentNode.children = children.map(childNode => {
        let childBodyContent = [];
        let childConcepts = [];
        let childQuestions = [];
        try {
          if (childNode.body) {
            const parsedBody = JSON.parse(childNode.body);
            if (parsedBody.sections) {
              childBodyContent = parsedBody.sections;
            } else {
              childBodyContent = [{ title: "内容", content: childNode.body }];
            }
            if (parsedBody.concepts) {
              childConcepts = parsedBody.concepts;
            }
            if (parsedBody.questions) {
              childQuestions = parsedBody.questions;
            }
          }
        } catch (e) {
          console.warn('解析子节点body内容失败:', e);
          childBodyContent = [{ title: "内容", content: childNode.body || "" }];
        }
        
        const childNodeObj = makeNode(childNode.nodeId, childNode.title, childBodyContent, [], undefined, childConcepts, childQuestions);
        buildChildren(childNodeObj, allNodes);
        return childNodeObj;
      });
    }
    
    buildChildren(root, nodes);
    
    // 根据questions创建子节点
    function addQuestionsAsChildren(node) {
      if (node.questions && node.questions.length > 0) {
        const questionChildren = node.questions.map((question, index) => {
          const questionId = `${node.id}_question_${index}`;
          const questionNode = makeNode(questionId, question, [], [], undefined, [], []);
          questionNode.isQuestion = true; // 标记为问题节点
          return questionNode;
        });
        
        // 将questions子节点添加到现有子节点后面
        if (!node.children) {
          node.children = [];
        }
        node.children = node.children.concat(questionChildren);
      }
      
      // 递归处理所有子节点
      if (node.children) {
        node.children.forEach(child => addQuestionsAsChildren(child));
      }
    }
    
    addQuestionsAsChildren(root);
    
    return root;
    
  } catch (error) {
    console.error('获取节点数据失败:', error);
    return makeNode("error", "数据加载失败", `错误信息: ${error.message}`, []);
  }
}



function deepClone(obj) { return JSON.parse(JSON.stringify(obj)); }

function measureNodeSize(node) {
  const innerWidth = Math.max(20, (node.width || CONFIG.baseNodeWidth) - CONFIG.nodePaddingX * 2);
  const wrapped = wrapBodyText(node.body, innerWidth);
  node._wrappedBodyLines = wrapped;
  const bodyLinesCount = wrapped.length > 0 && wrapped[0] !== "" ? wrapped.length : 0;
  const titleBlock = CONFIG.titleLineHeight;
  const bodyBlock = bodyLinesCount > 0 ? (CONFIG.titleBodyGap + bodyLinesCount * CONFIG.bodyLineHeight) : 0;
  const content = CONFIG.nodePaddingY * 2 + titleBlock + bodyBlock;
  const h = Math.max(CONFIG.minNodeHeight, content);
  node.width = node.width || CONFIG.baseNodeWidth;
  node.height = Math.max(node.height || 0, h);
}

function ensureSize(node) { measureNodeSize(node); (node.children || []).forEach(ensureSize); }

function normalize(node) {
  if (node.collapsed) { if (!node._originalChildren && node.children) node._originalChildren = node.children; node.children = []; }
  else { if (node._originalChildren) node.children = node._originalChildren; }
  node.children.forEach(normalize);
}

function computeSubtreeHeight(node, siblingGap, leafHeightMode = "self") {
  const children = node.children || [];
  if (children.length === 0) { const leafH = leafHeightMode === "min" ? Math.min(node.height, CONFIG.minCollapsedHeight) : node.height; node.subtreeHeight = leafH; return leafH; }
  
  let total = 0; 
  for (let i = 0; i < children.length; i++) { 
    const c = children[i]; 
    computeSubtreeHeight(c, siblingGap, leafHeightMode); 
    total += c.subtreeHeight;
    
    // 添加动态间距（除了最后一个子节点）
    if (i < children.length - 1) {
      const dynamicGap = siblingGap + Math.max(0, c.height * 0.1);
      total += dynamicGap;
    }
  }
  
  node.subtreeHeight = Math.max(node.height, total); 
  return node.subtreeHeight;
}

function assignY(node, topY, siblingGap) {
  const children = node.children || [];
  if (children.length === 0) { node.y = topY + (node.subtreeHeight - node.height) / 2; return; }
  
  let childTop = topY; 
  for (let i = 0; i < children.length; i++) { 
    const c = children[i]; 
    assignY(c, childTop, siblingGap); 
    
    // 计算下一个子节点的起始位置，确保有足够的间距
    let nextTop = childTop + c.subtreeHeight;
    
    // 如果还有下一个子节点，添加间距
    if (i < children.length - 1) {
      // 使用动态间距：基础间距 + 当前节点高度的一定比例
      const dynamicGap = siblingGap + Math.max(0, c.height * 0.1);
      nextTop += dynamicGap;
    }
    
    childTop = nextTop;
  }
  
  const first = children[0]; 
  const last = children[children.length - 1];
  const firstCenter = first.y + first.height / 2; 
  const lastCenter = last.y + last.height / 2; 
  const centerY = (firstCenter + lastCenter) / 2; 
  node.y = centerY - node.height / 2;
}

function assignX(node, depth, paddingLeft, baseNodeWidth, levelGap) { node.x = paddingLeft + depth * (baseNodeWidth + levelGap); node.children.forEach(c => assignX(c, depth + 1, paddingLeft, baseNodeWidth, levelGap)); }

function buildLinks(node, links = []) { 
  node.children.forEach(child => { 
    links.push({ 
      x1: node.x + node.width, 
      y1: node.y + node.height / 2, 
      x2: child.x, 
      y2: child.y + child.height / 2,
      isQuestionLink: child.isQuestion || false // 标记是否为问题连线
    }); 
    buildLinks(child, links); 
  }); 
  return links; 
}

function bezierPath({ x1, y1, x2, y2 }) { const dx = Math.max(30, (x2 - x1) * 0.5); const c1x = x1 + dx; const c2x = x2 - dx; return `M ${x1} ${y1} C ${c1x} ${y1}, ${c2x} ${y2}, ${x2} ${y2}`; }

function layout(root) { ensureSize(root); normalize(root); computeSubtreeHeight(root, CONFIG.siblingGap, "self"); assignY(root, CONFIG.paddingTop, CONFIG.siblingGap); assignX(root, 0, CONFIG.paddingLeft, CONFIG.baseNodeWidth, CONFIG.levelGap); return root; }

function collect(node, arr = []) { arr.push(node); node.children.forEach(c => collect(c, arr)); return arr; }

function render(svg, root) {
  svg.innerHTML = "";
  const totalW = CONFIG.paddingLeft + (computeMaxDepth(root) + 1) * (CONFIG.baseNodeWidth + CONFIG.levelGap) + 240;
  const totalH = Math.max(root.subtreeHeight + CONFIG.paddingTop * 2, 600);
  svg.setAttribute("viewBox", `0 0 ${totalW} ${totalH}`);

  const gViewport = document.createElementNS("http://www.w3.org/2000/svg", "g");
  gViewport.setAttribute("id", "viewport");
  gViewport.setAttribute("transform", `translate(${panX}, ${panY}) scale(${zoomScale})`);
  svg.appendChild(gViewport);

  const links = buildLinks(root, []);
  const gLinks = document.createElementNS("http://www.w3.org/2000/svg", "g");
  gLinks.setAttribute("fill", "none");
  gViewport.appendChild(gLinks);

  for (const l of links) { 
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path"); 
    path.setAttribute("class", l.isQuestionLink ? "link question-link" : "link"); 
    path.setAttribute("d", bezierPath(l)); 
    gLinks.appendChild(path); 
  }

  const gNodes = document.createElementNS("http://www.w3.org/2000/svg", "g");
  gViewport.appendChild(gNodes);

  const nodes = collect(root);
  for (const n of nodes) {
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute("class", "node-group");
    g.setAttribute("transform", `translate(${n.x}, ${n.y})`);
    g.setAttribute("data-id", n.id);

    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect"); 
    rect.setAttribute("class", n.isQuestion ? "node-rect question-node" : "node-rect"); 
    rect.setAttribute("x", "0"); 
    rect.setAttribute("y", "0"); 
    rect.setAttribute("width", String(n.width)); 
    rect.setAttribute("height", String(n.height)); 
    g.appendChild(rect);

    const title = document.createElementNS("http://www.w3.org/2000/svg", "text"); 
    title.setAttribute("class", n.isQuestion ? "node-title question-title" : "node-title"); 
    title.setAttribute("x", String(CONFIG.nodePaddingX)); 
    title.setAttribute("y", String(CONFIG.nodePaddingY)); 
    title.textContent = n.title || n.label || ""; 
    g.appendChild(title);

    const innerWidth = Math.max(20, (n.width || CONFIG.baseNodeWidth) - CONFIG.nodePaddingX * 2);
    const wrapped = n._wrappedBodyLines || wrapBodyText(n.body, innerWidth);
    if (wrapped.length > 0) { 
      let y = CONFIG.nodePaddingY + CONFIG.titleLineHeight + CONFIG.titleBodyGap; 
      for (let i = 0; i < wrapped.length; i++) { 
        const line = wrapped[i]; 
        if (line.type === "empty") {
          y += CONFIG.bodyLineHeight;
          continue;
        }
        const t = document.createElementNS("http://www.w3.org/2000/svg", "text"); 
        
        // 根据内容类型设置CSS类
        let className = "node-paragraph";
        if (line.type === "subtitle") {
          className = "node-subtitle";
          if (line.level === 1) className += " node-h1";
          else if (line.level === 2) className += " node-h2";
          else if (line.level === 3) className += " node-h3";
        } else if (line.type === "list") {
          className = "node-list";
        } else if (line.type === "code") {
          className = "node-code";
        } else if (line.type === "code-inline") {
          className = "node-code-inline";
        }
        
        t.setAttribute("class", className); 
        t.setAttribute("x", String(CONFIG.nodePaddingX)); 
        t.setAttribute("y", String(y)); 
        
        // 处理特殊字符和格式
        let displayText = line.text;
        if (line.type === "list") {
          displayText = "• " + displayText;
        } else if (line.type === "code-inline") {
          displayText = "`" + displayText + "`";
        }
        
        // 检查是否需要高亮concepts
        const highlightedParts = highlightConcepts(displayText, n.concepts || []);
        
        if (highlightedParts.length === 1 && !highlightedParts[0].highlighted) {
          // 没有需要高亮的内容，直接显示
          t.textContent = displayText;
          g.appendChild(t);
        } else {
          // 有需要高亮的内容，创建tspan元素
          let currentX = CONFIG.nodePaddingX;
          for (const part of highlightedParts) {
            const tspan = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
            tspan.textContent = part.text;
            tspan.setAttribute("x", String(currentX));
            
            if (part.highlighted) {
              tspan.setAttribute("class", "concept-highlight");
              tspan.setAttribute("data-concept", part.concept);
              
              // 创建下划线动画元素
              const textWidth = TextMeasurer.measure(part.text, CONFIG.fontFamily);
              const underline = document.createElementNS("http://www.w3.org/2000/svg", "line");
              underline.setAttribute("class", "concept-underline");
              underline.setAttribute("x1", String(currentX));
              underline.setAttribute("y1", String(y + CONFIG.bodyLineHeight - 2));
              underline.setAttribute("x2", String(currentX + textWidth));
              underline.setAttribute("y2", String(y + CONFIG.bodyLineHeight - 2));
              underline.setAttribute("data-concept", part.concept);
              // 设置精确的stroke-dasharray值
              underline.setAttribute("stroke-dasharray", String(textWidth));
              underline.setAttribute("stroke-dashoffset", String(textWidth));
              g.appendChild(underline);
            }
            
            t.appendChild(tspan);
            
            // 计算下一个tspan的x位置
            const textWidth = TextMeasurer.measure(part.text, CONFIG.fontFamily);
            currentX += textWidth;
          }
          g.appendChild(t);
        } 
        y += CONFIG.bodyLineHeight; 
      } 
    }

    if ((n._originalChildren && n._originalChildren.length > 0) || (n.children && n.children.length > 0)) {
      const badge = document.createElementNS("http://www.w3.org/2000/svg", "text"); badge.setAttribute("class", "node-badge"); badge.setAttribute("x", String(n.width - 8)); badge.setAttribute("y", String(n.height / 2)); badge.setAttribute("text-anchor", "end"); badge.textContent = n.collapsed ? "+" : "−"; badge.addEventListener("click", (e) => { e.stopPropagation(); toggleNodeById(root, n.id); relayoutAndRender(svg, root); }); g.appendChild(badge);
    }

    // 添加鼠标悬停事件来触发concept高亮动画
    g.addEventListener('mouseenter', () => {
      const conceptUnderlines = g.querySelectorAll('.concept-underline');
      conceptUnderlines.forEach((underline, index) => {
        // 为每个下划线添加延迟，创造波浪效果
        setTimeout(() => {
          // 重置动画
          underline.classList.remove('animate');
          // 使用requestAnimationFrame确保重绘
          requestAnimationFrame(() => {
            // 重新开始动画
            underline.classList.add('animate');
          });
        }, index * 80); // 每个下划线延迟80ms
      });
    });
    
    g.addEventListener('mouseleave', () => {
      const conceptUnderlines = g.querySelectorAll('.concept-underline');
      conceptUnderlines.forEach(underline => {
        underline.classList.remove('animate');
      });
    });

    // 为问题节点添加双击事件
    if (n.isQuestion) {
      g.addEventListener('dblclick', async (e) => {
        e.stopPropagation();
        await handleQuestionNodeDoubleClick(n, root);
      });
    }

    gNodes.appendChild(g);
  }
}

function computeMaxDepth(node, depth = 0) { if (!node.children || node.children.length === 0) return depth; let max = depth; for (const c of node.children) max = Math.max(max, computeMaxDepth(c, depth + 1)); return max; }

function toggleNodeById(root, id) { const node = findNode(root, id); if (!node) return; node.collapsed = !node.collapsed; }

function findNode(node, id) { if (node.id === id) return node; for (const c of node.children) { const found = findNode(c, id); if (found) return found; } return null; }

// 查找节点的父节点
function findParentNode(root, targetNodeId) {
  function searchParent(node, targetId) {
    if (node.children) {
      for (const child of node.children) {
        if (child.id === targetId) {
          return node;
        }
        const found = searchParent(child, targetId);
        if (found) return found;
      }
    }
    return null;
  }
  return searchParent(root, targetNodeId);
}

// 虚拟问题节点双击事件
async function handleQuestionNodeDoubleClick(questionNode, root) {
  try {

    // 显示加载提示
    const loadingMsg = document.createElement('div');
    loadingMsg.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: var(--panel);
      color: var(--text);
      padding: 20px;
      border-radius: 8px;
      border: 1px solid var(--node-border);
      z-index: 1000;
      font-size: 14px;
    `;
    loadingMsg.textContent = '正在生成节点...';
    document.body.appendChild(loadingMsg);
    
    // 查找父节点
    const parentNode = findParentNode(root, questionNode.id);
    if (!parentNode) {
      console.error('未找到父节点');
      document.body.removeChild(loadingMsg);
      alert('未找到父节点');
      return;
    }
    
    console.log('父节点ID:', parentNode.id);
    
    // 调用后端API生成新节点
    const response = await fetch('/nodes/generate-node-by-ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        parentId: parentNode.id,
        title: questionNode.title
      })
    });
    

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    
    const newNodeData = await response.json();
    console.log('新节点创建成功:', newNodeData);
    
    // 更新加载提示
    loadingMsg.textContent = '正在重新加载数据...';
    
    // 重新加载数据并渲染
    await reloadAndRender();
    
    // 移除加载提示
    document.body.removeChild(loadingMsg);
    
    // 显示成功提示
    const successMsg = document.createElement('div');
    successMsg.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--primary);
      color: white;
      padding: 12px 20px;
      border-radius: 6px;
      z-index: 1000;
      font-size: 14px;
    `;
    successMsg.textContent = '节点生成成功！';
    document.body.appendChild(successMsg);
    
    // 3秒后移除成功提示
    setTimeout(() => {
      if (document.body.contains(successMsg)) {
        document.body.removeChild(successMsg);
      }
    }, 3000);
    
  } catch (error) {
    console.error('处理问题节点双击失败:', error);
    
    // 移除加载提示
    const loadingMsg = document.querySelector('div[style*="position: fixed"]');
    if (loadingMsg) {
      document.body.removeChild(loadingMsg);
    }
    
    // 显示错误提示
    alert('生成节点失败: ' + error.message);
  }
}

// 重新加载数据并渲染
async function reloadAndRender() {
  try {
    const newRoot = await buildSampleData();
    root = deepClone(newRoot);
    relayoutAndRender(svg, root);
    console.log('数据重新加载完成');
  } catch (error) {
    console.error('重新加载数据失败:', error);
    alert('重新加载数据失败: ' + error.message);
  }
}

function addQuestionNode(root, parentId) {
  const parentNode = findNode(root, parentId);
  if (!parentNode) return;
  
  const newId = generateUniqueId();
  const questionNode = makeNode(newId, "产品规划", "目标：清晰战略与节奏，确保可持续交付。\n覆盖市场-研发-增长全链路。");
  
  if (!parentNode.children) {
    parentNode.children = [];
  }
  parentNode.children.push(questionNode);
  
  return questionNode;
}

function relayoutAndRender(svg, root) { layout(root); render(svg, root); updateZoomLabel(); }

function updateZoomLabel() { const btn = document.getElementById("zoomResetBtn"); btn.textContent = Math.round(zoomScale * 100) + "%"; }

function applyZoom(delta) {
  zoomScale = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoomScale + delta));
  const viewport = document.getElementById("viewport");
  if (viewport) viewport.setAttribute("transform", `translate(${panX}, ${panY}) scale(${zoomScale})`);
  updateZoomLabel();
}

function setupPanning(svg) {
  let isDragging = false;
  let startClientX = 0, startClientY = 0;
  let startPanX = 0, startPanY = 0;

  function toSvgDelta(dx, dy) { return { sx: dx / zoomScale, sy: dy / zoomScale }; }

  function onDown(e) {
    const target = e.target; if (target && target.classList && target.classList.contains('node-badge')) return;
    isDragging = true; svg.classList.add('dragging');
    startClientX = (e.touches ? e.touches[0].clientX : e.clientX);
    startClientY = (e.touches ? e.touches[0].clientY : e.clientY);
    startPanX = panX; startPanY = panY;
  }

  function onMove(e) {
    if (!isDragging) return;
    const clientX = (e.touches ? e.touches[0].clientX : e.clientX);
    const clientY = (e.touches ? e.touches[0].clientY : e.clientY);
    const dx = clientX - startClientX; const dy = clientY - startClientY;
    const { sx, sy } = toSvgDelta(dx, dy);
    panX = startPanX + sx; panY = startPanY + sy;
    const viewport = document.getElementById('viewport'); if (viewport) viewport.setAttribute('transform', `translate(${panX}, ${panY}) scale(${zoomScale})`);
  }

  function onUp() { if (!isDragging) return; isDragging = false; svg.classList.remove('dragging'); }

  // 鼠标滚轮缩放功能
  function onWheel(e) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
    applyZoom(delta);
  }

  svg.addEventListener('mousedown', onDown);
  svg.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onUp);
  svg.addEventListener('wheel', onWheel, { passive: false });
  svg.addEventListener('touchstart', onDown, { passive: true });
  svg.addEventListener('touchmove', onMove, { passive: true });
  window.addEventListener('touchend', onUp);
}

const svg = document.getElementById("canvas");
const zoomInBtn = document.getElementById("zoomInBtn");
const zoomOutBtn = document.getElementById("zoomOutBtn");
const zoomResetBtn = document.getElementById("zoomResetBtn");



// 异步初始化数据
async function initializeData() {
  let original = await buildSampleData();
  let root = deepClone(original);

  relayoutAndRender(svg, root);
  setupPanning(svg);
  
  // 设置事件监听器
  zoomInBtn.addEventListener("click", () => applyZoom(+ZOOM_STEP));
  zoomOutBtn.addEventListener("click", () => applyZoom(-ZOOM_STEP));
  zoomResetBtn.addEventListener("click", () => { zoomScale = 1; applyZoom(0); });
}

// 启动初始化
initializeData();

