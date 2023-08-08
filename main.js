
/*
https://github.com/fent/node-ytdl

https://www.npmjs.com/package/youtube-dl

https://blog.apify.com/puppeteer-web-scraping-tutorial/

https://intoli.com/blog/scrape-infinite-scroll/

https://stackoverflow.com/questions/51529332/puppeteer-scroll-down-until-you-cant-anymore



Todo
- Get list length
- Auto scroll to bottom of page
- Save video titles and urls to json file


*/


const fs = require("fs");
const puppeteer = require("puppeteer");
// const puppeteer = require("puppeteer-extra");
// const StealthPlugin = require('puppeteer-extra-plugin-stealth')
//puppeteer.use(StealthPlugin())

const playlist = 'https://www.youtube.com/playlist?list=PL8xvCGHIJPU__F_pFHbYujfin-vyRIJXu';//"https://www.youtube.com/playlist?list=PL8xvCGHIJPU8z9itQiCZbAjQK_V2SPKIn";

// const config = JSON.parse(fs.readFileSync('./config.json', 'utf-8'))

// let locations = JSON.parse(fs.readFileSync('./locations.json', 'utf-8'))

function timeout(miliseconds) {
  return new Promise(resolve => setTimeout(resolve, miliseconds));
} 

const setupBrowser = async () => {
  const browser = await puppeteer.launch({ headless: false });

  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(0); 
  await page.setViewport({ width: 1280, height: 1080 });

  page.on('console', async (msg) => {
    const msgArgs = msg.args();
    for (let i = 0; i < msgArgs.length; i++) {
      try {
        console.log(await msgArgs[i]?.jsonValue());
      } catch(e) {
        console.log(e);
      }
    }
  });

  return [browser, page]
}

const playlistLength = async (page) => {
  const lengthOfPlaylist = await page.evaluate(() => {
    const totalVideos = document.querySelectorAll('div.metadata-stats > yt-formatted-string ');//.style-scope.yt-formatted-string');
    
    let totalVideosText = totalVideos[0].innerText.split(' ');
    console.log('totalVideos', Number(totalVideosText[0]));

    return Number(totalVideosText[0]);
  });

  return lengthOfPlaylist;
}

const pageHeight = async (page) => {
  const height = await page.evaluate(() => {
    return document.body.scrollHeight;
  });

  return height;
}

const extractItems = () => {
  const extractedElements = document.querySelectorAll('ytd-playlist-video-renderer');
  const items = [];

  for (let element of extractedElements) {
    items.push(element.innerText);
    // items.push({
    //   title: element.querySelector('h3').innerText,
    //   url: element.querySelector('a').href,
    //   channel: element.querySelector('ytd-channel-name').innerText,
    // })
    //console.log('innerText', element.innerText)
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
      // previousHeight = await page.evaluate('document.body.scrollHeight');
      // await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
      // await page.waitForFunction(`document.body.scrollHeight > ${previousHeight}`);
      // await page.waitFor(scrollDelay);
    }
  } catch(e) { }

  return items;
}

const scrollToBottom = async (
  page, 
  maxScrolls
) => {
  await page.evaluate(async (maxScrolls) => {
    await new Promise((resolve) => {
      var totalHeight = 0;
      var distance = 100;
      var scrolls = 0;  // scrolls counter
      var timer = setInterval(() => {
        var scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        scrolls++;  // increment counter

        // Stop scrolling if reached the end or the maximum number of scrolls
        if (totalHeight >= scrollHeight - window.innerHeight || scrolls >= maxScrolls){
          //clearInterval(timer);
          //resolve();
        }
      }, 100);
    });
  }, maxScrolls);  // pass maxScrolls to the function
}


const run = async () => {
  const [browser, page] = await setupBrowser();

  console.log("Logging in...");

  await page.goto(playlist);

  await page.waitForSelector('div.metadata-stats > yt-formatted-string');

  // Scroll to bottom
  await scrollToBottom(page, 1000);
  
  // Extract items from page
  const items = await scrapeInfiniteScrollItems(page, extractItems, 98, 1000);

  //console.log('items', items)

  // Save extracted items to a file.
  fs.writeFileSync('./items.txt', items.join('\n') + '\n');

  // Pause to see what's going on.
  await new Promise(r => setTimeout(r, 60000));

  // Turn off the browser to clean up after ourselves.
  await browser.close();
}


run()