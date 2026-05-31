// ══════════════════════════════════════
//  VoteEase — Frontend Application JS
// ══════════════════════════════════════

let CUR = { user: null };
let selectedOptions = {}; // { pollId: optionText }

const ADMIN_TABS = [
  { id: 'create',  lbl: '➕ Create',  sec: 'sec-create' },
  { id: 'manage',  lbl: '⚙️ Manage',  sec: 'sec-manage' },
  { id: 'results', lbl: '📊 Results', sec: 'sec-results' },
  { id: 'history', lbl: '🕓 History', sec: 'sec-history' },
  { id: 'users',   lbl: '👥 Users',   sec: 'sec-users' },
  { id: 'profile', lbl: '👤 Profile', sec: 'sec-profile' },
];

const VOTER_TABS = [
  { id: 'vote',    lbl: '🗳️ Vote',    sec: 'sec-vote' },
  { id: 'results', lbl: '📊 Results', sec: 'sec-results' },
  { id: 'history', lbl: '🕓 History', sec: 'sec-history' },
  { id: 'profile', lbl: '👤 Profile', sec: 'sec-profile' },
];

// ── API Helper ──
async function api(url, options = {}) {
  try {
    const headers = { 'Content-Type': 'application/json' };
    const config = {
      method: options.method || 'GET',
      headers: headers,
      ...options,
      body: options.body ? JSON.stringify(options.body) : undefined,
    };
    const res = await fetch(url, config);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Something went wrong');
    return data;
  } catch (e) {
    throw e;
  }
}

// ── Theme Management ──
function initTheme() {
  const saved = localStorage.getItem('voteease-theme') || 'light';
  document.body.setAttribute('data-theme', saved);
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.textContent = saved === 'dark' ? '☀️' : '🌙';
}

function toggleTheme() {
  const current = document.body.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.body.setAttribute('data-theme', next);
  localStorage.setItem('voteease-theme', next);
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.textContent = next === 'dark' ? '☀️' : '🌙';
}

// ── Toast Notifications ──
function toast(msg, ok = true) {
  const t = document.getElementById('toast');
  t.textContent = (ok ? '✅ ' : '❌ ') + msg;
  t.className = 'toast show' + (ok ? '' : ' error');
  setTimeout(() => t.className = 'toast', 3500);
}

// ── Authentication UI ──
function switchAuth(mode) {
  document.getElementById('login-form').style.display = mode === 'login' ? 'block' : 'none';
  document.getElementById('register-form').style.display = mode === 'register' ? 'block' : 'none';
  document.getElementById('tab-login').classList.toggle('active', mode === 'login');
  document.getElementById('tab-register').classList.toggle('active', mode === 'register');
  document.getElementById('lerr').textContent = '';
  document.getElementById('rerr').textContent = '';
  document.getElementById('rok').textContent = '';
}

function toggleAdminCode() {
  const role = document.getElementById('rrole').value;
  document.getElementById('admin-code-wrap').style.display = role === 'admin' ? 'block' : 'none';
}

function togglePwd(id, btn) {
  const inp = document.getElementById(id);
  if (inp.type === 'password') {
    inp.type = 'text';
    btn.textContent = '🙈';
  } else {
    inp.type = 'password';
    btn.textContent = '👁️';
  }
}

async function doLogin(e) {
  e.preventDefault();
  const username = document.getElementById('lu').value.trim();
  const password = document.getElementById('lp').value;
  const errEl = document.getElementById('lerr');
  errEl.textContent = '';

  if (!username || !password) {
    errEl.textContent = 'Please fill in all fields.';
    return;
  }

  try {
    const res = await api('/api/login', {
      method: 'POST',
      body: { username, password }
    });
    if (res.success) {
      toast('Login successful! Welcome back.');
      CUR.user = res.user;
      showApp();
    }
  } catch (err) {
    errEl.textContent = err.message;
  }
}

