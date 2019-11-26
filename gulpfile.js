var gulp = require('gulp');
var ts = require('gulp-typescript');
var nodemon = require('gulp-nodemon');
var jsProject = ts.createProject('jsconfig.json');
var clean = require('gulp-clean');

gulp.task('clean', function () {
    return gulp.src('dist/*')
        .pipe(clean({force: true}))
        .pipe(gulp.dest('dist'));
});

gulp.task('compile', function () {
    return gulp.src('src/**/*.js')
        .pipe(gulp.dest('dist'));
});


gulp.task('watch',['compile'], function () {
    nodemon({
        script: 'dist/server.js',
        ignore: [
            'dist/',
            'node_modules/',
        ],
        ext: "ts js env json",
        tasks: ['compile']
    })
});