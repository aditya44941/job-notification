const state = {
  clients: [],
  interactions: [],
  tasks: [],
  dashboard: {}
};

const elements = {
  dashboardCards: document.getElementById('dashboardCards'),
  clientForm: document.getElementById('clientForm'),
  clientsList: document.getElementById('clientsList'),
  searchInput: document.getElementById('searchInput'),
  riskFilter: document.getElementById('riskFilter'),
  interactionForm: document.getElementById('interactionForm'),
  interactionsList: document.getElementById('interactionsList'),
  taskForm: document.getElementById('taskForm'),
  tasksList: document.getElementById('tasksList'),
  interactionClient: document.getElementById('interactionClient'),
  taskClient: document.getElementById('taskClient')
};

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || 'Request failed');
  }

  return response.json();
}

function parseCsv(input) {
  return input
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);
}

function renderDashboard() {
  const cards = [
    ['Total Clients', state.dashboard.totalClients || 0],
    ['Open Tasks', state.dashboard.openTasks || 0],
    ['Aggressive Clients', state.dashboard.highRiskClients || 0],
    ['Interactions', state.dashboard.interactionsLogged || 0],
    ['Due Today', state.dashboard.dueToday || 0]
  ];

  elements.dashboardCards.innerHTML = cards
    .map(([label, value]) => `<article class="card"><p>${label}</p><strong>${value}</strong></article>`)
    .join('');
}

function clientName(clientId) {
  const client = state.clients.find((c) => c.id === clientId);
  return client ? client.name : 'Unknown Client';
}

function renderClientSelectors() {
  const options = state.clients
    .map((client) => `<option value="${client.id}">${client.name} (${client.segment})</option>`)
    .join('');

  elements.interactionClient.innerHTML = options;
  elements.taskClient.innerHTML = options;
}

function renderClients() {
  const query = elements.searchInput.value.trim().toLowerCase();
  const risk = elements.riskFilter.value;

  const filtered = state.clients.filter((client) => {
    const searchable = [client.name, client.email, client.phone, ...(client.watchlist || [])]
      .join(' ')
      .toLowerCase();

    const matchesQuery = !query || searchable.includes(query);
    const matchesRisk = !risk || client.riskProfile === risk;

    return matchesQuery && matchesRisk;
  });

  if (!filtered.length) {
    elements.clientsList.innerHTML = '<div class="list-item"><p>No clients match your filter.</p></div>';
    return;
  }

  elements.clientsList.innerHTML = filtered
    .map((client) => {
      const holdings = (client.holdings || [])
        .map((h) => `${h.symbol}: ${h.qty} @ ${h.avgPrice}`)
        .join(' | ');

      return `
        <article class="list-item">
          <h3>${client.name}</h3>
          <p>${client.email || '-'} | ${client.phone || '-'}</p>
          <p>Segment: ${client.segment} | Risk: ${client.riskProfile}</p>
          <p>Holdings: ${holdings || 'Not added'}</p>
          <div class="tags">
            ${(client.preferredSectors || []).map((x) => `<span class="tag">${x}</span>`).join('')}
            ${(client.watchlist || []).map((x) => `<span class="tag">${x}</span>`).join('')}
          </div>
          <p>${client.notes || ''}</p>
          <div class="row-actions">
            <button class="secondary" data-edit="${client.id}">Edit Risk</button>
            <button class="danger" data-delete="${client.id}">Delete</button>
          </div>
        </article>
      `;
    })
    .join('');
}

function renderInteractions() {
  const latest = [...state.interactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 8);

  elements.interactionsList.innerHTML = latest
    .map(
      (item) => `
      <article class="list-item">
        <h4>${item.type} - ${clientName(item.clientId)}</h4>
        <p>${item.summary}</p>
        <p>${new Date(item.date).toLocaleString()}</p>
      </article>
    `
    )
    .join('');
}

