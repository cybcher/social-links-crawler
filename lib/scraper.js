import URL from 'url';
import normalizeUrl from 'normalize-url';
import puppeteer from 'puppeteer';

export const CONFIG = {
  socialNetworks: ['facebook', 'twitter', 'linkedin', 'instagram', 'youtube'],
};

export const SUPPORTED_NETWORKS = new Set([
  'facebook',
  'twitter',
  'linkedin',
  'instagram',
  'youtube',
]);

const CUSTOM_REGEX = {
  facebook: `(?:(?:http|https):\/\/)?(?:www.)?(?:mbasic.facebook|m\.facebook|facebook|fb)\.(?:com|me)\/(?:[A-Za-z0-9_-]*)`,
  twitter: `(?:(?:http|https):\/\/)?(?:www.)?(?:twitter.com|x.com)\/([a-zA-Z0-9_-]*)`,
  linkedin: `(?:(?:http|https):\/\/)?(?:.+.)?(?:linkedin.com)\/(?:pub|in|profile|company)\/([A-Za-z0-9_-]*)`,
  instagram: `(?:(?:http|https):\/\/)?(?:www.)?(?:instagram.com|instagr.am|instagr.com)\/([A-Za-z0-9_-]*)`,
  youtube: `(?:(?:http|https):\/\/)?(?:www.)?(?:youtu)(?:\.be|be\..{2,5})\/(?:user|channel)\/(.*)`,
};

export const extractFromWebSites = async (websites) =>
  Array.isArray(websites)
    ? Promise.all(
        websites.map(async (website) => ({
          [website]: await parseWebsite(website),
        }))
      )
    : [{ [websites]: await parseWebsite(websites) }];

const parseWebsite = async (website) => {
  try {
    const url = normalizeUrl(website);
    const allWebsiteLinks = await parseWebsiteLinks(url);
    console.log(allWebsiteLinks);
    let results = {};
    CONFIG.socialNetworks.forEach((socialNetwork) => {
      results[socialNetwork] = getExactSocialLink(
        socialNetwork,
        allWebsiteLinks
      );
    });

    console.log(results);
    return results;
  } catch (error) {
    throw new Error(
      `Error fetching website links for ${website}: ${error.message}`
    );
  }
};

const getExactSocialLinkURL = (url, customRegex = null) => {
  try {
    const path = new URL(url).pathname;
    const regex = customRegex
      ? new RegExp(customRegex, 'i')
      : new RegExp(`/([\\w|@|-]+)/?$`, 'i');
    const match = regex.exec(path);
    return customRegex
      ? match.find((match, index) => index > 1 && match != undefined)
      : match[1];
  } catch (error) {
    //Unable to parse handle, return empty value
    return '';
  }
};

const getExactSocialLink = (socialNetwork, links) => {
  let customRegExp = CUSTOM_REGEX[socialNetwork];
  try {
    let regexp = customRegExp
      ? new RegExp(customRegExp, 'i')
      : new RegExp(`/([\\w|@|-]+)/?$`, 'i');

    // if (socialNetwork !== 'instagram') {
    //   console.log(regexp);
    //   for (let index = 0; index < links.length; index++) {
    //     let link = links[index];
    //     // let linkMatch = link.match(regexp);
    //     let match = regexp.exec(link);

    //     match
    //       ? result.push({
    //           url: match[0],
    //           username: match[1],
    //         })
    //       : undefined;
    //     console.log(match);
    //   }
    // }
    //   let result = [];
    //   for (let index = 0; index < allLinks.length; index++) {
    //     let link = allLinks[index];
    //     // let linkMatch = link.match(regexp);
    //     let match = regexp.exec(link);

    //     match ? result.push({ url: match[0], username: match[1] }) : undefined;
    //   }
    return links.find((link) => regexp.test(link));
  } catch (error) {
    //Unable to parse handle, return empty value
    console.log(error);
    return '';
  }
};
async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      var totalHeight = 0;
      var distance = 100;
      var timer = setInterval(() => {
        var scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight - window.innerHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}

const parseWebsiteLinks = async (url) => {
  let parsedLinks;
  try {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.setViewport({ width: 1200, height: 800 });
    await autoScroll(page);

    parsedLinks = await page.evaluate(() => {
      let links = [];
      let elements = document.querySelectorAll('a');
      for (let element of elements) links.push(element.href);

      return links;
    });

    await page.close();
    await browser.close();
  } catch (error) {
    //Unable to parse handle, return empty value
    console.log(error);
    return '';
  }

  return parsedLinks;
};
// Read first row
// Map
// From where read links
// And where we should save links
// GET https://sheets.googleapis.com/v4/spreadsheets/SPREADSHEET_ID/values/Sheet1!A1:D5
// https://developers.google.com/sheets/api/samples/writing
// Parse Links from spreadsheet
// Parse Social network links
// Put links into yourdocument
// PUT https://sheets.googleapis.com/v4/spreadsheets/SPREADSHEET_ID/values/Sheet1!A1:D5?valueInputOption=VALUE_INPUT_OPTION