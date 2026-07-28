
let artists = [];
let currentView = 'tile';
const pageMode = document.body.dataset.mode || 'all';
const mediaBaseUrl = document.body.dataset.mediaBase || '';

let queue = [];
let queueIndex = -1;

const gridEl = document.getElementById('grid');
const indexEl = document.getElementById('index-view');
const statusEl = document.getElementById('status-line');
const searchInput = document.getElementById('search');
const overlay = document.getElementById('overlay');
const tileViewBtn = document.getElementById('tile-view-btn');
const indexViewBtn = document.getElementById('index-view-btn');
const queueBar = document.getElementById('queue-bar');
const queueMediaWrap = document.getElementById('queue-media-wrap');
const qnpTitle = document.getElementById('qnp-title');
const qnpArtist = document.getElementById('qnp-artist');
const queuePrevBtn = document.getElementById('queue-prev-btn');
const queueNextBtn = document.getElementById('queue-next-btn');
const queueToggleBtn = document.getElementById('queue-toggle-btn');
const queuePanel = document.getElementById('queue-panel');

function countLabel(n){
  const unit = pageMode === 'video' ? 'videos' : 'tracks';
  return String(n).padStart(2,'0') + ' ' + unit;
}

function hashHue(str){
  let h = 0;
  for (let i=0;i<str.length;i++){ h = (h*31 + str.charCodeAt(i)) >>> 0; }
  return h % 360;
}

function monogramTile(name){
  const hue = hashHue(name);
  const initials = name.trim().split(/\s+/).slice(0,2).map(w=>w[0]).join('').toUpperCase();
  const el = document.createElement('div');
  el.className = 'mono-tile';
  el.style.background = `hsl(${hue} 55% 45%)`;
  el.textContent = initials;
  return el;
}

function mediaUrl(path){
  if (!path) return path;
  if (/^https?:\/\//i.test(path)) return path;
  const encoded = path.split('/').map(encodeURIComponent).join('/');
  return mediaBaseUrl ? mediaBaseUrl.replace(/\/+$/, '') + '/' + encoded : encoded;
}

function trackMatches(track, q){
  return (track.display && track.display.toLowerCase().includes(q))
      || (track.song && track.song.toLowerCase().includes(q))
      || (track.album && track.album.toLowerCase().includes(q));
}

function artistMatches(a, q){
  if (!q) return true;
  const query = q.toLowerCase();
  return a.name.toLowerCase().includes(query) || a.tracks.some(t => trackMatches(t, query));
}

function renderGrid(filterText){
  gridEl.innerHTML = '';
  const filtered = artists.filter(a => artistMatches(a, filterText));

  filtered.forEach(a => {
    const card = document.createElement('button');
    card.className = 'card';
    card.type = 'button';

    if (a.image){
      const img = document.createElement('img');
      img.src = mediaUrl(a.image);
      img.alt = a.name;
      card.appendChild(img);
    } else {
      card.appendChild(monogramTile(a.name));
    }

    const info = document.createElement('div');
    info.className = 'card-info';
    const h3 = document.createElement('h3');
    h3.textContent = a.name;
    const count = document.createElement('div');
    count.className = 'count mono';
    count.textContent = countLabel(a.tracks.length);
    info.appendChild(h3);
    info.appendChild(count);
    card.appendChild(info);

    card.addEventListener('click', () => openArtist(a));
    gridEl.appendChild(card);
  });

  if (filtered.length === 0){
    const msg = document.createElement('div');
    msg.style.color = 'var(--text-muted)';
    msg.style.fontSize = '13px';
    msg.style.padding = '20px 4px';
    msg.textContent = 'No artists match that search.';
    gridEl.appendChild(msg);
  }
}

function alphaSortKey(name){
  const n = name.trim();
  return /^the\s+/i.test(n) ? n.replace(/^the\s+/i, '') : n;
}

function renderIndex(filterText){
  indexEl.innerHTML = '';
  const filtered = artists
    .filter(a => artistMatches(a, filterText))
    .slice()
    .sort((a,b) => alphaSortKey(a.name).localeCompare(alphaSortKey(b.name)));

  if (filtered.length === 0){
    const msg = document.createElement('div');
    msg.style.color = 'var(--text-muted)';
    msg.style.fontSize = '13px';
    msg.style.padding = '20px 4px';
    msg.textContent = 'No artists match that search.';
    indexEl.appendChild(msg);
    return;
  }

  let currentLetter = null;
  filtered.forEach(a => {
    const firstChar = alphaSortKey(a.name)[0] || '#';
    const letter = /[a-zA-Z]/.test(firstChar) ? firstChar.toUpperCase() : '#';
    if (letter !== currentLetter){
      currentLetter = letter;
      const heading = document.createElement('div');
      heading.className = 'index-letter';
      heading.textContent = letter;
      indexEl.appendChild(heading);
    }
    const row = document.createElement('button');
    row.className = 'index-row';
    row.type = 'button';
    const nameSpan = document.createElement('span');
    nameSpan.className = 'index-name';
    nameSpan.textContent = a.name;
    const countSpan = document.createElement('span');
    countSpan.className = 'index-count mono';
    countSpan.textContent = countLabel(a.tracks.length);
    row.appendChild(nameSpan);
    row.appendChild(countSpan);
    row.addEventListener('click', () => openArtist(a));
    indexEl.appendChild(row);
  });
}

function render(filterText){
  if (currentView === 'tile') renderGrid(filterText);
  else renderIndex(filterText);
}

function setView(view){
  currentView = view;
  tileViewBtn.classList.toggle('active', view === 'tile');
  indexViewBtn.classList.toggle('active', view === 'index');
  gridEl.classList.toggle('hidden', view !== 'tile');
  indexEl.classList.toggle('hidden', view !== 'index');
  render(searchInput.value);
}

tileViewBtn.addEventListener('click', () => setView('tile'));
indexViewBtn.addEventListener('click', () => setView('index'));

function syncBodyPadding(){
  if (queueBar.classList.contains('hidden')){
    document.body.style.paddingBottom = '';
  } else {
    document.body.style.paddingBottom = (queueBar.offsetHeight + 12) + 'px';
  }
}

function updateQueueChrome(){
  queueToggleBtn.textContent = `Queue (${queue.length})`;
  queuePrevBtn.disabled = queueIndex <= 0;
  queueNextBtn.disabled = queueIndex >= queue.length - 1;
}

function renderQueuePanel(){
  queuePanel.innerHTML = '';
  queue.forEach((item, i) => {
    const row = document.createElement('div');
    row.className = 'queue-row' + (i === queueIndex ? ' current' : '');

    const info = document.createElement('div');
    info.className = 'qr-info';
    info.textContent = item.display || item.name;
    const artistSpan = document.createElement('span');
    artistSpan.className = 'qr-artist';
    artistSpan.textContent = item.artistName;
    info.appendChild(artistSpan);

    const removeBtn = document.createElement('button');
    removeBtn.className = 'qr-remove';
    removeBtn.type = 'button';
    removeBtn.title = 'Remove from queue';
    removeBtn.textContent = '\u2715';
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      removeFromQueue(i);
    });

    row.appendChild(info);
    row.appendChild(removeBtn);
    row.addEventListener('click', () => playQueueIndex(i));
    queuePanel.appendChild(row);
  });
  syncBodyPadding();
}

