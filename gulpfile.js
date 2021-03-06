const gulp = require('gulp'),
	browserSync = require('browser-sync').create(),
	concat = require('gulp-concat'),
	uglify = require('gulp-uglify-es').default,
	cleancss = require('gulp-clean-css'),
	rename = require('gulp-rename'),
	autoprefixer = require('gulp-autoprefixer'),
	newer = require('gulp-newer'),
	responsive = require('gulp-responsive'),
	del = require('del'),
	babel = require('gulp-babel');

// Локальный сервер
gulp.task('browser-sync', function () {
	browserSync.init({
		server: {
			baseDir: 'dist',
			browser: 'chrome'
		},
		notify: false,
		online: true, // Для работы офлайн
		// tunnel: true, tunnel: 'projectname', // Страница тунеля: http://projectname.localtunnel.me
	})
});
function bsReload(done) { browserSync.reload(); done() };

// Пользовательские стили
gulp.task('styles', function () {
	return gulp.src('app/css/**/*.css')
		.pipe(concat('styles.min.css'))
		.pipe(autoprefixer({
			// grid: true, //Гриды в IE
			overrideBrowserslist: ['last 10 versions']
		}))
		.pipe(cleancss({ level: { 1: { specialComments: 0 } } }))
		.pipe(gulp.dest('dist/css'))
		.pipe(browserSync.stream())
});

// Скрипты и бибилиотеки
gulp.task('scripts', function () {
	return gulp.src([
		'app/js/_libs.js', // Библиотеки
		'app/js/_custom.js', // Пользовательские стили
	])
		.pipe(babel({
			presets: ['@babel/env']
		}))
		.pipe(concat('scripts.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest('dist/js'))
		.pipe(browserSync.reload({ stream: true }))
});

var quality = 95; // Качество изображения

gulp.task('img-responsive-1x', async function () {
	return gulp.src('app/img/_src/**/*.{png,jpg,jpeg,webp,raw}')
		.pipe(newer('app/img/@1x'))
		.pipe(responsive({
			'**/*': { width: '50%', quality: quality }
		})).on('error', function (e) { console.log(e) })
		.pipe(rename(function (path) { path.extname = path.extname.replace('jpeg', 'jpg') }))
		.pipe(gulp.dest('dist/img/@1x'))
});

gulp.task('img-responsive-2x', async function () {
	return gulp.src('app/img/_src/**/*.{png,jpg,jpeg,webp,raw}')
		.pipe(newer('app/img/@2x'))
		.pipe(responsive({
			'**/*': { width: '100%', quality: quality }
		})).on('error', function (e) { console.log(e) })
		.pipe(rename(function (path) { path.extname = path.extname.replace('jpeg', 'jpg') }))
		.pipe(gulp.dest('dist/img/@2x'))
});

gulp.task('img', gulp.series('img-responsive-1x', 'img-responsive-2x', bsReload));

gulp.task('cleanimg', function () {
	return del(['app/img/@*'], { force: true })
});

gulp.task('code', function () {
	return gulp.src('app/**/*.html')
		.pipe(gulp.dest('dist/'))
		.pipe(browserSync.reload({ stream: true }))
});

gulp.task('watch', function () {
	gulp.watch('app/css/**/*.css', gulp.parallel('styles'));
	gulp.watch(['app/js/_custom.js', 'app/js/_libs.js'], gulp.parallel('scripts'));
	gulp.watch('app/*.html', gulp.parallel('code'));
	gulp.watch('app/img/_src/**/*', gulp.parallel('img'));
});

gulp.task('default', gulp.parallel('img', 'styles', 'scripts', 'browser-sync', 'watch'));
