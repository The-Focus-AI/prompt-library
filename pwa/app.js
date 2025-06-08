// Fetch prompts directly from a GitHub repository and display them
const repoOwner = 'The-Focus-AI';
const repoName = 'prompt-library';
const branch = 'main';

const apiBase = `https://api.github.com/repos/${repoOwner}/${repoName}/git/trees/${branch}?recursive=1`;
const rawBase = `https://raw.githubusercontent.com/${repoOwner}/${repoName}/${branch}/`;

let prompts = [];

async function fetchPromptList() {
  const res = await fetch(apiBase);
  if (!res.ok) {
    document.getElementById('content').textContent = 'Failed to load prompts.';
    return;
  }
  const data = await res.json();
  const files = data.tree.filter(item => item.type === 'blob' && item.path.startsWith('prompts/'));
  prompts = await Promise.all(files.map(async f => {
    const r = await fetch(rawBase + f.path);
    const content = await r.text();
    return { name: f.path.replace(/^prompts\//, ''), content };
  }));
  renderPromptList();
}

function renderPromptList() {
  const container = document.getElementById('content');
  container.innerHTML = '';
  const ul = document.createElement('ul');
  prompts.forEach((p, i) => {
    const li = document.createElement('li');
    const link = document.createElement('a');
    link.href = '#';
    link.textContent = p.name;
    link.addEventListener('click', e => {
      e.preventDefault();
      renderPrompt(i);
    });
    li.appendChild(link);
    ul.appendChild(li);
  });
  container.appendChild(ul);
}

function renderPrompt(index) {
  const p = prompts[index];
  const container = document.getElementById('content');
  container.innerHTML = `<h2>${p.name}</h2><pre>${p.content}</pre>`;
  const btn = document.createElement('button');
  btn.className = 'copy';
  btn.textContent = 'Copy to Clipboard';
  btn.addEventListener('click', () => navigator.clipboard.writeText(p.content));
  const back = document.createElement('button');
  back.textContent = 'Back';
  back.addEventListener('click', renderPromptList);
  container.appendChild(btn);
  container.appendChild(back);
}

document.getElementById('refresh').addEventListener('click', fetchPromptList);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js');
  });
}

fetchPromptList();
