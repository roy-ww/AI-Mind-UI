const CONFIG = {
  levelGap: 120,
  baseNodeWidth: 220,
  baseNodeHeight: 40,
  siblingGap: 22,
  paddingTop: 24,
  paddingLeft: 24,
  nodePaddingX: 12,
  nodePaddingY: 10,
  titleBodyGap: 6,
  titleLineHeight: 20,
  bodyLineHeight: 16,
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

function wrapBodyText(body, innerWidth) {
  const paragraphs = (body || "").split("\n");
  const allLines = [];
  for (let i = 0; i < paragraphs.length; i++) {
    const p = paragraphs[i]; const lines = wrapParagraph(p, innerWidth); allLines.push(...lines); if (i !== paragraphs.length - 1) allLines.push("");
  }
  while (allLines.length > 0 && allLines[allLines.length - 1] === "") allLines.pop();
  return allLines;
}

function makeNode(id, title, body = "", children = [], height) {
  return { id, title, body, children, collapsed: false, width: CONFIG.baseNodeWidth, height: height ?? undefined, x: 0, y: 0, subtreeHeight: 0, _wrappedBodyLines: undefined };
}

function buildSampleData() {
  return makeNode("root", "产品规划", "目标：清晰战略与节奏，确保可持续交付。\n覆盖市场-研发-增长全链路。", [
    makeNode("a", "市场洞察", "用户画像、痛点聚合、需求优先级。通过定性与定量结合形成决策依据。", [
      makeNode("a1", "用户调研", "访谈 N=20；问卷 N=300。核心诉求、流失原因与替代方案偏好。"),
      makeNode("a2", "竞品分析", "功能覆盖度、定价、渠道、增长机制与差异化定位。", [
        makeNode("a21", "功能矩阵", "必选/可选能力映射，找差距并形成跟进计划。"),
        makeNode("a22", "价格策略", "分层定价（免费/专业/企业），试用期与转化路径设计。"),
        makeNode("a23", "渠道策略", "SEO、内容、合作、口碑循环，构建可复用增长资产。")
      ]),
    ]),
    makeNode("b", "路线图", "将目标拆解为季度节奏，纳入风险与缓冲，保证节拍不失真。", [
      makeNode("b1", "Q1", "MVP 收敛与首批种子用户小规模试用。", [
        makeNode("b11", "MVP 定义", "可用、可测、可增长的最小集合，确保闭环可验证。"),
        makeNode("b12", "可用性测试", "任务完成率≥80%，主流程<3 步，关键指标显著提升。")
      ]),
      makeNode("b2", "Q2", "支付/增长闭环，围绕留存打造价值回访。", [
        makeNode("b21", "支付整合", "Apple/Stripe，订单/退款/对账与税务合规 handlingSuperLongEnglishWordWithoutAnySpacesToTestHardWrapAndEnsureWeBreakCorrectly")
      ]),
      makeNode("b3", "Q3", "生态与合作，探索平台化能力与伙伴共赢。")
    ]),
    makeNode("c", "交付与增长", "发布、稳定性、飞轮：获取-激活-留存-变现-传播，形成正反馈。", [
      makeNode("c1", "上线准备", "发布清单、监控、回滚脚本；预案演练与演习复盘。"),
      makeNode("c2", "监控预警", "SLA、告警阈值、看板：问题可观测、可定位、可恢复。"),
      makeNode("c3", "增长循环", "实验平台与指标体系，快速迭代并持续复盘。", [
        makeNode("c31", "A/B 实验", "注册转化、首日留存，样本量与显著性控制。"),
        makeNode("c32", "留存提升", "触达/激励/价值回访，基于分层用户画像制定策略。")
      ])
    ])
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
    if (wrapped.length > 0) { let y = CONFIG.nodePaddingY + CONFIG.titleLineHeight + CONFIG.titleBodyGap; for (let i = 0; i < wrapped.length; i++) { const line = wrapped[i]; const t = document.createElementNS("http://www.w3.org/2000/svg", "text"); t.setAttribute("class", "node-body"); t.setAttribute("x", String(CONFIG.nodePaddingX)); t.setAttribute("y", String(y)); t.textContent = line; g.appendChild(t); y += CONFIG.bodyLineHeight; } }

    if ((n._originalChildren && n._originalChildren.length > 0) || (n.children && n.children.length > 0)) {
      const badge = document.createElementNS("http://www.w3.org/2000/svg", "text"); badge.setAttribute("class", "node-badge"); badge.setAttribute("x", String(n.width - 8)); badge.setAttribute("y", String(n.height / 2)); badge.setAttribute("text-anchor", "end"); badge.textContent = n.collapsed ? "+" : "−"; badge.addEventListener("click", (e) => { e.stopPropagation(); toggleNodeById(root, n.id); relayoutAndRender(svg, root); }); g.appendChild(badge);
    }

    gNodes.appendChild(g);
  }
}

function computeMaxDepth(node, depth = 0) { if (!node.children || node.children.length === 0) return depth; let max = depth; for (const c of node.children) max = Math.max(max, computeMaxDepth(c, depth + 1)); return max; }

function toggleNodeById(root, id) { const node = findNode(root, id); if (!node) return; node.collapsed = !node.collapsed; }

function findNode(node, id) { if (node.id === id) return node; for (const c of node.children) { const found = findNode(c, id); if (found) return found; } return null; }

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
const zoomInBtn = document.getElementById("zoomInBtn");
const zoomOutBtn = document.getElementById("zoomOutBtn");
const zoomResetBtn = document.getElementById("zoomResetBtn");

let original = buildSampleData();
let root = deepClone(original);

relayoutAndRender(svg, root);
setupPanning(svg);

resetBtn.addEventListener("click", () => { root = deepClone(original); relayoutAndRender(svg, root); });
randomBtn.addEventListener("click", () => { const nodes = collect(root, []); const candidates = nodes.filter(n => (n.children && n.children.length > 0) || n._originalChildren); const k = Math.max(1, Math.floor(candidates.length * 0.3)); for (let i = 0; i < k; i++) { const idx = Math.floor(Math.random() * candidates.length); candidates[idx].collapsed = !candidates[idx].collapsed; } relayoutAndRender(svg, root); });
zoomInBtn.addEventListener("click", () => applyZoom(+ZOOM_STEP));
zoomOutBtn.addEventListener("click", () => applyZoom(-ZOOM_STEP));
zoomResetBtn.addEventListener("click", () => { zoomScale = 1; applyZoom(0); });
