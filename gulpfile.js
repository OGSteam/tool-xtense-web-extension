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

function build(cb) {
  update_jquery();
  update_loglevel();
  cb();
}

function copy_files_for_firefox() {
  return src(["extension/**", "!extension/manifest.*"]).pipe(dest('release/firefox'));
}
function copy_firefox_manifest() {
  return src('extension/manifest.firefox.json').pipe(rename('manifest.json')).pipe(dest('release/firefox'));
}
function copy_firefox_htmlfiles() {
  return src('extension/ui/firefox/xtense.html').pipe(dest('release/firefox'));
}

function copy_files_for_chrome() {
  return src(["extension/**", "!extension/manifest.*"]).pipe(dest('release/chrome'));
}
function copy_chrome_manifest() {
  return src('extension/manifest.chrome.json').pipe(rename('manifest.json')).pipe(dest('release/chrome'));
}
function copy_chrome_htmlfiles() {
  return src('extension/ui/chrome/xtense.html').pipe(dest('release/chrome'));
}


function copy_files_for_edge() {
  return src(["extension/**", "!extension/manifest.*"]).pipe(dest('release/edge'));
}
function copy_edge_manifest() {
  return src('extension/manifest.chrome.json').pipe(rename('manifest.json')).pipe(dest('release/edge'));
}
function copy_edge_htmlfiles() {
  return src('extension/ui/edge/xtense.html').pipe(dest('release/edge'));
}



function package_for_chrome(cb) {
  src("release/chrome/**")
    .pipe(zip('chrome-' + readPackageSync().version + '.zip'))
    .pipe(dest('release'));
  cb();
}

function package_for_firefox(cb) {
  src("release/firefox/**")
    .pipe(zip('firefox-' + readPackageSync().version + '.zip'))
    .pipe(dest('release'));
  cb();
}

function package_for_edge(cb) {
  src("release/edge/**")
    .pipe(zip('edge-' + readPackageSync().version + '.zip'))
    .pipe(dest('release'));
  cb();
}

const _clean = clean;
export { _clean as clean };
const _build = build;
export { _build as build };
export const packchrome = series(parallel(copy_files_for_chrome, copy_chrome_manifest, copy_chrome_htmlfiles), package_for_chrome);
export const packfirefox = series(parallel(copy_files_for_firefox, copy_firefox_manifest, copy_firefox_htmlfiles), package_for_firefox);
export const packedge = series(parallel(copy_files_for_edge, copy_edge_manifest, copy_edge_htmlfiles), package_for_edge);
const _default = series(clean, build, parallel(packchrome,packfirefox,packedge));
export { _default as default };
