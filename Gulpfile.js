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
var clean = require('gulp-clean');

var objectives = 'yaml/objectives/**/*.yaml';
var levelTemplate = 'level000.hbs';

var syllabus = 'yaml/syllabus/**/*.yaml';
var syllabusTemplate = 'syllabus.hbs';

Handlebars.registerHelper('markdown', function(text) {
  return marked(text);
});

gulp.task('default', ['clean', 'compile','copy', 'watch']);
gulp.task('deploy', ['clean', 'compile','copy', 'github']);

gulp.task('watch', function () {
  gulp.watch([levelTemplate, objectives], ['compile'])
  gulp.watch([syllabus, syllabusTemplate], ['syllabus'])
});

gulp.task('clean', function () {
  return gulp.src('./dist', {read: false})
    .pipe(clean());
});

gulp.task('copy', function () {
  var options = {};
  return gulp.src(  ['./fonts/**/*',
                    './img/**/*',
                    './js/**/*',
                    './css/**/*',
                    'index.html'], { "base" : "." } 
                  )
    .pipe(gulp.dest('dist'));
});

gulp.task('compile', function(){
  var options = {};
  gulp.src(objectives)
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
  gulp.src(syllabus)
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
  return gulp.src('./dist/**/*')
    .pipe(deploy(options));
});
