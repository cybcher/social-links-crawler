import { extractFromWebSites } from './lib/scraper.js';

const main = async () =>
  await extractFromWebSites(['https://isitlab.com/'])
    .then((res) => res)
    .catch((error) => console.log(JSON.stringify(error)));

main();
