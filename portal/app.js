'use strict';

const grid = document.querySelector('#paper-grid');
const empty = document.querySelector('#empty');
const search = document.querySelector('#search');
const topicFilter = document.querySelector('#topic-filter');
const summary = document.querySelector('#result-summary');
let papers = [];

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
}

function render() {
  const query = search.value.trim().toLowerCase();
  const topic = topicFilter.value;
  const visible = papers.filter((paper) => {
    const haystack = [paper.title, paper.titleZh, paper.venue, paper.source, paper.sourceBranch, ...(paper.authors || []), ...(paper.topics || []), ...(paper.participants || []).map((item) => `${item.name} ${item.github || ''}`)].join(' ').toLowerCase();
    return (!query || haystack.includes(query)) && (!topic || (paper.topics || []).includes(topic));
  });

  summary.textContent = `显示 ${visible.length} / ${papers.length} 篇教程`;
  empty.hidden = visible.length !== 0;
  grid.innerHTML = visible.map((paper) => `
    <article class="paper-card">
      <div class="card-meta"><span>${escapeHtml([paper.venue, paper.year].filter(Boolean).join(' · ') || '论文教程')}</span><span class="status">${paper.status === 'published' ? '已发布' : '审核中'}</span></div>
      <h2>${escapeHtml(paper.titleZh)}</h2>
      <p class="title-en">${escapeHtml(paper.title)}</p>
      <div class="topics">${(paper.topics || []).map((item) => `<span class="topic">${escapeHtml(item)}</span>`).join('')}</div>
      <p class="participants">版本来源：${escapeHtml(paper.source)} · ${escapeHtml(paper.sourceBranch)}<br />参与者：${escapeHtml((paper.participants || []).map((item) => item.name).join('、'))}</p>
      <div class="actions"><a class="open-link" href="./${escapeHtml(paper.tutorialUrl)}">打开教程 →</a><a class="paper-link" href="${escapeHtml(paper.paperUrl)}" target="_blank" rel="noopener">查看原论文</a></div>
    </article>
  `).join('');
}

fetch('./papers.json')
  .then((response) => {
    if (!response.ok) throw new Error('索引加载失败');
    return response.json();
  })
  .then((data) => {
    papers = data;
    const topics = [...new Set(papers.flatMap((paper) => paper.topics || []))].sort();
    topicFilter.insertAdjacentHTML('beforeend', topics.map((item) => `<option value="${escapeHtml(item)}">${escapeHtml(item)}</option>`).join(''));
    document.querySelector('#paper-count').textContent = papers.length;
    document.querySelector('#topic-count').textContent = topics.length;
    document.querySelector('#participant-count').textContent = new Set(papers.flatMap((paper) => (paper.participants || []).map((item) => item.github || item.name))).size;
    render();
  })
  .catch((error) => {
    summary.textContent = error.message;
    empty.hidden = false;
  });

search.addEventListener('input', render);
topicFilter.addEventListener('change', render);
