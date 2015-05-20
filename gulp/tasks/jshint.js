var gulp        = require('gulp'),
    jshint      = require('gulp-jshint'),
    cache       = require('gulp-cached'),
    handleErrors = require('../util/handleErrors');

gulp.task('jshint', function (done) {
    setTimeout(done, 1);
//    return gulp.src(paths.scripts)
//        .pipe(handleErrors())
//        .pipe(cache('jshint', { optimizeMemory: true }))
//        .pipe(jshint())
//        .pipe(jshint.reporter('jshint-summary'));
});