async function doRegister(e) {
  e.preventDefault();
  const name = document.getElementById('rname').value.trim();
  const username = document.getElementById('ru').value.trim();
  const email = document.getElementById('remail').value.trim();
  const password = document.getElementById('rp').value;
  const rp2 = document.getElementById('rp2').value;
  const role = document.getElementById('rrole').value;
  const adminCode = document.getElementById('rcode').value;

  const errEl = document.getElementById('rerr');
  const okEl = document.getElementById('rok');
  errEl.textContent = '';
  okEl.textContent = '';

  if (!name || !username || !email || !password || !rp2) {
    errEl.textContent = 'All fields are required.';
    return;
  }
  if (password !== rp2) {
    errEl.textContent = 'Passwords do not match.';
    return;
  }

  try {
    const res = await api('/api/register', {
      method: 'POST',
      body: { name, username, email, password, role, adminCode }
    });
    if (res.success) {
      okEl.textContent = 'Account created successfully! Please sign in.';
      toast('Registration successful!');
      setTimeout(() => switchAuth('login'), 1500);
    }
  } catch (err) {
    errEl.textContent = err.message;
  }
}

async function doLogout() {
  try {
    await api('/api/logout', { method: 'POST' });
    toast('Logged out successfully.');
    CUR.user = null;
    hideApp();
  } catch (err) {
    toast(err.message, false);
  }
}

// ── Application Initialization & View Controller ──
async function initApp() {
  initTheme();
  try {
    const user = await api('/api/me');
    if (user && user.username) {
      CUR.user = user;
      showApp();
    } else {
      hideApp();
    }
  } catch (e) {
    hideApp();
  }
}

function showApp() {
  document.getElementById('auth-page').style.display = 'none';
  document.getElementById('app').style.display = 'block';
  
  // Set navbar user details
  document.getElementById('nav-username').textContent = CUR.user.name;
  document.getElementById('nav-role').textContent = CUR.user.role;
  document.getElementById('nav-avatar').textContent = CUR.user.name.charAt(0).toUpperCase();

  renderTabs();
  
  // Switch to the first tab by default
  const defaultTab = CUR.user.role === 'admin' ? 'create' : 'vote';
  switchTab(defaultTab);
}

function hideApp() {
  document.getElementById('auth-page').style.display = 'flex';
  document.getElementById('app').style.display = 'none';
  switchAuth('login');
  // Clear inputs
  document.getElementById('lu').value = '';
  document.getElementById('lp').value = '';
  document.getElementById('rname').value = '';
  document.getElementById('ru').value = '';
  document.getElementById('remail').value = '';
  document.getElementById('rp').value = '';
  document.getElementById('rp2').value = '';
  document.getElementById('rcode').value = '';
}

function renderTabs() {
  const container = document.getElementById('tabs');
  const tabsList = CUR.user.role === 'admin' ? ADMIN_TABS : VOTER_TABS;
  
  container.innerHTML = tabsList.map(t => `
    <button class="tab" id="tab-${t.id}" onclick="switchTab('${t.id}')">
      ${t.lbl}
    </button>
  `).join('');
}

function switchTab(tabId) {
  const tabsList = CUR.user.role === 'admin' ? ADMIN_TABS : VOTER_TABS;
  
  // Update Active Tab Styles
  tabsList.forEach(t => {
    const el = document.getElementById(`tab-${t.id}`);
    if (el) el.classList.toggle('active', t.id === tabId);
    
    const sec = document.getElementById(t.sec);
    if (sec) sec.classList.toggle('active', t.id === tabId);
  });

  // Load appropriate section data
  if (tabId === 'create') initCreatePoll();
  else if (tabId === 'manage') loadManagePolls();
  else if (tabId === 'vote') loadVotePolls();
  else if (tabId === 'results') loadResults();
  else if (tabId === 'history') loadHistory();
  else if (tabId === 'users') loadUsers();
  else if (tabId === 'profile') loadProfile();
}

// ── Section 1: Create Poll (Admin) ──
function initCreatePoll() {
  document.getElementById('ptitle').value = '';
  const list = document.getElementById('opts-list');
  list.innerHTML = `
    <div class="opt-row"><input class="form-input" placeholder="Option 1"/></div>
    <div class="opt-row"><input class="form-input" placeholder="Option 2"/></div>
  `;
  document.getElementById('poll-msg').innerHTML = '';
}

function addOpt() {
  const list = document.getElementById('opts-list');
  const index = list.children.length + 1;
  const div = document.createElement('div');
  div.className = 'opt-row';
  div.innerHTML = `
    <input class="form-input" placeholder="Option ${index}"/>
    <button class="btn btn-danger" onclick="this.parentElement.remove()">✕</button>
  `;
  list.appendChild(div);
}

