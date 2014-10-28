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


// TEMPLATE HELPERS

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
  objectives: {
    data: 'yaml/objectives/**/*.yaml',
    template: 'level000.hbs'
  },
  syllabus: {
    data: 'yaml/syllabus/**/*.yaml',
    template: 'syllabus.hbs'
  }
};


// Public Tasks

gulp.task('default', ['build', 'watch']);

gulp.task('build', function(cb){
 runSequence('clean', ['copy', 'compile'], cb);
});

gulp.task('deploy', ['build'], function () {
  return gulp.src('dist/**/*')
    .pipe(deploy());
});

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

gulp.task('compile', ['objectives', 'syllabus']);

gulp.task('objectives', function(){
  var objectives = paths.objectives;
  return to_html(objectives.data, objectives.template);
});

gulp.task('syllabus', function(){
  var syllabus = paths.syllabus;
  return to_html(syllabus.data, syllabus.template);
});



// HELPER FUNCTIONS

function to_html(filePath, templatePath){
  return gulp.src(filePath)
    .pipe(yaml())
    .pipe(tap(function(file, t){
      var hbs = fs.readFileSync(templatePath);
      var template = Handlebars.compile(hbs.toString());
      var json = JSON.parse(file.contents.toString());
      var html = template(json);

      file.contents = new Buffer(html, 'utf-8')
    }))
    .pipe(rename({extname: '.html'}))
    .pipe(flatten())
    .pipe(gulp.dest('dist'))
};
