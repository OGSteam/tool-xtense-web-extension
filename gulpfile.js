
const { series, parallel , src, dest } = require('gulp');
const rename = require('gulp-rename');
const zip = require('gulp-zip');
const del = require('del');
const manifest = require('read-pkg')

// The `clean` function is not exported so it can be considered a private task.
// It can still be used within the `series()` composition.
function clean(cb) {
    del(['release/**']);
    console.log('Deleted files and directories: release/**');
    cb();
}

function buid_for_firefox(cb){
    //mv release/firefox/manifest.firefox release/firefox/manifest.json
    //cross-var cross-zip release/firefox release/xtense-firefox-$npm_package_version.zip
    src(['extension/**','!extension/manifest.*']).pipe(dest('release/firefox'));
    src('extension/manifest.firefox').pipe(rename('manifest.json')).pipe(dest('release/firefox'));
    console.log('Files copied to Firefox Release Folder');


    cb();
}

function buid_for_chrome(cb){
    src(['extension/**','!extension/manifest.*']).pipe(dest('release/chrome'));
    src('extension/manifest.chrome').pipe(rename('manifest.json')).pipe(dest('release/chrome'));
    console.log('Files copied to Chrome Release Folder');
    cb();
}

function package_for_chrome(cb){
    src('release/chrome/*')
        .pipe(zip('chrome-' + manifest.sync().version + '.zip'))
        .pipe(dest('release'));
    cb();
}

function package_for_firefox(cb){
    src('release/firefox/*')
        .pipe(zip('firefox-' + manifest.sync().version + '.zip'))
        .pipe(dest('release'));
    cb();
}

exports.clean = clean;
exports.build = parallel(buid_for_firefox, buid_for_chrome );
exports.package = parallel(package_for_chrome, package_for_firefox );
exports.default = series(clean, buid_for_firefox, buid_for_chrome, package_for_chrome, package_for_firefox);
