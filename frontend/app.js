const CONFIG = {
  levelGap: 120,
  baseNodeWidth: 420,
  baseNodeHeight: 40,
  siblingGap: 22,
  paddingTop: 24,
  paddingLeft: 24,
  nodePaddingX: 12,
  nodePaddingY: 10,
  titleBodyGap: 20,
  titleLineHeight: 15,
  bodyLineHeight: 10,
  minNodeHeight: 36,
  minCollapsedHeight: 28,
  fontFamily: "12px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial"
};

// 配置Markdown解析器
if (typeof marked !== 'undefined') {
  marked.setOptions({
    highlight: function(code, lang) {
      if (typeof hljs === 'undefined') {
        return code;
      }
      
      if (lang && hljs.getLanguage(lang)) {
        try {
          return hljs.highlight(code, { language: lang }).value;
        } catch (err) {
          console.warn('代码高亮失败:', err);
          return code;
        }
      }
      try {
        return hljs.highlightAuto(code).value;
      } catch (err) {
        console.warn('自动代码高亮失败:', err);
        return code;
      }
    },
    breaks: true,
    gfm: true
  });
} else {
  console.warn('marked.js 未加载，Markdown功能将不可用');
}

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
  
  // 检测是否为Markdown格式
  const isMarkdown = /^#+\s|^\*\s|^\d+\.\s|```|`[^`]+`|\[.*\]\(.*\)|!\[.*\]\(.*\)/.test(body);
  
  if (isMarkdown) {
    // 使用Markdown解析
    return parseMarkdownContent(body);
  } else {
    // 使用原有的简单解析
    return parsePlainTextContent(body);
  }
}

function parseMarkdownContent(body) {
  try {
    // 检查marked是否可用
    if (typeof marked === 'undefined') {
      console.warn('marked.js 未加载，回退到纯文本解析');
      return parsePlainTextContent(body);
    }
    
    // 使用marked解析Markdown
    const html = marked.parse(body);
    
    // 将HTML转换为适合SVG的格式
    const content = [];
    const lines = body.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line === "") {
        content.push({ type: "empty", text: "" });
      } else if (line.startsWith("###")) {
        // 三级标题
        content.push({ type: "subtitle", text: line.substring(3).trim(), level: 3 });
      } else if (line.startsWith("##")) {
        // 二级标题
        content.push({ type: "subtitle", text: line.substring(2).trim(), level: 2 });
      } else if (line.startsWith("#")) {
        // 一级标题
        content.push({ type: "subtitle", text: line.substring(1).trim(), level: 1 });
      } else if (line.startsWith("- ") || line.startsWith("* ")) {
        // 列表项
        content.push({ type: "list", text: line.substring(2).trim() });
      } else if (/^\d+\.\s/.test(line)) {
        // 有序列表
        content.push({ type: "list", text: line.replace(/^\d+\.\s/, "").trim() });
      } else if (line.startsWith("```")) {
        // 代码块开始/结束
        content.push({ type: "code", text: line });
      } else if (line.startsWith("`") && line.endsWith("`")) {
        // 行内代码
        content.push({ type: "code-inline", text: line.substring(1, line.length - 1) });
      } else {
        // 普通段落
        content.push({ type: "paragraph", text: line });
      }
    }
    
    return content;
  } catch (error) {
    console.error('Markdown解析失败:', error);
    // 回退到纯文本解析
    return parsePlainTextContent(body);
  }
}

function parsePlainTextContent(body) {
  const lines = body.split("\n");
  const content = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line === "") {
      content.push({ type: "empty", text: "" });
    } else if (line.startsWith("##")) {
      // 子标题：以 ## 开头
      content.push({ type: "subtitle", text: line.substring(2).trim() });
    } else if (line.startsWith("#")) {
      // 子标题：以 # 开头
      content.push({ type: "subtitle", text: line.substring(1).trim() });
    } else {
      // 普通段落
      content.push({ type: "paragraph", text: line });
    }
  }
  
  return content;
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

function makeNode(id, title, body = "", children = [], height) {
  return { id, title, body, children, collapsed: false, width: CONFIG.baseNodeWidth, height: height ?? undefined, x: 0, y: 0, subtreeHeight: 0, _wrappedBodyLines: undefined };
}

