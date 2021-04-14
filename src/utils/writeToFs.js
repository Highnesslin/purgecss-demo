const fs = require('fs');
const writeToFs = (path, content) => fs.writeFileSync(path, content);

module.exports = writeToFs;
