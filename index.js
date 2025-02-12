const { timeout } = require("puppeteer");
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

async function bustCollection(browser, page) {
  // let dropDownButtonSelector = "div.dropdown-toggle.button";
  let dropDownButtonSelector = "div[class='dropdown-toggle button']";

  let bustArraySelector = "div.payouts-block";

  while (true) {
    try {
      console.log(1);
      await page.waitForSelector(dropDownButtonSelector, { timeout: 30000 });

      await page.evaluate((s) => {
        document.querySelector(s).click();
      }, dropDownButtonSelector),
        await page.click(dropDownButtonSelector);

      await page.waitForSelector(bustArraySelector);

      const bust = await page.$eval((el) => {
        el.querySelector("app_bubble_multiplier.payouts.ng-star-inserted");
      }, bustArraySelector);

      console.log("Current bust:", bust);
      await delay(2000);
      await page.click(dropDownButtonSelector);
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
    const aviatorFrame = await page.frame("#aviator-iframe");

    await bustCollection(browser, aviatorFrame);

    // Close browser
    // await browser.close();
  } catch (error) {
    console.error("An error occurred:", error);
  } finally {
    if (browser) await browser.close();
  }
}

main();


