const state = {
  theme: 'light',
  alarmActive: false,
  activeCameraId: null,
  nextCamNum: 1,
  cameras: [
    { id: 'kitchen', name: 'Kitchen', status: 'Idle', thumb: 'assets/images/kitchen.png' },
    { id: 'outdoor', name: 'Outdoor', status: 'Suspicious activity', thumb: 'assets/images/outdoor.png' }
  ],
  notifications: [
    { id: 1, t: 'Suspicious activity detected on Outdoor camera at 12:23', ts: 'Today' },
    { id: 2, t: 'Alarm cancelled', ts: 'Last week' },
    { id: 3, t: 'Outdoor camera firmware updated successfully', ts: 'Last week' },
    { id: 4, t: 'New device added to KNX network', ts: 'Last week' },
    { id: 5, t: 'Storage usage: 75% full', ts: 'Last week' },
    { id: 6, t: 'Light mode enabled', ts: 'Last week' }
  ]
};

const app   = document.getElementById('app');
const title = document.getElementById('screen-title');

function applyTheme() {
  document.body.dataset.theme = state.theme;
}

function decodeEntities(htmlString) {
  return htmlString
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&amp;', '&');
}


function router() {
  const path = location.hash.slice(1) || '/';
  let viewFn = null, viewTitle = 'Dashboard';

  if (path === '/') { viewFn = viewDashboard; viewTitle = 'Dashboard'; }
  else if (path.startsWith('/camera/')) { const id = path.split('/')[2]; viewFn = () => viewCamera(id); viewTitle = 'Camera'; }
  else if (path === '/notifications') { viewFn = viewNotifications; viewTitle = 'Notification Center'; }
  else if (path === '/settings') { viewFn = viewSettings; viewTitle = 'Settings'; }
  else if (path === '/activity') { viewFn = viewActivity; viewTitle = 'Activity'; }

  if (!viewFn) { app.innerHTML = ' Not found '; return; }

  title.textContent = viewTitle;

  const current = app.firstElementChild;
  if (current) {
    current.classList.add('leaving');
  }

  const doSwap = () => {
    const nextHTML = decodeEntities(viewFn());
    const wrapper = document.createElement('div');
    wrapper.className = 'view entering';
    wrapper.innerHTML = nextHTML;

    app.innerHTML = '';
    app.appendChild(wrapper);

    requestAnimationFrame(() => {
      wrapper.classList.remove('entering');
      wrapper.classList.add('entered');
    });

    updateTabs(path);
    app.focus();
  };

  if (current) {
    const timeout = setTimeout(doSwap, 220);
    current.addEventListener('transitionend', () => { clearTimeout(timeout); doSwap(); }, { once: true });
  } else {
    doSwap();
  }
}
``

function updateTabs(path) {
  document.querySelectorAll('.topnav .tab').forEach(a => {
    const href = a.getAttribute('href').replace('#','');
if (href === path || (path.startsWith('/camera/') && href === '/')) {
  a.setAttribute('aria-current','page');
} else {
  a.removeAttribute('aria-current');
}
  });
}