function playQueueIndex(i){
  if (i < 0 || i >= queue.length) return;
  queueIndex = i;
  const item = queue[i];

  queueMediaWrap.innerHTML = '';
  const mediaEl = document.createElement(item.kind);
  mediaEl.src = mediaUrl(item.path);
  mediaEl.controls = true;
  mediaEl.autoplay = true;
  mediaEl.addEventListener('ended', () => playQueueIndex(queueIndex + 1));
  queueMediaWrap.appendChild(mediaEl);

  qnpTitle.textContent = item.display || item.name;
  qnpArtist.textContent = item.artistName;

  queueBar.classList.remove('hidden');
  updateQueueChrome();
  renderQueuePanel();
  syncBodyPadding();
}

function addToQueue(artistName, track){
  queue.push({...track, artistName});
  queueBar.classList.remove('hidden');
  updateQueueChrome();
  renderQueuePanel();
  if (queueIndex === -1){
    playQueueIndex(queue.length - 1);
  }
}

function removeFromQueue(i){
  const removingCurrent = i === queueIndex;
  queue.splice(i, 1);

  if (i < queueIndex){
    queueIndex--;
  } else if (removingCurrent){
    if (queue.length === 0){
      queueIndex = -1;
      queueMediaWrap.innerHTML = '';
      qnpTitle.textContent = '';
      qnpArtist.textContent = '';
    } else {
      playQueueIndex(Math.min(i, queue.length - 1));
      return;
    }
  }
  updateQueueChrome();
  renderQueuePanel();
}

queuePrevBtn.addEventListener('click', () => playQueueIndex(queueIndex - 1));
queueNextBtn.addEventListener('click', () => playQueueIndex(queueIndex + 1));
queueToggleBtn.addEventListener('click', () => {
  queuePanel.classList.toggle('hidden');
  syncBodyPadding();
});
window.addEventListener('resize', syncBodyPadding);

