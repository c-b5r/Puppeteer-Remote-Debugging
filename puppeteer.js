const fs = require('fs');
const puppeteer = require('puppeteer');

(async () => {
  // Function to read the log file and extract the WebSocket URL
  const getWebSocketUrl = () => {
    return new Promise((resolve, reject) => {
      fs.readFile('/tmp/chromium.log', 'utf8', (err, data) => {
        if (err) return reject(`Error reading file: ${err}`);
        const match = data.match(/ws:\/\/127\.0\.0\.1:9222\/devtools\/browser\/[a-zA-Z0-9-]+/);
        if (match) {
          resolve(match[0]);
        } else {
          reject("ERROR: No chromium DevTools instance found");
        }
      });
    });
  };

  try {
    const wsChromeEndpointUrl = await getWebSocketUrl();
    console.log(`wsChromeEndpointUrl = ${wsChromeEndpointUrl}`)
    // Launch a new browser instance
    const browser = await puppeteer.connect({
      browserWSEndpoint: wsChromeEndpointUrl
    });

    const page = await browser.newPage();
    await page.goto("https://app.acquire.com/criteria");

    // Wait for the elements to be loaded
    await page.waitForSelector('span.header-h6.c-smoke');
    await page.waitForSelector('span.header-h3.c-smoke');

    // Extract the data
    const data = await page.evaluate(() => {
      // Function to convert the formatted string to a number
      function parseNumber(str) {
        if (str.endsWith('k')) {
          return parseFloat(str.slice(1, -1)) * 1000;
        } else if (str.endsWith('M')) {
          return parseFloat(str.slice(1, -1)) * 1000000;
        } else {
          return parseFloat(str.slice(1));
        }
      }

      // Select all description elements
      const descriptions = Array.from(document.querySelectorAll('span.header-h6.c-smoke'));

      // Select all financial data elements (TTM revenue, TTM profit, asking price)
      const financialData = Array.from(document.querySelectorAll('span.header-h3.c-smoke'));

      // Initialize an empty array to hold the parsed objects
      let parsedData = [];

      // Loop over the descriptions and financial data in groups of 3
      for (let i = 0; i < descriptions.length; i++) {
        // Extract the financial data for the current description
        let ttmRevenue = parseNumber(financialData[i * 3].innerText);
        let ttmProfit = parseNumber(financialData[i * 3 + 1].innerText);
        let askingPrice = parseNumber(financialData[i * 3 + 2].innerText);

        // Create an object for the current item
        let item = {
          description: descriptions[i].innerText,
          ttmRevenue: ttmRevenue,
          ttmProfit: ttmProfit,
          askingPrice: askingPrice
        };

        // Add the object to the parsed data array
        parsedData.push(item);
      }

      // Return the parsed data array
      return parsedData;
    });

    // Log the extracted data
    console.log(data);

    // Close the browser instance
    await browser.close();
  } catch (err) {
    console.error('Error:', err);
  }
})().catch(err => {
  console.error('Unhandled error:', err);
});

