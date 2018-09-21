'use strict';

var gulp = require('gulp');
var replaceExt = require('replace-ext');

gulp.task('lesspass', [], function () {
    return gulp.src(['node_modules/lesspass-pure/dist/**/*', 'extension/popup.js'])
        .pipe(gulp.dest('extension/dist/'));
});

gulp.task('build', [], function () {
    //gulp.start('lesspass');
    var path = '/some/dir/file.js';
    var newPath = replaceExt(path, '.coffee');
});

gulp.task('default', ['build'], function () {

});
