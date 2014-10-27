var gulp = require('gulp');
var fs = require('fs');

var Handlebars = require('handlebars');
var rename = require('gulp-rename');
var watch = require('gulp-watch');
var yaml = require('gulp-yaml');
var tap = require('gulp-tap');
var marked = require('marked');
var livereload = require('gulp-livereload');

var objectives = 'yaml/**/*.yaml';
var levelTemplate = 'level000.hbs';

Handlebars.registerHelper('markdown', function(text) {
  return marked(text);
});

gulp.task('default', ['compile', 'watch']);

gulp.task('watch', function () {
  livereload.listen();
  gulp.watch([levelTemplate, objectives], ['compile'])
    .on('change', livereload.changed)
});

gulp.task('compile', function(){
  var options = {};
  gulp.src("yaml/**.*")
    .pipe(yaml())
    .pipe(tap(function(file, t){
      var hbs = fs.readFileSync(levelTemplate);
      var template = Handlebars.compile(hbs.toString());

      var json = JSON.parse(file.contents.toString());
      var html = template(json);

      file.contents = new Buffer(html, 'utf-8')
    }))
    .pipe(rename({extname: '.html'}))
    .pipe(gulp.dest('dist'))
});