async function createPoll() {
  const title = document.getElementById('ptitle').value.trim();
  const optInputs = document.querySelectorAll('#opts-list input');
  const options = Array.from(optInputs).map(inp => inp.value.trim()).filter(val => val !== '');
  const msgEl = document.getElementById('poll-msg');
  msgEl.innerHTML = '';

  if (!title) {
    msgEl.innerHTML = '<div class="msg-error" style="display:block">Enter a poll question.</div>';
    return;
  }
  if (options.length < 2) {
    msgEl.innerHTML = '<div class="msg-error" style="display:block">Add at least 2 options.</div>';
    return;
  }

  try {
    const res = await api('/api/polls', {
      method: 'POST',
      body: { title, options }
    });
    if (res.success) {
      toast('Poll created successfully!');
      initCreatePoll();
    }
  } catch (err) {
    msgEl.innerHTML = `<div class="msg-error" style="display:block">${err.message}</div>`;
  }
}

// ── Section 2: Manage Polls (Admin) ──
async function loadManagePolls() {
  const container = document.getElementById('manage-list');
  container.innerHTML = '<div class="empty">⌛ Loading polls...</div>';
  try {
    const polls = await api('/api/polls');
    renderManagePolls(polls);
  } catch (err) {
    container.innerHTML = `<div class="empty">❌ Failed to load polls: ${err.message}</div>`;
  }
}

function renderManagePolls(polls) {
  const container = document.getElementById('manage-list');
  if (polls.length === 0) {
    container.innerHTML = `
      <div class="glass-card empty">
        <div class="empty-icon">📂</div>
        <div>No polls created yet.</div>
        <button class="btn btn-primary" onclick="switchTab('create')">➕ Create First Poll</button>
      </div>
    `;
    return;
  }

  container.innerHTML = polls.map(p => `
    <div class="glass-card poll-item">
      <div class="poll-info">
        <h3>${esc(p.title)}</h3>
        <div class="poll-meta">
          <span class="status ${p.status === 'open' ? 's-open' : 's-closed'}">${p.status}</span>
          <span>📅 ${p.created}</span>
          <span>🗳️ ${p.voteCount} vote(s) cast</span>
        </div>
      </div>
      <div class="actions">
        <button class="btn ${p.status === 'open' ? 'btn-secondary' : 'btn-success'}" onclick="togglePoll(${p.id})">
          ${p.status === 'open' ? '🔒 Close' : '🔓 Open'}
        </button>
        <button class="btn btn-danger" onclick="deletePoll(${p.id})">🗑️ Delete</button>
      </div>
    </div>
  `).join('');
}

async function togglePoll(id) {
  try {
    const res = await api(`/api/polls/${id}/toggle`, { method: 'PUT' });
    if (res.success) {
      toast(`Poll is now ${res.status}.`);
      loadManagePolls();
    }
  } catch (err) {
    toast(err.message, false);
  }
}

async function deletePoll(id) {
  if (!confirm('Are you sure you want to delete this poll? All voting records for this poll will be permanently erased.')) return;
  try {
    const res = await api(`/api/polls/${id}`, { method: 'DELETE' });
    if (res.success) {
      toast('Poll deleted successfully.');
      loadManagePolls();
    }
  } catch (err) {
    toast(err.message, false);
  }
}

// ── Section 3: Active Polls (Voter) ──
async function loadVotePolls() {
  const container = document.getElementById('vote-list');
  container.innerHTML = '<div class="empty">⌛ Loading active polls...</div>';
  try {
    const polls = await api('/api/polls');
    renderVotePolls(polls);
  } catch (err) {
    container.innerHTML = `<div class="empty">❌ Failed to load polls: ${err.message}</div>`;
  }
}

