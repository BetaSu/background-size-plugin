const path = require('path');
const fs = require('fs');

function addNewLineAfter(content, pattern, newLine) {
  const pt = new RegExp(pattern, 'g');
  return content.replace(pt, str => str + newLine);
}

const DEP_NAME = 'backgroundsize.min.htc';

module.exports = class BackgroundSizePlugin {
  constructor({publicPath} = {}) {
    if (typeof publicPath === 'undefined') {
      throw new Error('BackgroundSizePlugin need publicPath parameter');
    }
    this.depPath = path.resolve(publicPath, DEP_NAME);
  }
  apply(compiler) {
    const outputPath = compiler.options.output.path;
    compiler.hooks.emit.tapAsync('BackgroundSizePlugin', (compilation, callback) => {
    
      for (let filename in compilation.assets) {
        if (!filename.endsWith('.css')) continue;
        const content = compilation.assets[filename].source();
        const newContent = addNewLineAfter(content, /background-size:[^;]+;/, `\n -ms-behavior: url(${this.depPath});`);
        compilation.assets[filename] = {
          source() {
            return newContent;
          },
          size() {
            return Buffer.byteLength(newContent, 'utf8');
          }
        };
      }

      if (!compilation.assets[DEP_NAME]) {
        const dep = fs.readFileSync(path.resolve(__dirname, DEP_NAME));
        const size = Buffer.byteLength(dep, 'utf8');
        compilation.assets[DEP_NAME] = {
          source() {
            return dep;
          },
          size() {
            return size;
          }
        };
      }
      callback();
    });
  }
};