function viewDashboard() {
  const sortedCameras = [...state.cameras].sort((a, b) => {
    if (!!a.isFavorite === !!b.isFavorite) return 0;
    return a.isFavorite ? -1 : 1;
  });
  const cards = sortedCameras.map(c => `
    &lt;article class="card" aria-label="Camera ${c.name}"&gt;
    
&lt;div class="card-header"&gt;${c.name}
  &lt;button class="btn btn-secondary" style="float:right"
          onclick="toggleFavorite('${c.id}')"
          aria-pressed="${c.isFavorite ? 'true' : 'false'}"
          aria-label="${c.isFavorite ? 'Remove from favorites' : 'Add to favorites'}"
          title="${c.isFavorite ? 'Remove from favorites' : 'Add to favorites'}"&gt          title="${c.isFavorite ? 'Remove from favorites' : 'Add to favorites'}"&gt;
    ${c.isFavorite ? '★' : '☆'}
  &lt;/button&gt;


      &lt;div class="card-body"&gt;
        &lt;div class="camera-thumb"&gt;
          &lt;img src="${c.thumb}" alt="Preview from ${c.name} camera" onerror="this.style.display='none'"/&gt;
        &lt;/div&gt;

        &lt;p class="muted"&gt;Status: ${c.status}${c.isFavorite ? ' · Favorite' : ''}&lt;/p&gt;

        &lt;div class="camera-actions"&gt;
          &lt;a class="btn btn-primary" href="#/camera/${c.id}" aria-label="Open ${c.name}"&gt;Open&lt;/a&gt;
        &lt;/div&gt;
      &lt;/div&gt;
    &lt;/article&gt;
  `).join('');
  const notifs = state.notifications
    .filter(n => (n.ts || '').toLowerCase() === 'today')
    .slice(0, 2)
    .map(n => `
      &lt;div class="list-item"&gt;${n.ts}: ${n.t}&lt;/div&gt;
    `).join('');

  const addButtonSection = `
    &lt;section aria-label="Add camera" style="margin-top:12px"&gt;
      &lt;button class="btn btn-primary" onclick="addCameraAuto()"&gt;Add Camera&lt;/button&gt;
    &lt;/section&gt;
  `;

  return `
    &lt;section class="cards"&gt;${cards}&lt;/section&gt;

    ${addButtonSection}

    &lt;section aria-labelledby="recent-notifications" style="margin-top:1rem"&gt;
      &lt;h2 id="recent-notifications"&gt;Today&lt;/h2&gt;
      &lt;div class="list"&gt;${notifs}&lt;/div&gt;
      &lt;a class="btn btn-secondary" href="#/notifications"&gt;All notifications&lt;/a&gt;
       &lt;/section&gt;
  `;
    }


function viewCamera(id) {
  const cam = state.cameras.find(c => c.id === id);
  if (!cam) return '<p>Camera not found</p>';
  setTimeout(() => {
    window.removeEventListener('keydown', __cameraEscHandler, false);
    window.addEventListener('keydown', __cameraEscHandler, false);
  });
  const icons = {
    back: '<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>',
    left: '<svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"/></svg>',
    right: '<svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>',
    zoomIn: '<svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zm1-7h-2v2H6v2h2v2h2v-2h2V9h-2V7z"/></svg>',
    zoomOut: '<svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zM7 9h5v2H7z"/></svg>',
    alarm: '<svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M12 22c4.97 0 9-4.03 9-9s-4.03-9-9-9-9 4.03-9 9 4.03 9 9 9zm1-9h4v2h-6V7h2v6zM5.11 5.11 2.99 3l3.53-1.06 1.06 3.53L5.11 5.11zm13.78 0-2.47-2.47 1.06-3.53L22 3l-3.11 2.11z"/></svg>',
    rename: '<svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z"/></svg>',
    delete: '<svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>',
    star: cam.isFavorite
      ? '<svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>'
      : '<svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="m22 9.24-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24zm-10 6.11-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 3.98 4.38.38-3.32 2.88 1 4.28L12 15.35z"/></svg>'
  };

  return `
    <section class="card camera-view">
      <div class="card-header camera-header">
        <button class="btn btn-secondary" onclick="goBack()" aria-label="Back">
          ${icons.back} <span class="btn-text">Back</span>
        </button>

        <span class="camera-title">${cam.name}</span>

        <button class="btn btn-secondary btn-fav ${cam.isFavorite ? 'is-on' : ''}"
                aria-label="Toggle favorite"
                aria-pressed="${cam.isFavorite ? 'true' : 'false'}"
                onclick="toggleFavorite('${cam.id}')">
          ${icons.star}
        </button>
      </div>

      <div class="card-body camera-layout">
        <div class="camera-thumb" title="Click to go back" onclick="goBack()">
         <img src="${cam.thumb}" alt="${cam.name}" />
        </div>

        <p class="muted camera-status">Status: ${cam.status}</p>

        <div class="camera-actions camera-ptz">
          <button class="btn btn-secondary" aria-label="Pan left">${icons.left}</button>
          <button class="btn btn-secondary" aria-label="Pan right">${icons.right}</button>
          <button class="btn btn-secondary" aria-label="Zoom in">${icons.zoomIn}</button>
          <button class="btn btn-secondary" aria-label="Zoom out">${icons.zoomOut}</button>
        </div>

        <div class="camera-actions camera-main">
          <button class="btn btn-danger" onclick="triggerAlarm()" aria-label="Trigger alarm">
            ${icons.alarm} <span class="btn-text">Trigger Alarm</span>
          </button>
          <button class="btn btn-secondary" onclick="renameCamera('${cam.id}')" aria-label="Rename camera">
            ${icons.rename} <span class="btn-text">Rename</span>
          </button>
          <button class="btn btn-danger" onclick="deleteCamera('${cam.id}')" aria-label="Delete camera">
            ${icons.delete} <span class="btn-text">Delete</span>
          </button>
        </div>
      </div>
    </section    </section>
  `;
}

