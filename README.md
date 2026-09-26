# Electric Boyes Worksite Hub

An installable, offline-capable hub for Electric Boyes worksite tools. The first module is the Schematic Takeoff tool. Tool modules are maintained in this repository; each person's tool data stays in that person's browser unless they export and share a project file.

## Local Preview

The service worker and offline installation require HTTPS, or `localhost`. Do not open the hub by double-clicking `index.html`.

From the repository root, start any static HTTP server, then open its localhost URL. For example, if Python is installed:

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000` in a browser. Local preview is for development; it does not publish the hub to coworkers.

## Publish The Shared Hub

Deploy this repository as a static site on an HTTPS host. Configure the host to serve the repository root as the site root; no build command is required. A free static host is sufficient. After deployment, open the HTTPS URL once while online so the service worker can cache the hub and tools.

The hub is accessible to anyone with the link. Do not commit client plans, project backups, credentials, or confidential reference documents to the deployed repository.

## Install And Use Offline

- **iPhone/iPad:** Open the HTTPS hub in Safari, tap Share, then Add to Home Screen. Launch the saved app once while online. After its first successful load, the hub and bundled tool pages can open offline.
- **Desktop:** Use the browser's Install app control when offered, or the browser menu's install option.
- The hub reports connection status. Tool data is saved locally by each module; offline status does not replace a project export or cloud backup.
- New app versions use a versioned service-worker cache. Once the new version has been visited online, it replaces the old cached shell while keeping browser-stored tool data.

## Move Existing Schematic Data

Data saved while opening an HTML file directly in Safari may not be visible to the hosted HTTPS site. Before switching, open the existing Schematic Tool file, use **Tools > Backup All**, and save the `.ebbackup` file. Open the hosted hub online, launch Schematic Takeoff, then use **Tools > Open** to import the backup. Verify the clients and floor plans before deleting or replacing the original file. To use the same data on another device, transfer the backup through a user-managed location such as Google Drive and import it there.

Browser storage is per browser profile and device. The hub does not sign users in, synchronize automatically, or share a user's local data with coworkers.

## Adding An App Or Module

Only the maintainer adds apps and modules in v1. Each app is an icon on the home screen; tapping it shows that app's modules. Put the module page and its assets in a folder under `tools/`, then add an app with one or more module records to `app/catalog.js`:

```js
{
	id: 'inventory',
	title: 'Inventory',
	category: 'FIELD',
	description: 'Track materials and equipment.',
	icon: 'I',
	tone: 'green',
	tags: ['stock', 'materials'],
	modules: [
		{
			id: 'inventory-count',
			title: 'Inventory Count',
			description: 'Record equipment and material counts.',
			icon: '1',
			tone: 'blueprint',
			href: 'tools/inventory/index.html',
			tags: ['inventory', 'materials', 'counts']
		}
	]
}
```

Use unique, stable IDs and paths relative to the site root. Keep each module's data in its own local-storage or IndexedDB namespace and provide its own export/import workflow. Add each module page and its assets to `APP_FILES` in `service-worker.js` for offline launch. Increment `CACHE_NAME` when publishing changed files so returning devices install the new cache. Preview over localhost and verify app/module navigation, persistence after reload, and offline behavior before publishing.

## Project Layout

- `index.html` and `app/`: hub interface, catalog, navigation, and styles.
- `tools/schematic/`: existing Schematic Takeoff application.
- `manifest.webmanifest` and `service-worker.js`: installation metadata and offline app cache.