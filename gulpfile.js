import pkg from 'gulp';
const { series, parallel, src, dest } = pkg;
import rename from "gulp-rename";
import zip from "gulp-zip";
import { deleteAsync } from "del";
import { readPackageSync } from "read-pkg";

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
    () => src(["extension/**", "!extension/manifest.*"]).pipe(dest(`release/${browser}`)),
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


const _default = series(clean, build, parallel(packchrome, packfirefox, packedge));export { _default as default };
