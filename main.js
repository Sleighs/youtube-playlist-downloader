
/*
https://github.com/fent/node-ytdl

https://www.npmjs.com/package/youtube-dl

https://blog.apify.com/puppeteer-web-scraping-tutorial/

https://intoli.com/blog/scrape-infinite-scroll/

https://stackoverflow.com/questions/51529332/puppeteer-scroll-down-until-you-cant-anymore
<<<<<<< HEAD
=======


>>>>>>> autoscroll

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

let items = [];

// const config = JSON.parse(fs.readFileSync('./config.json', 'utf-8'))

// let locations = JSON.parse(fs.readFileSync('./locations.json', 'utf-8'))

function timeout(miliseconds) {
  return new Promise(resolve => setTimeout(resolve, miliseconds));
} 

const setupBrowser = async () => {
  const browser = await puppeteer.launch({ headless: false });

  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(0); 
  await page.setViewport({ width: 1280, height: 800 });

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
<<<<<<< HEAD

      // previousHeight = await page.evaluate('document.body.scrollHeight');
      // await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
      //await page.waitForFunction(`document.body.scrollHeight > ${previousHeight}`);

      previousHeight = await page.evaluate(document.querySelector('yt-app').innerHeight);
      
      await page.evaluate(window.scrollTo(0, document.querySelector('yt-app').innerHeight));
      await page.waitForFunction(`document.body.innerHeight > ${previousHeight}`);
      await page.waitFor(scrollDelay);
      
=======
      // previousHeight = await page.evaluate('document.body.scrollHeight');
      // await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
      // await page.waitForFunction(`document.body.scrollHeight > ${previousHeight}`);
      // await page.waitFor(scrollDelay);
>>>>>>> autoscroll
    }
  } catch(e) { }

  return items;
}

<<<<<<< HEAD
async function autoScroll(
  page,
  extractItems,
  itemTargetCount
){
  let items = [];

  await page.evaluate(async () => {
      await new Promise((resolve) => {
          var totalHeight = 0;
          var distance = 100;
          var timer = setInterval(() => {
              var scrollHeight = document.body.scrollHeight;
              window.scrollBy(0, distance);
              totalHeight += distance;

              if(totalHeight >= scrollHeight - window.innerHeight){
                  clearInterval(timer);
                  resolve();
              }
          }, 100);
      });
  });

  while (items.length < itemTargetCount) {
    items = await page.evaluate(extractItems);
  }

  console.log('items length', items.length)
  return items
}

=======
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
        if(totalHeight >= scrollHeight - window.innerHeight || scrolls >= maxScrolls){
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  }, maxScrolls);  // pass maxScrolls to the function
}


// const searchString = "java course";

// const requestParams = {
//   baseURL: `https://www.youtube.com`,
//   encodedQuery: encodeURI(searchString),                            // what we want to search for in URI encoding
// };

// async function fillPlaylistsDataFromPage(page) {
//   const dataFromPage = await page.evaluate((requestParams) => {
//     const mixes = Array.from(document.querySelectorAll("#contents > ytd-radio-renderer")).map((el) => ({
//       title: el.querySelector("a > h3 > #video-title")?.textContent.trim(),
//       link: `${requestParams.baseURL}${el.querySelector("a#thumbnail")?.getAttribute("href")}`,
//       videos: Array.from(el.querySelectorAll("ytd-child-video-renderer a")).map((el) => ({
//         title: el.querySelector("#video-title")?.textContent.trim(),
//         link: `${requestParams.baseURL}${el.getAttribute("href")}`,
//         length: el.querySelector("#length")?.textContent.trim(),
//       })),
//       thumbnail: el.querySelector("a#thumbnail #img")?.getAttribute("src"),
//     }));
//     const playlists = Array.from(document.querySelectorAll("#contents > ytd-playlist-renderer")).map((el) => ({
//       title: el.querySelector("a > h3 > #video-title")?.textContent.trim(),
//       link: `${requestParams.baseURL}${el.querySelector("a#thumbnail")?.getAttribute("href")}`,
//       channel: {
//         name: el.querySelector("#channel-name a")?.textContent.trim(),
//         link: `${requestParams.baseURL}${el.querySelector("#channel-name a")?.getAttribute("href")}`,
//       },
//       videoCount: el.querySelector("yt-formatted-string.ytd-thumbnail-overlay-side-panel-renderer")?.textContent.trim(),
//       videos: Array.from(el.querySelectorAll("ytd-child-video-renderer a")).map((el) => ({
//         title: el.querySelector("#video-title")?.textContent.trim(),
//         link: `${requestParams.baseURL}${el.getAttribute("href")}`,
//         length: el.querySelector("#length")?.textContent.trim(),
//       })),
//       thumbnail: el.querySelector("a#thumbnail #img")?.getAttribute("src"),
//     }));
//     return [...mixes, ...playlists];
//   }, requestParams);
//   return dataFromPage;
// }


>>>>>>> autoscroll
const run = async () => {
  const [browser, page] = await setupBrowser();

  console.log("Logging in...");

  await page.goto(playlist);

  await page.waitForSelector('div.metadata-stats > yt-formatted-string');

  // Scroll to bottom
  await scrollToBottom(page, 1000);
  
  //const lengthOfPlaylist = await playlistLength(page);

<<<<<<< HEAD
  // Scroll and extract items from page
  //const items = await scrapeInfiniteScrollItems(page, extractItems, lengthOfPlaylist);

  const items = await autoScroll(page, extractItems, lengthOfPlaylist); 
=======

  // Extract items from page
  const items = await scrapeInfiniteScrollItems(page, extractItems, 98, 1000);
  //const items = await autoScroll(page, extractItems, lengthOfPlaylist, 2000);
  

  console.log('items', items)
>>>>>>> autoscroll

  // Save extracted items to a file.
  fs.writeFileSync('./items.txt', items.join('\n') + '\n');

  // Pause to see what's going on.
  await new Promise(r => setTimeout(r, 600000));

  // Turn off the browser to clean up after ourselves.
  await browser.close();
}


run()