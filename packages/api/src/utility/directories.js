const os = require('os');
const path = require('path');
const fs = require('fs');
const cleanDirectory = require('./cleanDirectory');
const platformInfo = require('./platformInfo');

const createDirectories = {};
const ensureDirectory = (dir, clean) => {
  if (!createDirectories[dir]) {
    if (clean && fs.existsSync(dir)) {
      console.log(`Cleaning directory ${dir}`);
      cleanDirectory(dir);
    }
    if (!fs.existsSync(dir)) {
      console.log(`Creating directory ${dir}`);
      fs.mkdirSync(dir);
    }
    createDirectories[dir] = true;
  }
};

function datadir() {
  const dir = path.join(os.homedir(), 'dbgate-data');
  ensureDirectory(dir);

  return dir;
}

const dirFunc = (dirname, clean = false) => () => {
  const dir = path.join(datadir(), dirname);
  ensureDirectory(dir, clean);

  return dir;
};

const jsldir = dirFunc('jsl', true);
const rundir = dirFunc('run', true);
const uploadsdir = dirFunc('uploads', true);
const pluginsdir = dirFunc('plugins');
const archivedir = dirFunc('archive');
const appdir = dirFunc('apps');
const filesdir = dirFunc('files');

function packagedPluginsDir() {
  // console.log('CALL DIR FROM', new Error('xxx').stack);
  // console.log('__dirname', __dirname);
  // console.log('platformInfo.isElectronBundle', platformInfo.isElectronBundle);
  // console.log('platformInfo.isForkedApi', platformInfo.isForkedApi);
  if (platformInfo.isDevMode) {
    return path.resolve(__dirname, '../../../../plugins');
  }
  if (platformInfo.isDocker) {
    return '/home/dbgate-docker/plugins';
  }
  if (platformInfo.isNpmDist) {
    // node_modules
    return global['dbgateApiPackagedPluginsPath'];
  }
  if (platformInfo.isElectronBundle) {
    return path.resolve(__dirname, '../../plugins');

    // if (platformInfo.isForkedApi) {
    //   return path.resolve(__dirname, '../plugins');
    // } else {
    //   return path.resolve(__dirname, '../../plugins');
    // }
  }
  return null;
}

const packagedPluginList =
  packagedPluginsDir() != null ? fs.readdirSync(packagedPluginsDir()).filter(x => x.startsWith('dbgate-plugin-')) : [];

function getPluginBackendPath(packageName) {
  if (packagedPluginList.includes(packageName)) {
    if (platformInfo.isDevMode) {
      return path.join(packagedPluginsDir(), packageName, 'src', 'backend', 'index.js');
    }
    return path.join(packagedPluginsDir(), packageName, 'dist', 'backend.js');
  }

  return path.join(pluginsdir(), packageName, 'dist', 'backend.js');
}

let archiveLinksCache = {};

function resolveArchiveFolder(folder) {
  if (folder.endsWith('.link')) {
    if (!archiveLinksCache[folder]) {
      archiveLinksCache[folder] = fs.readFileSync(path.join(archivedir(), folder), 'utf-8');
    }
    return archiveLinksCache[folder];
  }
  return path.join(archivedir(), folder);
}

function clearArchiveLinksCache() {
  archiveLinksCache = {};
}

module.exports = {
  datadir,
  jsldir,
  rundir,
  uploadsdir,
  archivedir,
  appdir,
  ensureDirectory,
  pluginsdir,
  filesdir,
  packagedPluginsDir,
  packagedPluginList,
  getPluginBackendPath,
  resolveArchiveFolder,
  clearArchiveLinksCache,
};