function generateUniqueId() {
  return 'node_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function buildSampleData() {
  var rc = '# 市场洞察\n\n## 核心目标\n用户画像、痛点聚合、需求优先级。\n\n### 研究方法\n通过定性与定量结合形成决策依据。\n\n#### 数据来源\n1. 用户访谈（N=50）\n2. 问卷调查（N=1000）\n3. 行为数据分析\n\n### 关键指标\n- 用户满意度 > 85%\n- 市场占有率提升 20%\n- 竞品对比分析';
  return makeNode("root", "产品规划", rc, [/*
    makeNode("a", "市场洞察", "# 市场洞察\n\n## 核心目标\n用户画像、痛点聚合、需求优先级。\n\n### 研究方法\n通过定性与定量结合形成决策依据。\n\n#### 数据来源\n1. 用户访谈（N=50）\n2. 问卷调查（N=1000）\n3. 行为数据分析\n\n### 关键指标\n- 用户满意度 > 85%\n- 市场占有率提升 20%\n- 竞品对比分析", [
      makeNode("a1", "用户调研", "# 用户调研计划\n\n## 调研方法\n- 访谈：N=20 深度访谈\n- 问卷：N=300 在线调研\n- 观察：用户行为分析\n\n### 核心发现\n1. **核心诉求**：易用性、性能、价格\n2. **流失原因**：功能缺失、学习成本高\n3. **替代方案偏好**：竞品A、竞品B\n\n### 技术实现\n```javascript\nconst surveyData = {\n  total: 300,\n  completion: 0.85,\n  satisfaction: 4.2\n};\n```\n\n## 下一步行动\n基于调研结果优化产品功能。"),
      makeNode("a2", "竞品分析", "# 分析维度\n功能覆盖度、定价、渠道、增长机制与差异化定位。", [
        makeNode("a21", "功能矩阵", "# 功能分类\n必选/可选能力映射，找差距并形成跟进计划。\n\n## 优先级排序\n根据用户价值和实现难度排序。"),
        makeNode("a22", "价格策略", "# 定价模式\n分层定价（免费/专业/企业），试用期与转化路径设计。\n\n## 价格测试\nA/B测试不同价格点的转化率。"),
        makeNode("a23", "渠道策略", "# 渠道布局\nSEO、内容、合作、口碑循环，构建可复用增长资产。\n\n## 渠道效果\n跟踪各渠道的获客成本和转化率。")
      ]),
    ]),
    makeNode("b", "路线图", "# 规划原则\n将目标拆解为季度节奏，纳入风险与缓冲，保证节拍不失真。\n\n## 里程碑\n每个季度设定关键里程碑和验收标准。", [
      makeNode("b1", "Q1", "# 核心目标\nMVP 收敛与首批种子用户小规模试用。\n\n## 关键任务\n产品功能完善、用户反馈收集、数据验证。", [
        makeNode("b11", "MVP 定义", "# 定义标准\n可用、可测、可增长的最小集合，确保闭环可验证。\n\n## 功能清单\n核心功能列表和优先级排序。"),
        makeNode("b12", "可用性测试", "# 测试目标\n任务完成率≥80%，主流程<3 步，关键指标显著提升。\n\n## 测试计划\n用户测试流程和评估标准。")
      ]),
      makeNode("b2", "Q2", "# 重点方向\n支付/增长闭环，围绕留存打造价值回访。\n\n## 增长策略\n用户获取、激活、留存的全链路优化。", [
        makeNode("b21", "支付整合", "# 技术方案\nApple/Stripe，订单/退款/对账与税务合规\n\n## 安全考虑\n数据加密、PCI合规、风险控制。")
      ]),
      makeNode("b3", "Q3", "# 战略目标\n生态与合作，探索平台化能力与伙伴共赢。\n\n## 合作方向\n技术合作、渠道合作、生态建设。")
    ]),
    makeNode("c", "交付与增长", "# 核心策略\n发布、稳定性、飞轮：获取-激活-留存-变现-传播，形成正反馈。\n\n## 关键指标\n用户增长、留存率、收入增长、用户满意度。", [
      makeNode("c1", "上线准备", "# 发布清单\n发布清单、监控、回滚脚本；预案演练与演习复盘。\n\n## 风险控制\n应急预案、回滚策略、监控告警。"),
      makeNode("c2", "监控预警", "# 监控体系\nSLA、告警阈值、看板：问题可观测、可定位、可恢复。\n\n## 告警策略\n分级告警、自动恢复、人工介入。"),
      makeNode("c3", "增长循环", "# 增长引擎\n实验平台与指标体系，快速迭代并持续复盘。\n\n## 数据驱动\n基于数据决策，持续优化产品体验。", [
        makeNode("c31", "A/B 实验", "# 实验设计\n注册转化、首日留存，样本量与显著性控制。\n\n## 实验流程\n假设提出、实验设计、结果分析、决策执行。"),
        makeNode("c32", "留存提升", "# 留存策略\n触达/激励/价值回访，基于分层用户画像制定策略。\n\n## 用户分层\n新用户、活跃用户、流失用户的不同策略。")
      ])
    ])*/
  ]);
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
  let total = 0; for (let i = 0; i < children.length; i++) { const c = children[i]; computeSubtreeHeight(c, siblingGap, leafHeightMode); total += c.subtreeHeight; }
  total += siblingGap * (children.length - 1); node.subtreeHeight = Math.max(node.height, total); return node.subtreeHeight;
}

