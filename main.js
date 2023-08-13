const fs = require("fs");
const puppeteer = require("puppeteer");
const ytdl = require('ytdl-core')

// Insert public or unlisted playlist URL here
const playlistURL = 'https://www.youtube.com/playlist?list=PL8xvCGHIJPU8RtRg1jdKg6moH7R1abaMF'

const setupBrowser = async () => {
  const browser = await puppeteer.launch({ headless: false });

  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(0); 
  await page.setViewport({ width: 800, height: 600 });

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
    //console.log('totalVideos', totalVideos.length)
    return totalVideos.length;
  });

  return lengthOfPlaylist;
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

const scrapeInfiniteScrollItems = async (
  page,
  extractItems,
  itemTargetCount
) => {
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
      var scrolls = 0;  
      var timer = setInterval(() => {
        var scrollHeight = document.querySelector('ytd-app').scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        scrolls++; 

        // Stop scrolling if reached the end or the maximum number of scrolls
        if (totalHeight >= scrollHeight + (window.innerHeight * 5) || scrolls >= maxScrolls){
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  }, maxScrolls);  
}

const download = async (songURL) => {
  let info;

  // Get video info
  try {
    info = await ytdl.getInfo(songURL);
    //console.log('info', info)
  } catch { }

  // Save info to json file
  fs.writeFileSync('./info.json', JSON.stringify(info, null, 2));

  // Get all available formats
  let formatsAvailable = info.formats.map(format => format.container);

  // Filter audio formats
  let audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
  let audioFormatsAvailable = audioFormats.map(format => format.container);

  // Get the highest quality audio format
  let audioFormat = audioFormatsAvailable[0];
  let videoFormat = formatsAvailable[0];

  // Get video title
  let videoTitle = info.videoDetails.title;

  // Adjust title to store as string
  // If title has double quotes in it, remove them
  if (videoTitle.includes('"')) {
    videoTitle = videoTitle.replace(/"/g, '');
  }
  // If title has single quotes in it, remove them
  if (videoTitle.includes("'")) {
    videoTitle = videoTitle.replace(/'/g, '');
  }
  // If title has slashes in it, replace them with dashes
  if (videoTitle.includes('/')) {
    videoTitle = videoTitle.replace(/\//g, '-');
  }

  // Download audio
  ytdl(songURL, {filter: 'audioonly'})
    .pipe(fs.createWriteStream(`downloads/audio/${videoTitle}.${audioFormat}`));
  
  // Download video
  ytdl(songURL)
    .pipe(fs.createWriteStream(`downloads/videos/${videoTitle}.${videoFormat}`));
}

const run = async () => {
  const [browser, page] = await setupBrowser();

  await page.goto(playlistURL);

  await page.waitForSelector('div.metadata-stats > yt-formatted-string');

  // Scroll to bottom
  await scrollToBottom(page, 2500);
  
  // Get length of playlist
  const lengthOfPlaylist = await playlistLength(page);

  // Extract items from page
  const items = await scrapeInfiniteScrollItems(page, extractItems, lengthOfPlaylist, 1000);
  
  // Download videos
  for (let i = 0; i < items.length; i++) {
    let item = items[i];
    console.log('item', item)
    await download(item.url);
  }

  // Save extracted items to json file 
  fs.writeFileSync('./items.json', JSON.stringify(items, null, 2));

  // Pause to see what's going on.
  await new Promise(r => setTimeout(r, 10000));

  // Turn off the browser to clean up after ourselves.
  await browser.close();
}

run()