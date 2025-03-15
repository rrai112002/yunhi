const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function getRandomDelay(min = 1000, max = 5000) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

let a = 0;
let b = 0;
let c = 0;
let d = 0;
console.log(a + b + c + d);
(async () => {
  try {
    const browser = await puppeteer.launch({
      headless: false,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled'
      ]
    });
    const page = await browser.newPage();

    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
      'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36'
    );

    await page.setViewport({ width: 1366, height: 768 });

    await page.setRequestInterception(true);
    page.on('request', (request) => {
      const url = request.url();
      if (
        url.includes('analytics') ||
        url.includes('ads') ||
        url.includes('social')
      ) {
        request.abort();
      } else {
        request.continue();
      }
    });

    await page.goto('https://www.google.com', { waitUntil: 'networkidle2' });

    await page.waitForSelector('input[name="q"]');
    await page.type('input[name="q"]', 'cat', { delay: 150 });

    await delay(getRandomDelay());
    await page.keyboard.press('Enter');

    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    for (let pageIndex = 1; pageIndex <= 5; pageIndex++) {
      console.log(`Navigating page ${pageIndex}`);
      
      // Wait for a random delay (simulate reading time).
      await delay(getRandomDelay());

      // Find and click the "Next" button to load the next page.
      const nextButtonSelector = '#pnnext';
      const nextButton = await page.$(nextButtonSelector);
      if (nextButton) {
        // Add a random delay before clicking the "Next" button.
        await delay(getRandomDelay());
        await Promise.all([
          page.waitForNavigation({ waitUntil: 'networkidle2' }),
          nextButton.click()
        ]);
      } else {
        console.log('No next button found, ending navigation.');
        break;
      }
    }

    // Close the browser after finishing navigation.
    await browser.close();
    console.log('Google search completed and navigated through 5 pages.');
  } catch (error) {
    console.error('Error during automation:', error);
  }
})();
