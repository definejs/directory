/**
* 目录工具。
*/

const fs = require('fs');
const Path = require('@definejs/path');


//静态方法
module.exports = exports = {
    /**
    * 迭代指定的目录及所有子目录。
    */
    each(dir, fn) {
        dir = Path.normalizeDir(dir);

        if (!fs.existsSync(dir)) { //不存在该目录。
            return;
        }

        let files = [];
        let dirs = [];
        let list = fs.readdirSync(dir);

        //先处理子目录。
        list.map(function (item, index) {
            item = Path.join(dir, item);

            let stat = fs.statSync(item);
            let isDir = stat.isDirectory();

            if (isDir) {
                item = Path.normalizeDir(item);
                dirs.push(item);
                exports.each(item, fn);
            }
            else {
                item = Path.normalize(item);
                files.push(item);
            }
        });

        fn && fn(dir, files, dirs);

    },

    /**
    * 获取指定目录及子目录下的所有文件列表。
    * @return {Array} 返回符合条件的所有文件列表。
    */
    getFiles(dir) {
        let all = [];

        exports.each(dir, function (dir, files) {
            all.push(...files);
        });

        return all;
    },

    /**
    * 获取指定目录下的所有子目录列表。
    * @return {Array} 返回符合条件的所有子目录列表。
    */
    getDirs(dir) {
        let all = [];

        exports.each(dir, function (dir, files) {
            all.push(dir);
        });

        return all;
    },

    /**
    * 创建一个目录。
    * 如果父目录不存在，则会先递归地创建其父目录。
    */
    create(p) {
        //如： `/a/b/c/` --> `/a/b/c/`，此时输入的参数 p 是一个目录。
        //如： `/a/b/c`  --> `/a/b/`， 此时输入的参数 p 是一个文件。
        let dir = Path.dirname(p);

        if (fs.existsSync(dir)) { //已经存在该目录
            return;
        }

        //此时的 dir 一定是一个以 `/` 结尾的字符串。
        let parent = Path.dirname(dir.slice(0, -1)); // 如 `/a/b/c/` --> `/a/b/`。

        if (!fs.existsSync(parent)) {
            exports.create(parent);
        }

        fs.mkdirSync(dir);
    },

    /**
    * 删除一个目录或多个目录。
    * 这将会删除该目录及子目录下的所有文件。
    * 已重载 delete(dir); 删除一个目录及其子目录。
    * 已重载 delete(dirs); 删除多个目录及其子目录。
    */
    delete(dir) {
        let dirs = Array.isArray(dir) ? dir : [dir];

        dirs.forEach(function (dir) {
            exports.each(dir, function (dir, files) {
                //先把当前目录的文件全删掉。
                files.forEach(function (file) {
                    fs.unlinkSync(file); //删除文件。
                });

                //最后删除当前目录。
                try {
                    fs.rmdirSync(dir);
                }
                catch (ex) {
                    switch (ex.code) {
                        case 'ENOTEMPTY':
                            console.error('要删除的目录非空', dir);
                            console.error('请确保先关闭了所有打开该目录的程序。');
                            break;
                    }
                    throw ex;
                }
            });
        });
    },

    /**
    * 清空当前目录中的所有文件和子目录，并保留当前目录。
    */
    clear(dir) {
        dir = Path.normalizeDir(dir);
        
        exports.each(dir, function (cwd, files) {
            //先把当前目录的文件全删掉。
            files.forEach(function (file) {
                fs.unlinkSync(file); //删除文件。
            });

            if (cwd != dir) {
                fs.rmdirSync(cwd);
            }

        });
    },


    /**
    * 删除空目录（包括当前目录）。
    * 这将会递归地删除指定目录及子目录下的所有空目录。
    */
    trim(dir) {
        let dirs = [];  //要删除的目录项。

        exports.each(dir, function (dir, files) {

            let list = fs.readdirSync(dir);

            if (list.length == 0) { //空目录
                try {
                    fs.rmdirSync(dir);
                }
                catch (ex) {
                    console.log(dir.red);
                    throw ex;
                }

                dirs.push(dir);
            }
        });

        return dirs;
    },

    /**
    * 复制目录。
    * 这将会递归地复制指定目录及子目录的所有文件。
    */
    copy(srcDir, destDir) {
        destDir = Path.normalizeDir(destDir);
        exports.create(destDir);

       
        let list = fs.readdirSync(srcDir);

        list.forEach(function (item) {
            let src = Path.join(srcDir, item);
            let dest = Path.join(destDir, item);
            let stat = fs.statSync(src);

            //是一个目录，递归处理。
            if (stat.isDirectory()) {
                exports.copy(src, dest);
                return;
            }

            //是一个文件。
            let buffers = fs.readFileSync(src);//读到的是 buffer。

            exports.create(dest); //先创建目录。
            fs.writeFileSync(dest, buffers);

        });

    },

};
