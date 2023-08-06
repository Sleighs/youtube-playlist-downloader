
/*


*/

const fs = require("fs");
const puppeteer = require("puppeteer");

const config = JSON.parse(fs.readFileSync('./config.json', 'utf-8'))

let locations = JSON.parse(fs.readFileSync('./locations.json', 'utf-8'))

function timeout(miliseconds) {
  return new Promise(resolve => setTimeout(resolve, miliseconds));
} 

const setupBrowser = async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewport({ width: 1024, height: 1080 });

  return [browser, page]
}

const run = async () => {
  const [browser, page] = await setupBrowser()

  console.log("Logging in...")
  await page.goto("https://www.samuelwright.dev/");
  
}

run()