const fs = require('fs');
const formatDate = require('date-fns');
const path = require('path');

exports.Logger = class Logger {
    path

    /**
     * 
     * @param {string} path Pfad zum Folder
     * @example ```js
     * const logger = new Logger('path/logs');
     * ```
     */
    constructor(path) {
        this.path = path
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path);
        }
    }

    log(type, name, msg) {
        let filepath = path.join(this.path, `${formatDate.format(new Date(), 'yyyy-MM-dd')}--${name}.log`);
        if (!fs.existsSync(filepath)) {
            fs.writeFileSync(filepath, `[INFO] ${formatDate.format(new Date(), 'HH-mm-ss')} Begin of log ${name}\n`);
        }
        fs.appendFileSync(filepath, `[${type}] ${formatDate.format(new Date(), 'HH-mm-ss')} ${msg}\n`);
        console.log(`[${type}] ${formatDate.format(new Date(), 'HH-mm-ss')} ${msg}`);
    }
}