import pkg from 'gulp';

const {series, parallel, src, dest} = pkg;
import rename from "gulp-rename";
import zip from "gulp-zip";
import {deleteAsync} from "del";
import {readPackageSync} from "read-pkg";
import through from "through2";

// The `clean` function is not exported so it can be considered a private task.
// It can still be used within the `series()` composition.
async function clean(cb) {
  await deleteAsync(["./release/**"]);
  cb();
}

function update_jquery() {
  return src(['node_modules/jquery/dist/jquery.min.js']).pipe(dest('extension/contribs'));
}

function update_loglevel() {
  return src(['node_modules/loglevel/dist/loglevel.min.js']).pipe(dest('extension/contribs'));
}

const build = series(update_jquery, update_loglevel);

function copy_files_for_browser(browser, manifest) {
  return parallel(
    // Pour les fichiers non-image
    () => src(["extension/**", "!extension/manifest.*", "!extension/**/*.{png,jpg,jpeg,gif,svg,ico}"])
      .pipe(dest(`release/${browser}`)),
    // Pour les images et autres fichiers binaires - Encoding = false pour ne pas corrompre les fichiers
    () => src(["extension/**/*.{png,jpg,jpeg,gif,svg,ico}"])
      .pipe(dest(`release/${browser}`)),
    // Pour le manifest
    () => src(manifest).pipe(rename('manifest.json')).pipe(dest(`release/${browser}`))
  );
}


export const copy_files_for_chrome = copy_files_for_browser('chrome', 'extension/manifest.chrome.json');
export const copy_files_for_firefox = copy_files_for_browser('firefox', 'extension/manifest.firefox.json');
export const copy_files_for_edge = copy_files_for_browser('edge', 'extension/manifest.chrome.json');


function package_for_browser(browser, cb) {
  src(`release/${browser}/**`)
    .pipe(zip(`${browser}-` + readPackageSync().version + '.zip'))
    .pipe(dest('release'));
  cb();
}

export const package_for_chrome = (cb) => package_for_browser('chrome', cb);
export const package_for_firefox = (cb) => package_for_browser('firefox', cb);
export const package_for_edge = (cb) => package_for_browser('edge', cb);

export const packchrome = series(copy_files_for_chrome, (cb) => package_for_browser('chrome', cb));
export const packfirefox = series(copy_files_for_firefox, (cb) => package_for_browser('firefox', cb));
export const packedge = series(copy_files_for_edge, (cb) => package_for_browser('edge', cb));


// Fonction pour mettre à jour les en-têtes des fichiers avec la version du package.json
function updateHeaders() {
  const packageData = readPackageSync();
  const version = packageData.version;
  const currentYear = new Date().getFullYear();

  // Création du modèle d'en-tête
  const headerTemplate =
`/**
 * Xtense - Extension pour navigateur permettant la synchronisation avec OGSpy
 *
 * @author      OGSteam
 * @copyright   ${currentYear} OGSteam
 * @license     GNU GPL v2
 * @version     ${version}
 */
`;

  // Fonction pour remplacer l'en-tête dans un fichier
  function replaceHeader(content) {
    // Recherche et remplacement de l'en-tête existant
    const headerRegex = /\/\*\*[\s\S]*?\*\/\s*/;
    if (headerRegex.test(content)) {
      return content.replace(headerRegex, headerTemplate);
    } else {
      return headerTemplate + content;
    }
  }

  // Traitement de tous les fichiers JS dans le projet
  return src(['extension/**/*.js', '!extension/contribs/**/*.js'])
    .pipe(through.obj(function(file, enc, cb) {
      if (file.isBuffer()) {
        const content = file.contents.toString();
        file.contents = Buffer.from(replaceHeader(content));
      }
      cb(null, file);
    }))
    .pipe(dest(function(file) {
      return file.base;
    }));
}

export const headers = updateHeaders;

// Ajouter la tâche updateHeaders dans le processus de build
const _default = series(clean, build, updateHeaders, parallel(packchrome, packfirefox, packedge));
export {_default as default};
