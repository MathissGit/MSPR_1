const sidebar = document.getElementById('franchise-list');
const mainTitle = document.getElementById('franchise-title');
const lastUpdated = document.getElementById('last-updated');
const tableContainer = document.getElementById('table-container');
const refreshBtn = document.getElementById('refresh-btn');

let currentFile = null;
let fileList = [];

async function fetchFileList() {
  const res = await fetch('/api/json-files');
  if (!res.ok) {
    alert('Erreur chargement liste fichiers JSON');
    return [];
  }
  return await res.json();
}

async function fetchFileData(filename) {
  const res = await fetch(`/api/json-files/${filename}`);
  if (!res.ok) {
    alert(`Erreur chargement fichier ${filename}`);
    return null;
  }
  return await res.json();
}

function clearActive() {
  [...sidebar.children].forEach(li => li.classList.remove('active'));
}

function buildSidebar(files) {
  sidebar.innerHTML = '';
  files.forEach((file, i) => {
    const li = document.createElement('li');
    li.textContent = file.name.replace('.json', '');
    li.title = `Dernière mise à jour : ${new Date(file.lastModified).toLocaleString()}`;
    li.addEventListener('click', async () => {
      clearActive();
      li.classList.add('active');
      currentFile = file.name;
      await showFileData(file);
    });
    if (i === 0) {
      li.classList.add('active');
      currentFile = file.name;
    }
    sidebar.appendChild(li);
  });
}

async function showFileData(file) {
  mainTitle.textContent = `Franchise: ${file.name.replace('.json', '')}`;
  lastUpdated.textContent = `Dernière mise à jour : ${new Date(file.lastModified).toLocaleString()}`;

  const data = await fetchFileData(file.name);
  if (!data) {
    tableContainer.innerHTML = '<p>Erreur chargement des données.</p>';
    return;
  }
  renderTable(data);
}

function renderTable(data) {
  let html = `
    <table>
      <thead>
        <tr>
          <th>IP</th>
          <th>ID Hôte</th>
          <th>Nom de la machine</th>
          <th>OS</th>
          <th>Équipements détectés</th>
          <th>Résultat du scan</th>
          <th>Latence WAN moyenne</th>
          <th>Version du composant</th>
        </tr>
      </thead>
      <tbody>
  `;

  for (const ip in data) {
    if (!data.hasOwnProperty(ip)) continue;

    const item = data[ip];
    const hostname = item.hostname?.map(h => h.name).join(', ') || 'N/A';
    const os = item.osmatch?.name || 'N/A';
    const eqCount = item.equipements_detectes ?? 0;

    const scan = item.scan || {};
    const portsOuverts = scan.ports_ouverts ?? 0;
    const portsFermes = scan.ports_fermes ?? 0;
    const synthese = scan.synthese || 'N/A';

    const latence = item.latence_wan || 'N/A';
    const version = item.version_composant || 'N/A';
    const hostid = item.hostid || 'N/A';

    html += `
      <tr>
        <td>${ip}</td>
        <td>${hostid}</td>
        <td>${hostname}</td>
        <td>${os}</td>
        <td>${eqCount}</td>
        <td>
          <span class="${portsOuverts > 0 ? 'status-open' : 'status-closed'}">
            Ports ouverts: ${portsOuverts}
          </span><br/>
          Ports fermés: ${portsFermes}<br/>
          <em>${synthese}</em>
        </td>
        <td>${latence}</td>
        <td>${version}</td>
      </tr>
    `;
  }

  html += '</tbody></table>';
  tableContainer.innerHTML = html;
}

refreshBtn.addEventListener('click', async () => {
  refreshBtn.disabled = true;
  refreshBtn.textContent = 'Chargement...';

  fileList = await fetchFileList();
  buildSidebar(fileList);

  if (fileList.length > 0) {
    await showFileData(fileList[0]);
  } else {
    mainTitle.textContent = 'Aucun fichier JSON trouvé';
    lastUpdated.textContent = '';
    tableContainer.innerHTML = '';
  }

  refreshBtn.disabled = false;
  refreshBtn.textContent = 'Rafraîchir';
});

// Au chargement de la page, on initialise
(async () => {
  fileList = await fetchFileList();
  buildSidebar(fileList);
  if (fileList.length > 0) {
    await showFileData(fileList[0]);
  } else {
    mainTitle.textContent = 'Aucun fichier JSON trouvé';
  }
})();
