const { PurgeCSS } = require('purgecss');
const writeToFs = require('./utils/writeToFs');

const purgeCSSResult = new PurgeCSS().purge({
  content: ['**/*.html'],
  css: ['**/*.css'],
});

purgeCSSResult.then(res => {
  res.forEach(({ file, css }) => writeToFs(file, css));
  console.log(res);
});
