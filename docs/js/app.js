/**
 * 怀来县教育信息化资源库 - 应用逻辑
 * 负责：图标映射、导航渲染、页面渲染、搜索、路由
 */

// 图标库（inline SVG）
const ICONS = {
  home: '<path d="M3 10.5L12 3l9 7.5"></path><path d="M5 9.5V21h14V9.5"></path><path d="M9 21v-6h6v6"></path>',
  book: '<path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v18H6.5A2.5 2.5 0 0 0 4 22V4.5z"></path><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>',
  award: '<circle cx="12" cy="8" r="5"></circle><path d="M8.2 12.5L7 22l5-3 5 3-1.2-9.5"></path>',
  users: '<path d="M16 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 20v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>',
  cpu: '<rect x="6" y="6" width="12" height="12" rx="2"></rect><path d="M9 1v4M15 1v4M9 19v4M15 19v4M1 9h4M1 15h4M19 9h4M19 15h4"></path>',
  flask: '<path d="M9 2h6"></path><path d="M10 2v7l-5.5 9A2 2 0 0 0 6.3 21h11.4a2 2 0 0 0 1.8-3L14 9V2"></path><path d="M7 15h10"></path>',
  building: '<rect x="4" y="3" width="16" height="18" rx="1"></rect><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2"></path><path d="M10 21v-3h4v3"></path>',
  network: '<circle cx="12" cy="5" r="2.5"></circle><circle cx="5" cy="19" r="2.5"></circle><circle cx="19" cy="19" r="2.5"></circle><path d="M12 7.5v4M10.4 13.3L6.4 17M13.6 13.3l4 3.7"></path>',
  arrow: '<path d="M5 12h14"></path><path d="M13 6l6 6-6 6"></path>'
};

function icon(name, cls = "") {
  return '<svg class="' + cls + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[name] || ICONS.book) + '</svg>';
}

let currentPage = "home";

// 渲染侧边导航
function renderNav() {
  const nav = document.getElementById('nav');
  let html = '';
  NAV.forEach(group => {
    html += '<div class="nav-group"><div class="nav-group-title">' + group.group + '</div>';
    group.items.forEach(item => {
      const active = item.id === currentPage ? ' active' : '';
      html += '<div class="nav-item' + active + '" data-id="' + item.id + '">' + icon(item.icon) + '<span>' + item.label + '</span></div>';
    });
    html += '</div>';
  });
  nav.innerHTML = html;
  nav.querySelectorAll('.nav-item').forEach(el => {
    el.addEventListener('click', () => navigate(el.dataset.id));
  });
}

// 生成清单 HTML
function checklistHTML(page) {
  if (!page.checklist) return '';
  let rows = '';
  page.checklist.forEach((item, idx) => {
    const name = Array.isArray(item) ? item[0] : item.name;
    const status = Array.isArray(item) ? item[1] : item.status;
    const hasContent = !Array.isArray(item) && !!item.content;
    if (hasContent) {
      const done = status === '已归档';
      rows += '<button class="check-item check-btn" data-idx="' + idx + '">' +
        '<span class="check-name"><span class="check-dot done"></span>' + name + '</span>' +
        '<span class="check-open">查看内容' + icon('arrow') + '</span>' +
      '</button>';
    } else {
      rows += '<div class="check-item"><span class="check-name"><span class="check-dot"></span>' + name + '</span><span class="status-tag">' + status + '</span></div>';
    }
  });
  return '<section class="panel"><div class="panel-title">归集清单</div><div class="checklist">' + rows + '</div></section>';
}

// 生成详情弹窗 HTML
function modalHTML() {
  return '<div class="modal" id="modal" aria-hidden="true">' +
    '<div class="modal-backdrop" data-close="1"></div>' +
    '<div class="modal-dialog" role="dialog" aria-modal="true" aria-labelledby="modalTitle">' +
      '<div class="modal-head">' +
        '<div class="modal-eyebrow" id="modalEyebrow"></div>' +
        '<h2 class="modal-title" id="modalTitle"></h2>' +
        '<button class="modal-close" data-close="1" aria-label="关闭">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"></path></svg>' +
        '</button>' +
      '</div>' +
      '<div class="modal-body" id="modalBody"></div>' +
      '<div class="modal-foot"><button class="modal-close-btn" data-close="1">关闭</button></div>' +
    '</div>' +
  '</div>';
}

