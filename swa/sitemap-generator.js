const { readdirSync, writeFileSync } = require('fs');

const date = new Date();
const baseTenRadix = 10;
const dayOrMonthLength = 2;
const darOrMonthPaddingChar = '0';
const humanReadableMonth = date.getUTCMonth() + 1;
const monthStr = humanReadableMonth.toString(baseTenRadix).padStart(dayOrMonthLength, darOrMonthPaddingChar);
const dayStr = date.getUTCDate().toString(baseTenRadix).padStart(dayOrMonthLength, darOrMonthPaddingChar);
const yyyyMmDdDateStr = `${date.getUTCFullYear()}-${monthStr}-${dayStr}`;

const htmlExtension = '.html';
const srcFolder = './src';

console.info(`Reading ${srcFolder}`);
const files = readdirSync(srcFolder);

console.info(`${files.length} file(s) found. Some of them may be directories and will be skipped.`);
const xmlUrlSeparator = '\n';
const filesAsXmlUrls = files.filter(f => f.includes(htmlExtension)).map(f => `  <url>
    <loc>https://ln.ols.li/${f.replace('index.html', '')}</loc>
    <lastmod>${yyyyMmDdDateStr}</lastmod>
  </url>`).join(xmlUrlSeparator);

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${filesAsXmlUrls}
</urlset>`;
console.info(`Generated sitemap:\n${sitemap}`);

const outputFile = './public/sitemap.xml';
console.info(`Writing sitemap into ${outputFile}`);
writeFileSync(outputFile, sitemap);

console.info('Done');