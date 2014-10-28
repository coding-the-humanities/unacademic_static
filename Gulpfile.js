var gulp = require('gulp');
var fs = require('fs');

var Handlebars = require('handlebars');
var rename = require('gulp-rename');
var watch = require('gulp-watch');
var yaml = require('gulp-yaml');
var tap = require('gulp-tap');
var marked = require('marked');
var flatten = require('gulp-flatten');
var deploy = require('gulp-gh-pages');
var del = require('del');
var runSequence = require('run-sequence')

// HELPERS

Handlebars.registerHelper('markdown', function(text) {
  return marked(text);
});


// PATHS

var assets =  [
  './fonts/**/*',
  './img/**/*',
  './js/**/*',
  './css/**/*',
  'index.html'
]

var objectives = 'yaml/objectives/**/*.yaml';
var levelTemplate = 'level000.hbs';

var syllabus = 'yaml/syllabus/**/*.yaml';
var syllabusTemplate = 'syllabus.hbs';


// External Tasks

gulp.task('default', ['build', 'watch']);

gulp.task('build', function(cb){
 runSequence('clean', ['copy', 'compile', 'syllabus'], cb);
});

gulp.task('deploy', function(cb){
 runSequence('build', ['github'], cb);
});


// Watches

gulp.task('watch', function () {
  gulp.watch([levelTemplate, objectives], ['compile'])
  gulp.watch([syllabus, syllabusTemplate], ['syllabus'])
  gulp.watch([assets], ['copy'])
});


// Internal Tasks

gulp.task('clean', function (cb) {
  return del('dist', cb)
});

gulp.task('copy', function () {
  return gulp.src(assets, { "base" : "." })
    .pipe(gulp.dest('dist'));
});

gulp.task('clean', function (cb) {
  del('dist', cb)
});

// These two tasks need to be refactored after we start using partials

gulp.task('compile', function(){
  var options = {};
  return gulp.src(objectives)
    .pipe(yaml())
    .pipe(tap(function(file, t){
      var hbs = fs.readFileSync(levelTemplate);
      var template = Handlebars.compile(hbs.toString());

      var json = JSON.parse(file.contents.toString());
      var html = template(json);

      file.contents = new Buffer(html, 'utf-8')
    }))
    .pipe(rename({extname: '.html'}))
    .pipe(flatten())
    .pipe(gulp.dest('dist'))
});

gulp.task('syllabus', function(){
  var options = {};
  return gulp.src(syllabus)
    .pipe(yaml())
    .pipe(tap(function(file, t){
      var hbs = fs.readFileSync(syllabusTemplate);
      var template = Handlebars.compile(hbs.toString());
      var json = JSON.parse(file.contents.toString());
      var html = template(json);

      file.contents = new Buffer(html, 'utf-8')
    }))
    .pipe(rename({extname: '.html'}))
    .pipe(flatten())
    .pipe(gulp.dest('dist'))
});

gulp.task('github', function () {
  var options = {};
  gulp.src('dist/**/*')
    .pipe(deploy(options));
});
