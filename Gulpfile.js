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

var objectives = 'yaml/objectives/**/*.yaml';
var syllabus = 'yaml/syllabus/**/*.yaml';
var Syllabus
var levelTemplate = 'level000.hbs';

Handlebars.registerHelper('markdown', function(text) {
  return marked(text);
});

gulp.task('default', ['compile','copy', 'watch']);
gulp.task('deploy', ['compile','copy', 'github']);

gulp.task('watch', function () {
  gulp.watch([levelTemplate, objectives], ['compile'])
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

gulp.task('github', function () {
  var options = {};
  return gulp.src('./dist/**/*')
    .pipe(deploy(options));
});

gulp.task('copy', function () {
  var options = {};
  return gulp.src(  ['./fonts/**/*',
                    './img/**/*',
                    './js/**/*',
                    './css/**/*'], { "base" : "." } 
                  )
    .pipe(gulp.dest('dist'));
});


