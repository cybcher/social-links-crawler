import { extractFromWebSites } from './lib/scraper.js';

const main = async () =>
  await extractFromWebSites(['https://test.com/'])
    .then((res) => res)
    .catch((error) => console.log(JSON.stringify(error)));

main();
