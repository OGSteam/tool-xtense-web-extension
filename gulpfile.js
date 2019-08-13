
const { series, parallel , src, dest } = require('gulp');
const rename = require('gulp-rename');
const zip = require('gulp-zip');
const del = require('del');
const manifest = require('read-pkg')

// The `clean` function is not exported so it can be considered a private task.
// It can still be used within the `series()` composition.
function clean(cb) {
    del.sync(['./release/**']);
    console.log('Deleted files and directories: release/**');
    cb();
}

function copy_files_for_firefox() {
    return src(['extension/**','!extension/manifest.*']).pipe(dest('release/firefox'));
}
function copy_firefox_manifest() {
    return src('extension/manifest.firefox').pipe(rename('manifest.json')).pipe(dest('release/firefox'));
}

function copy_files_for_chrome() {
    return src(['extension/**', '!extension/manifest.*']).pipe(dest('release/chrome'));
}
function copy_chrome_manifest() {
    return src('extension/manifest.chrome').pipe(rename('manifest.json')).pipe(dest('release/chrome'));
}

function package_for_chrome(cb){
    console.log('Ready to Zip Chrome Files');
    src('release/chrome/**')
        .pipe(zip('chrome-' + manifest.sync().version + '.zip'))
        .pipe(dest('release'));
    cb();
}

function package_for_firefox(cb){
    console.log('Ready to Zip Firefox Files');
    src('release/firefox/**')
        .pipe(zip('firefox-' + manifest.sync().version + '.zip'))
        .pipe(dest('release'));
    cb();
}

exports.clean = clean;
exports.buildchrome = series(parallel(copy_files_for_chrome , copy_chrome_manifest), package_for_chrome);
exports.buildfirefox = series(parallel(copy_files_for_firefox , copy_firefox_manifest), package_for_firefox);
exports.default = series(clean,
                         parallel(series(parallel(copy_files_for_chrome , copy_chrome_manifest), package_for_chrome),
                         series(parallel(copy_files_for_firefox , copy_firefox_manifest), package_for_firefox)));
