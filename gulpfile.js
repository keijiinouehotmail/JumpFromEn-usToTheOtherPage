/**
 * Zip the files in the 'src' folder and output the artifact file with versioned filename in the 'dist' folder.
 * The version is taken from manifest.json.
 */
const gulp = require('gulp');
const gulp_zip = require('gulp-zip');
const fs = require('fs');
const ZipFileName = 'JumpFromEn-usToTheOtherPage';

let version;
let manifest = fs.readFileSync('src/manifest.json', 'utf-8');
const UTF8_BOM = '\u{FEFF}';
if (manifest.startsWith(UTF8_BOM)) {
	manifest = manifest.slice(UTF8_BOM.length);
}
version = JSON.parse(manifest).version;

exports.default = async () => (
	gulp.src('src/**')
		.pipe(gulp_zip(`${ZipFileName}_v${version}.zip`))
		.pipe(gulp.dest('dist'))
);
