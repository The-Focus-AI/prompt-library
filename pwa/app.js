// Basic script to fetch prompts from GitHub and display them
const repoUrl = 'https://raw.githubusercontent.com/username/repo/main/prompts';

async function fetchPromptList() {
  // Example fetch of an index file listing prompts
  const res = await fetch(repoUrl + '/index.json');
  if (!res.ok) {
    document.getElementById('content').textContent = 'Failed to load prompts.';
    return;
  }
  const list = await res.json();
  renderPrompts(list);
}

function renderPrompts(prompts) {
  const container = document.getElementById('content');
  container.innerHTML = '';
  prompts.forEach(p => {
    const div = document.createElement('div');
    div.className = 'prompt';
    div.innerHTML = `<h3>${p.name}</h3><pre>${p.content}</pre>`;
    const btn = document.createElement('button');
    btn.className = 'copy';
    btn.textContent = 'Copy to Clipboard';
    btn.addEventListener('click', () => navigator.clipboard.writeText(p.content));
    div.appendChild(btn);
    container.appendChild(div);
  });
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js');
  });
}

fetchPromptList();
