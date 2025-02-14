const puppeteer = require("puppeteer");

function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}

async function login(page, phone, passphrase) {
  try {
    const buttons = await page.$$("button.button");
    let selector = "button.button";

    await page.waitForSelector(selector);
    await page.evaluate((s) => {
      document.querySelectorAll(s)[1].click();
    }, selector);

    selector = "input.input";
    await page.waitForSelector(selector);
    await page.type(selector, phone);

    selector = "input[type='password']";
    await page.type(selector, passphrase);

    loginButtonSelector =
      "button[class='button account__payments__submit session__form__button login button button__secondary']";
    await page.waitForSelector(loginButtonSelector);
    await delay(2000);
    await page.click(loginButtonSelector);
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

async function bustCollection(page) {
  let previousBust = null;

  while (true) {
    try {
      const element = await page.$("app-bubble-multiplier.dropdown-item");
      const currentBust = element
        ? await element.evaluate((el) => el.textContent.trim())
        : null;

      if (currentBust !== previousBust) {
        console.log("Current bust: ", currentBust);
        previousBust = currentBust;
      }
    } catch (error) {
      console.log("Error: ", error);
      await delay(2000);
    }
  }
}

async function main() {
  let browser;
  try {
    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
    });
    const page = await browser.newPage();

    const aviator_url = "https://www.betika.com/en-ke/aviator";

    await page.goto(aviator_url, { waitUntil: "load", timeout: 60000 });
    await login(page, "0115361123", "Kereskwe1");

    console.log("Signed in");

    await delay(15000);
    await page.waitForSelector("iframe#aviator-iframe");
    const elementHandle = await page.$("iframe[id='aviator-iframe']");
    const frame = await elementHandle.contentFrame();

    await bustCollection(frame);

    // Close browser
    // await browser.close();
  } catch (error) {
    console.error("An error occurred:", error);
  } finally {
    if (browser) await browser.close();
  }
}

main();