function viewNotifications() {
  const groups = {
    'Today': [],
    'Last Week': []
  };

  state.notifications.forEach(n => {
    if ((n.ts || '').toLowerCase() === 'today') {
      groups['Today'].push(n);
    } else {
      groups['Last Week'].push(n);
    }
  });

  const renderGroup = (title, items) => {
    if (!items.length) return '';

    const list = items.map(n => `
      <div class="notification-item">
        ${n.t}
      </div>
    `).join('');

    return `
      <section class="notif-group">
        <h3 class="notif-title">${title}</h3>
        <div class="notif-list">
          ${list}
        </div>
      </section>
    `;
  };

  return `
    ${renderGroup('Today', groups['Today'])}
    ${renderGroup('Last Week', groups['Last Week'])}
  `;
}


function viewSettings() {
  return `
    <section class="card">
      <div class="card-header">Settings</div>

      <div class="card-body">

        <!-- 🔍 Search -->
        <input
          type="search"
          placeholder="Search settings…"
          class="settings-search"
          oninput="filterSettings(this.value)"
          aria-label="Search settings"
        />

        <hr/>

        <!-- 🎨 Appearance -->
        <fieldset data-group="appearance">
          <legend>Appearance</legend>

          <label class="switch-row">
            <span>Dark mode</span>
            <span class="switch">
              <input type="checkbox"
                ${state.theme === 'dark' ? 'checked' : ''}
                onchange="toggleDarkMode(this.checked)" />
              <span class="slider"></span>
            </span>
          </label>

          <label class="switch-row">
            <span>Compact layout</span>
            <span class="switch">
              <input type="checkbox" />
              <span class="slider"></span>
            </span>
          </label>
        </fieldset>

        <hr/>

        <!-- 👤 Account -->
        <fieldset data-group="account">
          <legend>Account</legend>

          <label>
            Name
            <input type="text" placeholder="User" />
          </label>

          <label>
            Email
            <input type="email" placeholder="user@example.com" />
          </label>

          <label class="switch-row">
            <span>Two-factor authentication</span>
            <span class="switch">
              <input type="checkbox" />
              <span class="slider"></span>
            </span>
          </label>
        </fieldset>

        <hr/>

        <!-- 🌐 Network -->
        <fieldset data-group="network">
          <legend>Network</legend>

          <label>
            SSID
            <input type="text" placeholder="KNX Home" />
          </label>

          <label>
            Password
            <input type="password" placeholder="••••••••" />
          </label>

          <label class="switch-row">
            <span>Auto reconnect</span>
            <span class="switch">
              <input type="checkbox" checked />
              <span class="slider"></span>
            </span>
          </label>
        </fieldset>

        <hr/>

        <!-- 🔔 Notifications -->
        <fieldset data-group="notifications">
          <legend>Notifications</legend>

          <label class="switch-row">
            <span>Push notifications</span>
            <span class="switch">
              <input type="checkbox" checked />
              <span class="slider"></span>
            </span>
          </label>

          <label class="switch-row">
            <span>Email notifications</span>
            <span class="switch">
              <input type="checkbox" />
              <span class="slider"></span>
            </span>
          </label>

          <label class="switch-row">
            <span>Sound alerts</span>
            <span class="switch">
              <input type="checkbox" checked />
              <span class="slider"></span>
            </span>
          </label>
        </fieldset>

      </div>
    </section>
  `;
}

