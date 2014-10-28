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

var paths = {
  assets: [
    './fonts/**/*',
    './img/**/*',
    './js/**/*',
    './css/**/*',
    'index.html'
  ],
  yaml: {
    objectives: 'yaml/objectives/**/*.yaml',
    syllabus: 'yaml/syllabus/**/*.yaml'
  },
  templates: {
    level: 'level000.hbs',
    syllabus: 'syllabus.hbs'
  }
};


// Public Tasks

gulp.task('default', ['build', 'watch']);
gulp.task('build', ['assemble']);
gulp.task('deploy', ['github']);
gulp.task('clean', function (cb) {
  return del('dist', cb)
});


// Watches

gulp.task('watch', function () {
  gulp.watch('**/*.{yaml,hbs}', ['compile'])
  gulp.watch([paths.assets], ['copy'])
});


// Private Tasks


gulp.task('copy', function () {
  return gulp.src(paths.assets, { "base" : "." })
    .pipe(gulp.dest('dist'));
});

gulp.task('assemble', function(cb){
 runSequence('clean', ['copy', 'compile'], cb);
});

gulp.task('compile', ['objectives', 'syllabus']);

gulp.task('github', ['build'], function () {
  var options = {};
  gulp.src('dist/**/*')
    .pipe(deploy(options));
});

// These two tasks need to be refactored after we start using partials

gulp.task('objectives', function(){
  var options = {};
  return gulp.src(paths.yaml.objectives)
    .pipe(yaml())
    .pipe(tap(function(file, t){
      var hbs = fs.readFileSync(paths.templates.level);
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
  return gulp.src(paths.yaml.syllabus)
    .pipe(yaml())
    .pipe(tap(function(file, t){
      var hbs = fs.readFileSync(paths.templates.syllabus);
      var template = Handlebars.compile(hbs.toString());
      var json = JSON.parse(file.contents.toString());
      var html = template(json);

      file.contents = new Buffer(html, 'utf-8')
    }))
    .pipe(rename({extname: '.html'}))
    .pipe(flatten())
    .pipe(gulp.dest('dist'))
});