function assignY(node, topY, siblingGap) {
  const children = node.children || [];
  if (children.length === 0) { node.y = topY + (node.subtreeHeight - node.height) / 2; return; }
  let childTop = topY; for (let i = 0; i < children.length; i++) { const c = children[i]; assignY(c, childTop, siblingGap); childTop += c.subtreeHeight + siblingGap; }
  const first = children[0]; const last = children[children.length - 1];
  const firstCenter = first.y + first.height / 2; const lastCenter = last.y + last.height / 2; const centerY = (firstCenter + lastCenter) / 2; node.y = centerY - node.height / 2;
}

function assignX(node, depth, paddingLeft, baseNodeWidth, levelGap) { node.x = paddingLeft + depth * (baseNodeWidth + levelGap); node.children.forEach(c => assignX(c, depth + 1, paddingLeft, baseNodeWidth, levelGap)); }

function buildLinks(node, links = []) { node.children.forEach(child => { links.push({ x1: node.x + node.width, y1: node.y + node.height / 2, x2: child.x, y2: child.y + child.height / 2 }); buildLinks(child, links); }); return links; }

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

  for (const l of links) { const path = document.createElementNS("http://www.w3.org/2000/svg", "path"); path.setAttribute("class", "link"); path.setAttribute("d", bezierPath(l)); gLinks.appendChild(path); }

  const gNodes = document.createElementNS("http://www.w3.org/2000/svg", "g");
  gViewport.appendChild(gNodes);

  const nodes = collect(root);
  for (const n of nodes) {
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute("class", "node-group");
    g.setAttribute("transform", `translate(${n.x}, ${n.y})`);
    g.setAttribute("data-id", n.id);

    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect"); rect.setAttribute("class", "node-rect"); rect.setAttribute("x", "0"); rect.setAttribute("y", "0"); rect.setAttribute("width", String(n.width)); rect.setAttribute("height", String(n.height)); g.appendChild(rect);

    const title = document.createElementNS("http://www.w3.org/2000/svg", "text"); title.setAttribute("class", "node-title"); title.setAttribute("x", String(CONFIG.nodePaddingX)); title.setAttribute("y", String(CONFIG.nodePaddingY)); title.textContent = n.title || n.label || ""; g.appendChild(title);

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
        
        t.textContent = displayText; 
        g.appendChild(t); 
        y += CONFIG.bodyLineHeight; 
      } 
    }

    if ((n._originalChildren && n._originalChildren.length > 0) || (n.children && n.children.length > 0)) {
      const badge = document.createElementNS("http://www.w3.org/2000/svg", "text"); badge.setAttribute("class", "node-badge"); badge.setAttribute("x", String(n.width - 8)); badge.setAttribute("y", String(n.height / 2)); badge.setAttribute("text-anchor", "end"); badge.textContent = n.collapsed ? "+" : "−"; badge.addEventListener("click", (e) => { e.stopPropagation(); toggleNodeById(root, n.id); relayoutAndRender(svg, root); }); g.appendChild(badge);
    }

    // 添加追问按钮
    const questionBtn = document.createElementNS("http://www.w3.org/2000/svg", "text");
    questionBtn.setAttribute("class", "node-question-btn");
    questionBtn.setAttribute("x", String(n.width / 2));
    questionBtn.setAttribute("y", String(n.height - 8));
    questionBtn.setAttribute("text-anchor", "middle");
    questionBtn.textContent = "追问";
    questionBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      addQuestionNode(root, n.id);
      relayoutAndRender(svg, root);
    });
    g.appendChild(questionBtn);

    gNodes.appendChild(g);
  }
}

function computeMaxDepth(node, depth = 0) { if (!node.children || node.children.length === 0) return depth; let max = depth; for (const c of node.children) max = Math.max(max, computeMaxDepth(c, depth + 1)); return max; }

