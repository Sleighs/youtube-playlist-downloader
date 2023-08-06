
/*
https://github.com/fent/node-ytdl

https://www.npmjs.com/package/youtube-dl

https://blog.apify.com/puppeteer-web-scraping-tutorial/

https://intoli.com/blog/scrape-infinite-scroll/


Todo
- Get list length
- Auto scroll to bottom of page
- Save video titles and urls to json file



*/


const fs = require("fs");
const puppeteer = require("puppeteer");

const playlist = 'https://www.youtube.com/playlist?list=PL8xvCGHIJPU__F_pFHbYujfin-vyRIJXu';//"https://www.youtube.com/playlist?list=PL8xvCGHIJPU8z9itQiCZbAjQK_V2SPKIn";

// const config = JSON.parse(fs.readFileSync('./config.json', 'utf-8'))

// let locations = JSON.parse(fs.readFileSync('./locations.json', 'utf-8'))

function timeout(miliseconds) {
  return new Promise(resolve => setTimeout(resolve, miliseconds));
} 

const setupBrowser = async () => {
  const browser = await puppeteer.launch({ headless: false });

  const page = await browser.newPage();
  await page.setDefaultNavigationTimeout(0); 
  await page.setViewport({ width: 1280, height: 1080 });

  page.on('console', async (msg) => {
    const msgArgs = msg.args();
    for (let i = 0; i < msgArgs.length; ++i) {
      try {
        console.log(await msgArgs[i].jsonValue());
      } catch(e) {
        console.log(e);
      }
    }
  });

  return [browser, page]
}

function extractItems() {
  const extractedElements = document.querySelectorAll('ytd-playlist-video-renderer');
  const items = [];
  for (let element of extractedElements) {
    items.push(element.innerText);
  }
  return items;
}

async function scrapeInfiniteScrollItems(
  page,
  extractItems,
  itemTargetCount,
  scrollDelay = 1000,
) {
  let items = [];
  try {
    let previousHeight;
    while (items.length < itemTargetCount) {
      items = await page.evaluate(extractItems);
      previousHeight = await page.evaluate('document.body.scrollHeight');
      await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
      await page.waitForFunction(`document.body.scrollHeight > ${previousHeight}`);
      await page.waitFor(scrollDelay);
    }
  } catch(e) { }
  return items;
}

const run = async () => {
  const [browser, page] = await setupBrowser();

  console.log("Logging in...");

  await page.goto(playlist);

  // Scroll and extract items from page
  const items = await scrapeInfiniteScrollItems(page, extractItems, 1000);

  // Save extracted items to a file.
  fs.writeFileSync('./items.txt', items.join('\n') + '\n');

  // await page.waitForSelector('ytd-playlist-video-renderer');
  // await page.evaluate(() => {
  //   const playlistItems = Array.from(document.querySelectorAll('ytd-playlist-video-renderer'));

  //   return console.log('playlist items', playlistItems);
  // });

  // Pause, to see what's going on.
  //await new Promise(r => setTimeout(r, 15000));

  // Turn off the browser to clean up after ourselves.
  await browser.close();
  }

run()