function renderVotePolls(polls) {
  const container = document.getElementById('vote-list');
  const activePolls = polls.filter(p => p.status === 'open' || p.userVote);
  
  if (activePolls.length === 0) {
    container.innerHTML = `
      <div class="glass-card empty" style="grid-column: 1/-1">
        <div class="empty-icon">📭</div>
        <div>No active polls available to vote at this time.</div>
      </div>
    `;
    return;
  }

  container.innerHTML = activePolls.map(p => {
    const hasVoted = p.userVote != null;
    
    return `
      <div class="glass-card vote-card">
        <div>
          ${hasVoted ? `<div class="voted-tag">🎉 Voted: ${esc(p.userVote)}</div>` : ''}
          <h3 style="margin-bottom:14px; font-size:1.15rem">${esc(p.title)}</h3>
          
          <div style="margin-bottom:20px">
            ${p.options.map(opt => {
              if (hasVoted) {
                const isSelected = opt === p.userVote;
                return `
                  <div class="v-opt ${isSelected ? 'sel' : ''}" style="cursor:default; opacity:0.85">
                    <span style="margin-right:10px">${isSelected ? '🎯' : '⚪'}</span>
                    <span>${esc(opt)}</span>
                  </div>
                `;
              } else {
                const isSel = selectedOptions[p.id] === opt;
                return `
                  <div class="v-opt ${isSel ? 'sel' : ''}" onclick="selectOpt(${p.id}, '${escJS(opt)}')">
                    <span style="margin-right:10px">${isSel ? '🔘' : '⚪'}</span>
                    <span>${esc(opt)}</span>
                  </div>
                `;
              }
            }).join('')}
          </div>
        </div>
        
        <div>
          ${hasVoted ? `
            <div style="font-size:0.8rem; color:var(--text-muted); text-align:center; padding:10px 0">
              Your response has been securely recorded.
            </div>
          ` : `
            <button class="btn-primary-full" onclick="castVote(${p.id})">
              <span>Submit Vote</span> 🗳️
            </button>
          `}
        </div>
      </div>
    `;
  }).join('');
}

function selectOpt(pollId, option) {
  selectedOptions[pollId] = option;
  renderVotePolls(currentPollsCache || []);
}

let currentPollsCache = [];
// Overriding loadVotePolls helper to cache polls
async function loadVotePolls() {
  const container = document.getElementById('vote-list');
  try {
    const polls = await api('/api/polls');
    currentPollsCache = polls;
    renderVotePolls(polls);
  } catch (err) {
    container.innerHTML = `<div class="empty">❌ Failed to load polls: ${err.message}</div>`;
  }
}

async function castVote(pollId) {
  const opt = selectedOptions[pollId];
  if (!opt) {
    toast('Please select an option before submitting your vote.', false);
    return;
  }
  try {
    await api(`/api/polls/${pollId}/vote`, {
      method: 'POST',
      body: { option: opt }
    });
    toast('Thank you! Your vote has been cast successfully.');
    delete selectedOptions[pollId];
    loadVotePolls();
  } catch (err) {
    toast(err.message, false);
  }
}

// ── Section 4: Live Results (Voter & Admin) ──
async function loadResults() {
  const container = document.getElementById('results-list');
  container.innerHTML = '<div class="empty">⌛ Loading live results...</div>';
  try {
    const polls = await api('/api/results');
    renderResults(polls);
  } catch (err) {
    container.innerHTML = `<div class="empty">❌ Failed to load results: ${err.message}</div>`;
  }
}

