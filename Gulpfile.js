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
var runSequence = require('run-sequence');
var connect = require('gulp-connect');

// TEMPLATE HELPERS

Handlebars.registerHelper('markdown', function(text) {
  return marked(text);
});

Handlebars.registerHelper('with', function(context, options) {
  return options.fn(context);
});

Handlebars.registerHelper('if', function(conditional, options) {
  if(conditional) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});
// PATHS

var paths = {
  assets: [
    './fonts/**/*',
    './img/**/*',
    './js/**/*',
    './css/**/*',
    'chat.hbs'
  ],
  objectives: {
    data: 'yaml/objectives/**/*.yaml',
    template: 'level000.hbs'
  },
  syllabus: {
    data: 'yaml/syllabus/**/*.yaml',
    template: 'syllabus.hbs'
  },
  homepage: {
    data: 'yaml/homepage/**/*.yaml',
    template: 'homepage.hbs'
  }
};


// Public Tasks

gulp.task('default', ['build', 'connect', 'watch']);

gulp.task('build', function(cb){
 runSequence('clean', ['copy', 'compile'], cb);
});

gulp.task('deploy', ['build'], function () {
  return gulp.src('dist/**/*')
    .pipe(deploy());
});

gulp.task('push_to_dev', ['build'], function () {
  var options = {
    remoteUrl:  "git@github.com:coding-the-humanities/unacademic_development.git",
    message:    "Semi-automatically push with Gulp."
  };
  return gulp.src('dist/**/*')
    .pipe(deploy(options));
})

gulp.task('clean', function (cb) {
  return del('dist', cb)
});

// Server

gulp.task('connect', function() {
  connect.server({
    root: 'dist',
    livereload: true
  });
});

gulp.task('html', function () {
  gulp.src('./dist/*.html')
    .pipe(connect.reload());
});

// Watches

gulp.task('watch', function () {
  gulp.watch(['**/*.{yaml,hbs}', '!dist/chat.hbs'], ['compile'])
  gulp.watch([paths.assets], ['copy'])
});


// Private Tasks


gulp.task('copy', function () {
  return gulp.src(paths.assets, { "base" : "." })
    .pipe(gulp.dest('dist'));
});

gulp.task('compile', ['objectives', 'syllabus', 'homepage']);

gulp.task('objectives', function(){
  var objectives = paths.objectives;
  return to_html(objectives.data, objectives.template);
});

gulp.task('syllabus', function(){
  var syllabus = paths.syllabus;
  return to_html(syllabus.data, syllabus.template);
});

gulp.task('homepage', function(){
  var homepage = paths.homepage;
  return to_html(homepage.data, homepage.template);
});


function to_html(filePath, templatePath){
  return gulp.src(filePath)
    .pipe(yaml())
    .pipe(tap(function(file, t){
      try {
        var hbs = fs.readFileSync(templatePath);
        var template = Handlebars.compile(hbs.toString());
        var json = JSON.parse(file.contents.toString());
        var html = template(json);
        file.contents = new Buffer(html, 'utf-8');
      }
      catch(e) {
        console.error("\nERROR in: " + file.history[0] + "\n" + e + "\n");
      }
    }))
    .pipe(rename({extname: '.html'}))
    .pipe(flatten())
    .pipe(gulp.dest('dist'))
};


