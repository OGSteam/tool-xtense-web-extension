const { series, parallel , src, dest } = require("gulp");
const rename = require("gulp-rename");
const zip = require("gulp-zip");
const del = require("del");
const manifest = require("read-pkg");

// The `clean` function is not exported so it can be considered a private task.
// It can still be used within the `series()` composition.
function clean(cb) {
    del.sync(["./release/**"]);
    cb();
}

function update_jquery() {
    return src(["node_modules/jquery/dist/jquery.min.js"]).pipe(dest("extension/contribs"));
}

function update_loglevel() {
    return src(["node_modules/loglevel/dist/loglevel.min.js"]).pipe(dest("extension/contribs"));
}

function build(cb) {
    update_jquery();
    update_loglevel();
    cb();
}

function copy_files_for_firefox() {
    return src(["extension/**","!extension/manifest.*"]).pipe(dest("release/firefox"));
}
function copy_firefox_manifest() {
    return src("extension/manifest.firefox").pipe(rename("manifest.json")).pipe(dest("release/firefox"));
}

function copy_files_for_chrome() {
    return src(["extension/**", "!extension/manifest.*"]).pipe(dest("release/chrome"));
}
function copy_chrome_manifest() {
    return src("extension/manifest.chrome").pipe(rename("manifest.json")).pipe(dest("release/chrome"));
}

function package_for_chrome(cb){
    src("release/chrome/**")
        .pipe(zip("chrome-" + manifest.sync().version + ".zip"))
        .pipe(dest("release"));
    cb();
}

function package_for_firefox(cb){
    src("release/firefox/**")
        .pipe(zip("firefox-" + manifest.sync().version + ".zip"))
        .pipe(dest("release"));
    cb();
}



exports.clean = clean;
exports.build = build;
exports.packchrome = series(parallel(copy_files_for_chrome , copy_chrome_manifest), package_for_chrome);
exports.packfirefox = series(parallel(copy_files_for_firefox , copy_firefox_manifest), package_for_firefox);
exports.default = series(clean, build,
                         parallel(series(parallel(copy_files_for_chrome , copy_chrome_manifest), package_for_chrome),
                         series(parallel(copy_files_for_firefox , copy_firefox_manifest), package_for_firefox)));
