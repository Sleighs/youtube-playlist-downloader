
/*
https://github.com/fent/node-ytdl

https://www.npmjs.com/package/youtube-dl

https://blog.apify.com/puppeteer-web-scraping-tutorial/

https://intoli.com/blog/scrape-infinite-scroll/

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
  await page.setViewport({ width: 1024, height: 1080 });

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

const run = async () => {
  const [browser, page] = await setupBrowser();

  console.log("Logging in...");

  await page.goto(playlist);

  await page.waitForSelector('ytd-playlist-video-renderer');

  
  
  await page.evaluate(() => {
    const playlistItems = Array.from(document.querySelectorAll('ytd-playlist-video-renderer'));

    return console.log('playlist items', playlistItems);
  });

  // Pause for 10 seconds, to see what's going on.
  await new Promise(r => setTimeout(r, 15000));

  // Turn off the browser to clean up after ourselves.
  await browser.close();
  }

run()