// 打开详情弹窗
function openModal(item) {
  const c = item.content;
  document.getElementById('modalEyebrow').textContent = item.name;
  document.getElementById('modalTitle').textContent = c.title;
  let body = '<div class="modal-meta">' + (c.meta || []).map(m => '<span>' + m + '</span>').join('') + '</div>';
  (c.sections || []).forEach(s => {
    body += '<div class="modal-section"><h3>' + s.heading + '</h3><p>' + s.body + '</p></div>';
  });
  if (c.attachments && c.attachments.length) {
    body += '<div class="modal-section"><h3>相关附件</h3><ul class="modal-files">' +
      c.attachments.map(a => '<li><span class="file-ico">' + icon('book') + '</span>' + a + '</li>').join('') + '</ul></div>';
  }
  if (c.note) body += '<div class="modal-note">' + c.note + '</div>';
  document.getElementById('modalBody').innerHTML = body;
  const modal = document.getElementById('modal');
  modal.classList.add('show');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

// 关闭详情弹窗
function closeModal() {
  const modal = document.getElementById('modal');
  if (!modal) return;
  modal.classList.remove('show');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

// 生成表格 HTML
function tableHTML(table) {
  if (!table) return '';
  let head = table.head.map(h => '<th>' + h + '</th>').join('');
  let body = table.rows.map(row => '<tr>' + row.map(c => '<td>' + c + '</td>').join('') + '</tr>').join('');
  return '<section class="panel"><div class="panel-title">' + table.title + '</div><div class="table-wrap"><table><thead><tr>' + head + '</tr></thead><tbody>' + body + '</tbody></table></div></section>';
}

// 生成链接 HTML
function linksHTML(page) {
  if (!page.links || !page.links.length) return '';
  let items = page.links.map(l => '<li>' + l + '</li>').join('');
  return '<section class="panel"><div class="panel-title">相关链接</div><ul class="links">' + items + '</ul></section>';
}

// 生成首页
function homeHTML(page) {
  let stats = page.stats.map(s =>
    '<div class="stat"><div class="stat-value">' + s.value + '</div><div class="stat-label">' + s.label + '</div><div class="stat-sub">' + s.sub + '</div></div>'
  ).join('');

  let cardsHtml = '';
  (page.sections || []).forEach(sec => {
    let cards = (sec.cards || []).map(c =>
      '<button class="card" data-target="' + c.target + '">' +
        '<div class="card-icon ' + c.tone + '">' + icon(c.icon) + '</div>' +
        '<div class="card-title">' + c.title + '</div>' +
        '<div class="card-desc">' + c.desc + '</div>' +
        '<span class="card-more">进入板块' + icon('arrow') + '</span>' +
      '</button>'
    ).join('');
    cardsHtml += '<section class="section"><div class="section-title">' + sec.title + '</div><div class="cards">' + cards + '</div></section>';
  });

  return headHTML(page) + '<div class="stats">' + stats + '</div>' + cardsHtml;
}

// 生成通用页面头部
function headHTML(page) {
  return '<div class="page-head">' +
    '<div class="eyebrow">' + page.eyebrow + '</div>' +
    '<h1 class="page-title">' + page.heading + '</h1>' +
    '<p class="lead">' + page.lead + '</p>' +
  '</div>';
}

// 渲染内容区
function renderContent() {
  const page = PAGES[currentPage];
  const el = document.getElementById('content');
  if (!page) {
    el.innerHTML = '<div class="empty"><div class="empty-title">页面不存在</div></div>';
    return;
  }
  let html = '';
  if (page.kind === 'home') {
    html = homeHTML(page);
  } else {
    html = headHTML(page) + checklistHTML(page) + tableHTML(page.table);
    if (page.table2) html += tableHTML(page.table2);
    if (page.points) {
      html += '<section class="panel"><div class="panel-title">工作要点</div><div class="points">' +
        page.points.map(p => '<span class="point">' + p + '</span>').join('') + '</div></section>';
    }
    html += linksHTML(page);
  }
  el.innerHTML = html + modalHTML();
  el.querySelectorAll('.card').forEach(btn => {
    btn.addEventListener('click', () => navigate(btn.dataset.target));
  });
  el.querySelectorAll('.check-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = PAGES[currentPage].checklist[Number(btn.dataset.idx)];
      if (item && item.content) openModal(item);
    });
  });
  el.querySelectorAll('[data-close]').forEach(el2 => {
    el2.addEventListener('click', closeModal);
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 导航切换
function navigate(id) {
  if (!PAGES[id]) return;
  currentPage = id;
  renderNav();
  renderContent();
  history.replaceState(null, '', '#' + id);
}

// 搜索：匹配页面标题/正文，跳转首个结果
function initSearch() {
  const input = document.getElementById('searchInput');
  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    if (!q) return;
    const keys = Object.keys(PAGES);
    const hit = keys.find(k => {
      const p = PAGES[k];
      const text = (p.title + p.heading + p.lead + (p.checklist || []).map(x => x[0]).join('')).toLowerCase();
      return text.includes(q);
    });
    if (hit) navigate(hit);
  });
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); input.blur(); }
  });
}

// 初始化
function init() {
  const hash = location.hash.replace('#', '');
  if (hash && PAGES[hash]) currentPage = hash;
  renderNav();
  renderContent();
  initSearch();
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });
}

document.addEventListener('DOMContentLoaded', init);
