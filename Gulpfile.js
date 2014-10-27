var gulp = require('gulp');
var Handlebars = require('handlebars');
var rename = require('gulp-rename');
var watch = require('gulp-watch');
var yaml = require('gulp-yaml');
var tap = require('gulp-tap');
var fs = require('fs');

var data = 'json/**/*.json';
var template = 'level000.hbs';

gulp.task('watch', function () {
  gulp.watch([template, data], ['default']);
});

gulp.task('to_json', function(){
  var options = {};
  gulp.src("yaml/**.*")
    .pipe(yaml())
    .pipe(gulp.dest('json'))
})

gulp.task('to_HTML', function(){
  gulp.src(data)
    .pipe(tap(function(file, t){
      var hbs = fs.readFileSync(template);
      var compTempl = Handlebars.compile(hbs.toString());
      var json = JSON.parse(file.contents.toString());
      var html = compTempl(json);
      console.log(html);
      file.contents = new Buffer(html, 'utf-8')
    }))
    .pipe(rename({extname: '.html'}))
    .pipe(gulp.dest('dist'))
});

gulp.task('default', ['to_json', 'to_HTML']);