function openArtist(a){
  const header = document.getElementById('modal-header');
  header.innerHTML = '';

  if (a.image){
    const img = document.createElement('img');
    img.src = mediaUrl(a.image);
    header.appendChild(img);
  } else {
    header.appendChild(monogramTile(a.name));
  }

  const textWrap = document.createElement('div');
  textWrap.style.flex = '1';
  textWrap.style.minWidth = '0';
  const h2 = document.createElement('h2');
  h2.textContent = a.name;
  const count = document.createElement('div');
  count.className = 'count mono';
  count.textContent = countLabel(a.tracks.length);
  textWrap.appendChild(h2);
  textWrap.appendChild(count);
  header.appendChild(textWrap);

  const closeBtn = document.createElement('button');
  closeBtn.id = 'close-btn';
  closeBtn.textContent = '\u2715';
  closeBtn.addEventListener('click', closeModal);

  const queueAllBtn = document.createElement('button');
  queueAllBtn.className = 'queue-all-btn';
  queueAllBtn.type = 'button';
  queueAllBtn.textContent = 'Queue all';
  queueAllBtn.addEventListener('click', () => {
    a.tracks.forEach(t => addToQueue(a.name, t));
  });

  header.appendChild(queueAllBtn);
  header.appendChild(closeBtn);

  const listEl = document.getElementById('track-list');
  listEl.innerHTML = '';

  let currentAlbum = undefined;
  a.tracks.forEach((entry, i) => {
    const albumKey = (entry.kind === 'video' && entry.album) ? entry.album : null;
    if (albumKey !== currentAlbum){
      currentAlbum = albumKey;
      if (albumKey){
        const heading = document.createElement('div');
        heading.className = 'album-heading';
        heading.textContent = albumKey;
        listEl.appendChild(heading);
      }
    }

    const row = document.createElement('div');
    row.className = 'track-row';

    const top = document.createElement('div');
    top.className = 'track-top';

    const num = document.createElement('div');
    num.className = 'track-num mono';
    num.textContent = String(i+1).padStart(2,'0');

    const nameEl = document.createElement('div');
    nameEl.className = 'track-name';
    nameEl.textContent = entry.display || entry.name;

    const kindEl = document.createElement('div');
    kindEl.className = 'track-kind';
    kindEl.textContent = entry.kind;

    const playBtn = document.createElement('button');
    playBtn.className = 'play-btn';
    playBtn.textContent = '\u25B6';

    let playerWrap = null;
    playBtn.addEventListener('click', () => {
      if (playerWrap){
        playerWrap.remove();
        playerWrap = null;
        playBtn.textContent = '\u25B6';
        return;
      }
      playerWrap = document.createElement('div');
      playerWrap.className = 'player-wrap';
      const mediaEl = document.createElement(entry.kind);
      mediaEl.src = mediaUrl(entry.path);
      mediaEl.controls = true;
      mediaEl.autoplay = true;
      playerWrap.appendChild(mediaEl);
      row.appendChild(playerWrap);
      playBtn.textContent = '\u25A0';
    });

    const addBtn = document.createElement('button');
    addBtn.className = 'add-queue-btn';
    addBtn.type = 'button';
    addBtn.title = 'Add to queue';
    addBtn.textContent = '+';
    addBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      addToQueue(a.name, entry);
    });

    top.appendChild(num);
    top.appendChild(nameEl);
    top.appendChild(kindEl);
    top.appendChild(addBtn);
    top.appendChild(playBtn);
    row.appendChild(top);
    listEl.appendChild(row);
  });

  overlay.classList.remove('hidden');
}

function closeModal(){
  overlay.classList.add('hidden');
  document.getElementById('track-list').innerHTML = '';
}

overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
searchInput.addEventListener('input', () => render(searchInput.value));

fetch('data.json')
  .then(r => r.json())
  .then(data => {
    const raw = data.artists;
    artists = pageMode === 'all'
      ? raw
      : raw
          .map(a => ({...a, tracks: a.tracks.filter(t => t.kind === pageMode)}))
          .filter(a => a.tracks.length > 0);
    statusEl.textContent = `${artists.length} artists · ${artists.reduce((n,a)=>n+a.tracks.length,0)} ${pageMode === 'video' ? 'videos' : 'tracks'}`;
    render('');
  })
  .catch(err => {
    statusEl.textContent = 'Could not load data.json. If you are opening this file directly (file://), run a local server instead - see the comment at the top of build_library.py.';
  });
