const fs = require("fs");
const puppeteer = require("puppeteer");


const playlistURL = 'https://www.youtube.com/playlist?list=PL8xvCGHIJPU__F_pFHbYujfin-vyRIJXu';

function timeout(miliseconds) {
  return new Promise(resolve => setTimeout(resolve, miliseconds));
} 

const setupBrowser = async () => {
  const browser = await puppeteer.launch({ headless: false });

  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(0); 
  await page.setViewport({ width: 800, height: 1080 });

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
    const totalVideos = document.querySelectorAll('ytd-playlist-video-renderer');
    console.log('totalVideos', totalVideos.length)
    return totalVideos.length;
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
    // Remove end of url starting with '&list'
    let url = element.querySelector('a').href;
    url = url.split('&list')[0];
    // Store data
    items.push({
      title: element.querySelector('h3').innerText,
      url: url,
      channel: element.querySelector('ytd-channel-name').innerText,
    });
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
    while (items.length < itemTargetCount) {
      items = await page.evaluate(extractItems);
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
        var scrollHeight = document.querySelector('ytd-app').scrollHeight;//document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        scrolls++;  // increment counter

        // Stop scrolling if reached the end or the maximum number of scrolls
        if (
          totalHeight >= scrollHeight + (window.innerHeight * 5)
          || 
          scrolls >= maxScrolls
        ){
          console.log('heights', {
            totalHeight, 
            scrollHeight, 
            innerHeight: window.innerHeight
          });
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  }, maxScrolls);  // Pass maxScrolls to the function
}

const run = async () => {
  const [browser, page] = await setupBrowser();

  //console.log("Logging in...");

  await page.goto(playlistURL);

  await page.waitForSelector('div.metadata-stats > yt-formatted-string');

  // Scroll to bottom
  await scrollToBottom(page, 2500);
  
  // Get length of playlist
  const lengthOfPlaylist = await playlistLength(page);

  // Extract items from page
  const items = await scrapeInfiniteScrollItems(page, extractItems, lengthOfPlaylist, 1000);

  // Save extracted items to json file 
  fs.writeFileSync('./items.json', JSON.stringify(items, null, 2));

  // Pause to see what's going on.
  await new Promise(r => setTimeout(r, 60000));

  // Turn off the browser to clean up after ourselves.
  await browser.close();
}

run()