function renderTasks() {
  const ordered = [...state.tasks].sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  elements.tasksList.innerHTML = ordered
    .map(
      (task) => `
      <article class="list-item">
        <h4>${task.title}</h4>
        <p>${clientName(task.clientId)} | ${task.priority} | Due ${task.dueDate}</p>
        <p>Status: ${task.status}</p>
        ${
          task.status !== 'Done'
            ? `<div class="row-actions"><button class="secondary" data-done="${task.id}">Mark Done</button></div>`
            : ''
        }
      </article>
    `
    )
    .join('');
}

async function loadAll() {
  const [clients, interactions, tasks, dashboard] = await Promise.all([
    api('/api/clients'),
    api('/api/interactions'),
    api('/api/tasks'),
    api('/api/dashboard')
  ]);

  state.clients = clients;
  state.interactions = interactions;
  state.tasks = tasks;
  state.dashboard = dashboard;

  renderDashboard();
  renderClientSelectors();
  renderClients();
  renderInteractions();
  renderTasks();
}

async function addClient(event) {
  event.preventDefault();

  const holdingsText = document.getElementById('holdings').value.trim();
  let holdings = [];
  if (holdingsText) {
    try {
      holdings = JSON.parse(holdingsText);
      if (!Array.isArray(holdings)) throw new Error('Holdings must be an array');
    } catch (err) {
      alert(`Invalid holdings JSON: ${err.message}`);
      return;
    }
  }

  const payload = {
    name: document.getElementById('name').value.trim(),
    email: document.getElementById('email').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    segment: document.getElementById('segment').value,
    riskProfile: document.getElementById('riskProfile').value,
    preferredSectors: parseCsv(document.getElementById('preferredSectors').value),
    watchlist: parseCsv(document.getElementById('watchlist').value).map((x) => x.toUpperCase()),
    holdings,
    notes: document.getElementById('notes').value.trim()
  };

  await api('/api/clients', { method: 'POST', body: JSON.stringify(payload) });
  elements.clientForm.reset();
  await loadAll();
}

async function addInteraction(event) {
  event.preventDefault();

  const payload = {
    clientId: Number(elements.interactionClient.value),
    type: document.getElementById('interactionType').value,
    summary: document.getElementById('interactionSummary').value.trim()
  };

  await api('/api/interactions', { method: 'POST', body: JSON.stringify(payload) });
  elements.interactionForm.reset();
  await loadAll();
}

async function addTask(event) {
  event.preventDefault();

  const payload = {
    clientId: Number(elements.taskClient.value),
    title: document.getElementById('taskTitle').value.trim(),
    dueDate: document.getElementById('taskDueDate').value,
    priority: document.getElementById('taskPriority').value
  };

  await api('/api/tasks', { method: 'POST', body: JSON.stringify(payload) });
  elements.taskForm.reset();
  await loadAll();
}

async function handleListActions(event) {
  const deleteId = event.target.getAttribute('data-delete');
  const editId = event.target.getAttribute('data-edit');
  const doneId = event.target.getAttribute('data-done');

  if (deleteId) {
    if (!confirm('Delete this client and related history?')) return;
    await api(`/api/clients/${deleteId}`, { method: 'DELETE' });
    await loadAll();
  }

  if (editId) {
    const nextRisk = prompt('Set risk profile: Conservative, Moderate, Aggressive');
    if (!nextRisk) return;
    await api(`/api/clients/${editId}`, { method: 'PUT', body: JSON.stringify({ riskProfile: nextRisk }) });
    await loadAll();
  }

  if (doneId) {
    await api(`/api/tasks/${doneId}`, { method: 'PATCH', body: JSON.stringify({ status: 'Done' }) });
    await loadAll();
  }
}

function registerEvents() {
  elements.clientForm.addEventListener('submit', addClient);
  elements.interactionForm.addEventListener('submit', addInteraction);
  elements.taskForm.addEventListener('submit', addTask);
  elements.searchInput.addEventListener('input', renderClients);
  elements.riskFilter.addEventListener('change', renderClients);
  elements.clientsList.addEventListener('click', handleListActions);
  elements.tasksList.addEventListener('click', handleListActions);
}

registerEvents();
loadAll().catch((err) => {
  alert(`Unable to load CRM data: ${err.message}`);
});