function toggleNodeById(root, id) { const node = findNode(root, id); if (!node) return; node.collapsed = !node.collapsed; }

function findNode(node, id) { if (node.id === id) return node; for (const c of node.children) { const found = findNode(c, id); if (found) return found; } return null; }

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

  svg.addEventListener('mousedown', onDown);
  svg.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onUp);
  svg.addEventListener('touchstart', onDown, { passive: true });
  svg.addEventListener('touchmove', onMove, { passive: true });
  window.addEventListener('touchend', onUp);
}

const svg = document.getElementById("canvas");
const resetBtn = document.getElementById("resetBtn");
const randomBtn = document.getElementById("randomBtn");
const addNodeBtn = document.getElementById("addNodeBtn");
const zoomInBtn = document.getElementById("zoomInBtn");
const zoomOutBtn = document.getElementById("zoomOutBtn");
const zoomResetBtn = document.getElementById("zoomResetBtn");

// 弹窗相关元素
const addNodeModal = document.getElementById("addNodeModal");
const addNodeForm = document.getElementById("addNodeForm");
const cancelBtn = document.getElementById("cancelBtn");
const closeBtn = document.querySelector(".close");

// 弹窗控制函数
function openModal() {
  addNodeModal.style.display = "block";
  // 清空表单
  addNodeForm.reset();
  // 设置默认值
  document.getElementById("parentNodeId").value = "root";
  document.getElementById("currentNodeId").value = generateUniqueId();
  
  // 更新父节点ID的提示信息
  updateParentNodeHint();
}

function updateParentNodeHint() {
  const parentIdInput = document.getElementById("parentNodeId");
  const allIds = getAllNodeIds(root);
  const hint = `可用节点ID: ${allIds.join(", ")}`;
  parentIdInput.placeholder = hint;
}

function closeModal() {
  addNodeModal.style.display = "none";
}

function addCustomNode(parentId, nodeId, title, body) {
  const parentNode = findNode(root, parentId);
  if (!parentNode) {
    alert("未找到指定的父节点ID: " + parentId);
    return false;
  }
  
  const newNode = makeNode(nodeId, title, body);
  
  if (!parentNode.children) {
    parentNode.children = [];
  }
  parentNode.children.push(newNode);
  
  return true;
}

// 获取所有节点ID列表，用于用户参考
function getAllNodeIds(node, ids = []) {
  ids.push(node.id);
  if (node.children) {
    node.children.forEach(child => getAllNodeIds(child, ids));
  }
  return ids;
}

let original = buildSampleData();
let root = deepClone(original);

relayoutAndRender(svg, root);
setupPanning(svg);

resetBtn.addEventListener("click", () => { root = deepClone(original); relayoutAndRender(svg, root); });
randomBtn.addEventListener("click", () => { const nodes = collect(root, []); const candidates = nodes.filter(n => (n.children && n.children.length > 0) || n._originalChildren); const k = Math.max(1, Math.floor(candidates.length * 0.3)); for (let i = 0; i < k; i++) { const idx = Math.floor(Math.random() * candidates.length); candidates[idx].collapsed = !candidates[idx].collapsed; } relayoutAndRender(svg, root); });
addNodeBtn.addEventListener("click", openModal);
zoomInBtn.addEventListener("click", () => applyZoom(+ZOOM_STEP));
zoomOutBtn.addEventListener("click", () => applyZoom(-ZOOM_STEP));
zoomResetBtn.addEventListener("click", () => { zoomScale = 1; applyZoom(0); });

// 弹窗事件监听器
closeBtn.addEventListener("click", closeModal);
cancelBtn.addEventListener("click", closeModal);

// 点击弹窗外部关闭弹窗
addNodeModal.addEventListener("click", (e) => {
  if (e.target === addNodeModal) {
    closeModal();
  }
});

// 表单提交处理
addNodeForm.addEventListener("submit", (e) => {
  e.preventDefault();
  
  const formData = new FormData(addNodeForm);
  const parentId = formData.get("parentNodeId").trim();
  const nodeId = formData.get("currentNodeId").trim();
  const title = formData.get("nodeTitle").trim();
  const body = formData.get("nodeBody").trim();
  
  if (!parentId || !nodeId || !title) {
    alert("请填写所有必填字段");
    return;
  }
  
  if (addCustomNode(parentId, nodeId, title, body)) {
    closeModal();
    relayoutAndRender(svg, root);
    alert("节点添加成功！");
  }
});

// ESC键关闭弹窗
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && addNodeModal.style.display === "block") {
    closeModal();
  }
});