function filterSettings(query) {
  query = (query || '').toLowerCase();
  document.querySelectorAll('fieldset').forEach(fs => {
    const text = fs.innerText.toLowerCase();
    fs.style.display = text.includes(query) ? '' : 'none';
  });
}

function toggleDarkMode(checked){
  state.theme = checked ? 'dark' : 'light';
  applyTheme();
}

function renderNotFound(){ app.innerHTML = '<p>Not found</p>'; }

window.addEventListener('hashchange', router);
window.addEventListener('load', () => { applyTheme(); router(); });

function triggerAlarm() {
  state.alarmActive = true;
  state.activeCameraId = state.cameras.find(c =>
    location.hash.endsWith(c.id)
  )?.id || null;

  location.hash = '#/activity';
}
function confirmActivity(){ state.alarmActive = false; alert('Activity confirmed'); }
function cancelAlarm(){ state.alarmActive = false; location.hash = '#/'; }
function simulateActivity(){ state.alarmActive = true; location.hash = '#/activity'; }

function addCamera(name, thumb, status = 'Idle') {
  const newId = 'cam' + (state.cameras.length + 1);
  state.cameras.push({ id: newId, name, status, thumb, isFavorite: false });
  router();
}



function toggleFavorite(id) {
  const cam = state.cameras.find(c => c.id === id);
  if (!cam) return;
  cam.isFavorite = !cam.isFavorite;
  router();
}



function viewActivity() {
  const cam = state.cameras.find(c => c.id === state.activeCameraId);

  return `
    <section class="card">
      <div class="card-header">Alarm</div>
      <div class="card-body">

        <p>
          Are you sure you want to trigger alarm on 
          <strong>${cam ? cam.name : 'Unknown camera'}</strong>
        </p>

        <div class="camera-actions">
          <button class="btn btn-danger" onclick="confirmAlarm()">
            Confirm
          </button>
          <button class="btn btn-secondary" onclick="cancelAlarm()">
            Cancel
          </button>
        </div>

      </div>
    </section>
  `;
}



function confirmAlarm() {
  const cam = state.cameras.find(c => c.id === state.activeCameraId);

  state.alarmActive = false;
  state.activeCameraId = null;

  location.hash = '#/';

  setTimeout(() => {
    if (cam) {
      showToast(`Alarm was triggered on camera "${cam.name}"`);
    }
  }, 50);
}

function cancelAlarm() {
  state.alarmActive = false;
  state.activeCameraId = null;
  location.hash = '#/';
}




function addCameraAuto() {
  const name = 'Camera' + (state.nextCamNum++);
  const thumb = 'assets/images/outdoor.png';
 addCamera(name, thumb, 'Idle');
}

function goBack() {
  if (history.length > 1) {
    history.back();
  } else {
    location.hash = '#/';
   }
}

function renameCamera(id) {
  const cam = state.cameras.find(c => c.id === id);
  if (!cam) return;

  const current = cam.name || '';
  const next = prompt('Enter new camera name:', current);

  if (next === null) return;
  const trimmed = (next + '').trim();
  if (!trimmed) {
    alert('Name cannot be empty');
    return;
  }

  cam.name = trimmed;
  router();
}

function deleteCamera(id) {
  const cam = state.cameras.find(c => c.id === id);
  if (!cam) return;

  const ok = confirm(`Delete camera "${cam.name}"? This action cannot be undone.`);
  if (!ok) return;

  state.cameras = state.cameras.filter(c => c.id !== id);

  const path = location.hash.slice(1);
  if (path.startsWith('/camera/') && path.split('/')[2] === id) {
    location.hash = '#/';
    return;
  }

  router();
}

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}


