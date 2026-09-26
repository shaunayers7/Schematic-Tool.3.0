(function() {
  var apps = window.EB_APPS || [];
  var appGrid = document.getElementById('appGrid');
  var moduleGrid = document.getElementById('moduleGrid');
  var homeView = document.getElementById('homeView');
  var appView = document.getElementById('appView');
  var toolView = document.getElementById('toolView');
  var toolFrame = document.getElementById('toolFrame');
  var searchInput = document.getElementById('appSearch');
  var searchBox = document.querySelector('.search-box');
  var activeAppId = null;
  var activeModuleId = null;
  var installPrompt = null;

  function makeElement(tag, className, text) {
    var element = document.createElement(tag);
    if (className) element.className = className;
    if (text) element.textContent = text;
    return element;
  }

  function matches(item, query) {
    var haystack = [item.title, item.category, item.description].concat(item.tags || []).join(' ').toLowerCase();
    return haystack.indexOf(query.toLowerCase()) !== -1;
  }

  function createIcon(item, large) {
    var icon = makeElement('span', 'app-icon ' + item.tone + (large ? ' large' : ''));
    var glyph = makeElement('span', 'app-icon-glyph', item.icon);
    glyph.setAttribute('aria-hidden', 'true');
    icon.appendChild(glyph);
    icon.setAttribute('aria-hidden', 'true');
    return icon;
  }

  function createAppTile(app) {
    var tile = document.createElement('button');
    tile.type = 'button';
    tile.className = 'app-tile';
    tile.dataset.appId = app.id;
    tile.setAttribute('aria-label', 'Open ' + app.title + ', ' + app.modules.length + ' modules');
    tile.appendChild(createIcon(app, false));
    tile.appendChild(makeElement('span', 'app-name', app.title));
    tile.appendChild(makeElement('span', 'app-subtitle', app.category));
    return tile;
  }

  function createModuleTile(module) {
    var tile = document.createElement('button');
    tile.type = 'button';
    tile.className = 'module-tile';
    tile.dataset.moduleId = module.id;
    tile.setAttribute('aria-label', 'Open module ' + module.title);
    tile.appendChild(createIcon(module, false));
    tile.appendChild(makeElement('span', 'module-name', module.title));
    tile.appendChild(makeElement('span', 'module-description', module.description));
    return tile;
  }

  function renderApps(query) {
    appGrid.replaceChildren();
    var visibleApps = apps.filter(function(app) { return matches(app, query || ''); });
    visibleApps.forEach(function(app) { appGrid.appendChild(createAppTile(app)); });
    document.getElementById('appCount').textContent = String(apps.length).padStart(2, '0') + ' APP' + (apps.length === 1 ? '' : 'S');
    document.getElementById('emptySearch').hidden = visibleApps.length !== 0;
  }

  function renderModules(app) {
    moduleGrid.replaceChildren();
    app.modules.forEach(function(module) { moduleGrid.appendChild(createModuleTile(module)); });
    document.getElementById('moduleCount').textContent = String(app.modules.length).padStart(2, '0');
  }

  function setHome() {
    activeAppId = null;
    activeModuleId = null;
    homeView.hidden = false;
    appView.hidden = true;
    toolView.hidden = true;
    searchBox.hidden = false;
  }

  function setApp(app) {
    if (!app) return setHome();
    activeAppId = app.id;
    activeModuleId = null;
    homeView.hidden = true;
    appView.hidden = false;
    toolView.hidden = true;
    searchBox.hidden = true;
    document.getElementById('activeAppIcon').className = 'app-icon large ' + app.tone;
    document.getElementById('activeAppIcon').replaceChildren(createIcon(app, false).firstElementChild);
    document.getElementById('activeAppCategory').textContent = app.category + ' APP';
    document.getElementById('appTitle').textContent = app.title;
    document.getElementById('appDescription').textContent = app.description;
    renderModules(app);
  }

  function setModule(app, module) {
    if (!app || !module) return setHome();
    activeAppId = app.id;
    activeModuleId = module.id;
    homeView.hidden = true;
    appView.hidden = true;
    toolView.hidden = false;
    searchBox.hidden = true;
    document.getElementById('activeToolName').textContent = module.title.toUpperCase();
    document.getElementById('moduleBackLabel').textContent = app.title;
    if (toolFrame.dataset.moduleId !== module.id) {
      toolFrame.src = module.href;
      toolFrame.dataset.moduleId = module.id;
    }
  }

  function routeFromLocation() {
    var route = new URLSearchParams(window.location.hash.slice(1));
    var app = apps.find(function(item) { return item.id === route.get('app'); });
    if (!app) return setHome();
    if (route.has('module')) {
      var module = app.modules.find(function(item) { return item.id === route.get('module'); });
      return setModule(app, module);
    }
    setApp(app);
  }

  function openApp(appId) {
    var app = apps.find(function(item) { return item.id === appId; });
    if (!app || activeAppId === appId) return;
    if (app.modules.length === 1) {
      openModuleForApp(app, app.modules[0]);
      return;
    }
    window.history.pushState({ ebHubView: 'app', appId: appId }, '', '#app=' + encodeURIComponent(appId));
    setApp(app);
  }

  function openModuleForApp(app, module) {
    window.history.pushState({ ebHubView: 'module', appId: app.id, moduleId: module.id }, '', '#app=' + encodeURIComponent(app.id) + '&module=' + encodeURIComponent(module.id));
    setModule(app, module);
  }

  function openModule(moduleId) {
    var app = apps.find(function(item) { return item.id === activeAppId; });
    var module = app && app.modules.find(function(item) { return item.id === moduleId; });
    if (!app || !module || activeModuleId === moduleId) return;
    openModuleForApp(app, module);
  }

  function goBack() {
    if (window.history.state && window.history.state.ebHubView) {
      window.history.back();
      return;
    }
    if (activeModuleId) {
      var app = apps.find(function(item) { return item.id === activeAppId; });
      window.history.replaceState({ ebHubView: 'app', appId: activeAppId }, '', '#app=' + encodeURIComponent(activeAppId));
      setApp(app);
      return;
    }
    window.history.replaceState({ ebHubView: 'home' }, '', window.location.pathname + window.location.search);
    setHome();
  }

  function updateConnectionStatus() {
    var isOnline = navigator.onLine;
    var status = document.getElementById('connectionStatus');
    status.classList.toggle('offline', !isOnline);
    document.getElementById('connectionLabel').textContent = isOnline ? 'ONLINE' : 'OFFLINE - SAVING LOCALLY';
  }

  appGrid.addEventListener('click', function(event) {
    var tile = event.target.closest('[data-app-id]');
    if (tile) openApp(tile.dataset.appId);
  });

  moduleGrid.addEventListener('click', function(event) {
    var tile = event.target.closest('[data-module-id]');
    if (tile) openModule(tile.dataset.moduleId);
  });

  document.getElementById('appBackButton').addEventListener('click', goBack);
  document.getElementById('moduleBackButton').addEventListener('click', goBack);
  searchInput.addEventListener('input', function() { renderApps(searchInput.value.trim()); });

  window.addEventListener('popstate', routeFromLocation);
  window.addEventListener('online', updateConnectionStatus);
  window.addEventListener('offline', updateConnectionStatus);

  window.addEventListener('beforeinstallprompt', function(event) {
    event.preventDefault();
    installPrompt = event;
    document.getElementById('installButton').hidden = false;
  });

  document.getElementById('installButton').addEventListener('click', function() {
    if (!installPrompt) return;
    installPrompt.prompt();
    installPrompt = null;
    document.getElementById('installButton').hidden = true;
  });

  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('service-worker.js').catch(function(error) {
        console.error('Service worker registration failed', error);
      });
    });
  }

  renderApps('');
  updateConnectionStatus();
  routeFromLocation();
})();