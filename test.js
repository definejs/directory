
const Directory = require('./modules/Directory');
const Path = require('@definejs/path');

let dir = './node_modules/@definejs/';


// Directory.each(dir, function (dir, files) {
//     console.log(dir, files);
// });

let files = Directory.getFiles(dir);
let dirs = Directory.getDirs(dir);
// console.log(files);
// console.log(dirs);

// Directory.create(`${dir}/aabc\\a/b/`);
// Directory.clear(`${dir}/a`);

// 
// console.log(Path.normalizeDir('./node_modules/@definejs//a'))

// console.log(Directory.trim(`${dir}/a`));

// Directory.copy(dir + 'a', dir + 'b')

// console.log('/a/b/c/', '-->', Path.dirname('/a/b/c/'));
// console.log('/a/b/c', '-->', Path.dirname('/a/b/c'));

// Directory.create('./a/b/c/');
// Directory.create('./a/A/test.x')