function renderResults(polls) {
  const container = document.getElementById('results-list');
  if (polls.length === 0) {
    container.innerHTML = `
      <div class="glass-card empty" style="grid-column: 1/-1">
        <div class="empty-icon">📊</div>
        <div>No poll results to display.</div>
      </div>
    `;
    return;
  }

  container.innerHTML = polls.map(p => {
    // Find winner
    let max = -1;
    let winner = null;
    let isTie = false;
    
    Object.keys(p.counts || {}).forEach(k => {
      const v = p.counts[k];
      if (v > max) {
        max = v;
        winner = k;
        isTie = false;
      } else if (v === max && v > 0) {
        isTie = true;
      }
    });

    const isWinnerExist = winner !== null && max > 0;

    return `
      <div class="glass-card">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:20px">
          <div>
            <h3 style="font-size:1.1rem; line-height:1.3">${esc(p.title)}</h3>
            <span class="status ${p.status === 'open' ? 's-open' : 's-closed'}" style="margin-top:6px; display:inline-block">
              ${p.status}
            </span>
          </div>
        </div>
        
        <div>
          ${p.options.map(opt => {
            const count = p.counts[opt] || 0;
            const pct = p.total > 0 ? Math.round((count / p.total) * 100) : 0;
            const isOptWinner = isWinnerExist && !isTie && opt === winner;
            
            return `
              <div class="bar-wrap">
                <div class="bar-label">
                  <span style="font-weight:${isOptWinner ? '700' : '500'}">
                    ${isOptWinner ? '👑 ' : ''}${esc(opt)}
                  </span>
                  <span style="color:var(--text-muted)">
                    ${count} vote(s) (${pct}%)
                  </span>
                </div>
                <div class="bar-bg">
                  <div class="bar-fill" style="width:${pct}%"></div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
        
        <div style="border-top:1px solid var(--border-color); margin-top:20px; padding-top:14px; display:flex; justify-content:space-between; align-items:center">
          <span style="font-size:0.8rem; color:var(--text-muted)">📅 Created ${p.created}</span>
          <span class="total-votes" style="margin:0; font-weight:700">Total Votes: ${p.total}</span>
        </div>
        
        ${isWinnerExist && !isTie ? `
          <div class="winner-banner">
            ✨ Winner: <strong>${esc(winner)}</strong> with ${max} vote(s)!
          </div>
        ` : ''}
        ${isWinnerExist && isTie ? `
          <div class="winner-banner" style="background:rgba(0,0,0,0.04); color:var(--text-muted)">
            🤝 Tie! Multiple options have the leading vote counts.
          </div>
        ` : ''}
      </div>
    `;
  }).join('');

  // Micro-triggering width animation
  setTimeout(() => {
    const fills = document.querySelectorAll('.bar-fill');
    fills.forEach(f => {
      // Re-trigger computed styles
      f.style.width = f.style.width;
    });
  }, 100);
}

// ── Section 5: Vote History & Analytics (Voter & Admin) ──
async function loadHistory() {
  const statsContainer = document.getElementById('stats-grid');
  const tableContainer = document.getElementById('hist-table');
  
  statsContainer.innerHTML = '<div style="grid-column:1/-1; text-align:center">Loading stats...</div>';
  tableContainer.innerHTML = '<div style="text-align:center">Loading history...</div>';

  try {
    const stats = await api('/api/stats');
    const votes = await api('/api/votes');
    
    renderStats(stats);
    renderHistory(votes);
  } catch (err) {
    statsContainer.innerHTML = `<div style="grid-column:1/-1; color:var(--danger)">Failed: ${err.message}</div>`;
  }
}

function renderStats(s) {
  const container = document.getElementById('stats-grid');
  
  if (s.isAdmin) {
    container.innerHTML = `
      <div class="stat-card">
        <div class="stat-num">${s.totalPolls}</div>
        <div class="stat-lbl">Total Polls</div>
      </div>
      <div class="stat-card">
        <div class="stat-num">${s.openPolls}</div>
        <div class="stat-lbl">Open Polls</div>
      </div>
      <div class="stat-card">
        <div class="stat-num">${s.totalVotes}</div>
        <div class="stat-lbl">Total Votes Cast</div>
      </div>
      <div class="stat-card">
        <div class="stat-num">${s.totalUsers}</div>
        <div class="stat-lbl">Registered Users</div>
      </div>
    `;
  } else {
    container.innerHTML = `
      <div class="stat-card">
        <div class="stat-num">${s.totalPolls}</div>
        <div class="stat-lbl">Total Public Polls</div>
      </div>
      <div class="stat-card">
        <div class="stat-num">${s.openPolls}</div>
        <div class="stat-lbl">Active Polls</div>
      </div>
      <div class="stat-card">
        <div class="stat-num">${s.totalVotes}</div>
        <div class="stat-lbl">Your Votes Cast</div>
      </div>
    `;
  }
}

function renderHistory(votes) {
  const container = document.getElementById('hist-table');
  if (votes.length === 0) {
    container.innerHTML = `
      <div class="empty">
        <div class="empty-icon">📝</div>
        <div>No voting activity recorded yet.</div>
      </div>
    `;
    return;
  }

  const isAdmin = CUR.user.role === 'admin';

  container.innerHTML = `
    <div style="overflow-x:auto">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Poll Question</th>
            <th>Voted Option</th>
            ${isAdmin ? '<th>Voter</th>' : ''}
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          ${votes.map(v => `
            <tr>
              <td>#${v.id}</td>
              <td style="font-weight:600">${esc(v.pollTitle || 'Deleted Poll')}</td>
              <td><span class="status s-open" style="background:rgba(99,102,241,0.06)">${esc(v.optionText)}</span></td>
              ${isAdmin ? `<td><strong>@${esc(v.voter)}</strong></td>` : ''}
              <td style="color:var(--text-muted); font-size:0.85rem">${v.votedAt}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// ── Section 6: Registered Users (Admin) ──
async function loadUsers() {
  const container = document.getElementById('users-list');
  container.innerHTML = '<div class="empty">⌛ Loading users list...</div>';
  try {
    const users = await api('/api/users');
    renderUsers(users);
  } catch (err) {
    container.innerHTML = `<div class="empty">❌ Failed: ${err.message}</div>`;
  }
}

function renderUsers(users) {
  const container = document.getElementById('users-list');
  if (users.length === 0) {
    container.innerHTML = '<div class="empty">No registered users in the database.</div>';
    return;
  }

  container.innerHTML = users.map(u => `
    <div class="user-item">
      <div class="user-avatar-sm">${u.name.charAt(0).toUpperCase()}</div>
      <div style="flex:1">
        <h4 style="font-size:0.95rem; font-weight:700">${esc(u.name)}</h4>
        <div style="font-size:0.8rem; color:var(--text-muted); margin-top:2px">
          @${esc(u.username)} &bull; ${esc(u.email)}
        </div>
        <div style="margin-top:6px; display:flex; align-items:center; gap:8px">
          <span class="status ${u.role === 'admin' ? 's-closed' : 's-open'}" style="font-size:0.6rem; padding:1px 6px">
            ${u.role}
          </span>
          <span style="font-size:0.75rem; color:var(--text-muted)">📅 Joined ${u.joined}</span>
        </div>
      </div>
    </div>
  `).join('');
}

// ── Section 7: User Profile & Security (Voter & Admin) ──
async function loadProfile() {
  const card = document.getElementById('profile-card');
  card.innerHTML = 'Loading profile details...';
  
  try {
    const u = await api('/api/me');
    CUR.user = u; // update local user details
    
    card.innerHTML = `
      <div class="profile-avatar-lg">${u.name.charAt(0).toUpperCase()}</div>
      <h3 class="profile-name">${esc(u.name)}</h3>
      <div style="font-size:0.9rem; color:var(--text-muted); margin-top:4px">@${esc(u.username)}</div>
      <span class="profile-role">${u.role}</span>
      <div class="profile-stats">
        <div>📧 Email: <strong>${esc(u.email)}</strong></div>
        <div>📅 Joined: <strong>${u.joined}</strong></div>
        <div>🗳️ Votes Cast: <strong>${u.voteCount}</strong></div>
      </div>
    `;

    document.getElementById('pw-msg').innerHTML = '';
    document.getElementById('old-pw').value = '';
    document.getElementById('new-pw').value = '';
    document.getElementById('new-pw2').value = '';
  } catch (err) {
    card.innerHTML = `<div style="color:var(--danger)">Failed to load profile: ${err.message}</div>`;
  }
}

async function changePassword() {
  const oldPassword = document.getElementById('old-pw').value;
  const newPassword = document.getElementById('new-pw').value;
  const newPw2 = document.getElementById('new-pw2').value;
  const msg = document.getElementById('pw-msg');
  msg.innerHTML = '';

  if (!oldPassword || !newPassword || !newPw2) {
    msg.innerHTML = '<div class="msg-error" style="display:block">All fields required.</div>';
    return;
  }
  if (newPassword.length < 6) {
    msg.innerHTML = '<div class="msg-error" style="display:block">New password must be at least 6 characters.</div>';
    return;
  }
  if (newPassword !== newPw2) {
    msg.innerHTML = '<div class="msg-error" style="display:block">New passwords do not match.</div>';
    return;
  }

  try {
    const res = await api('/api/change-password', {
      method: 'PUT',
      body: { oldPassword, newPassword }
    });
    toast('Password changed successfully!');
    msg.innerHTML = `<div class="msg-success" style="display:block">${res.message}</div>`;
    document.getElementById('old-pw').value = '';
    document.getElementById('new-pw').value = '';
    document.getElementById('new-pw2').value = '';
  } catch (err) {
    msg.innerHTML = `<div class="msg-error" style="display:block">${err.message}</div>`;
  }
}

// ── Escape String Helpers to Prevent XSS Injection ──
function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escJS(s) {
  return String(s)
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r');
}

// Initializing application on script load
window.addEventListener('DOMContentLoaded', initApp);
