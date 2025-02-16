const puppeteer = require("puppeteer");
const fs = require("fs");
const { timeout } = require("puppeteer");

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

async function single_bet(page, amount, multiplier) {
  try {
    console.log(1);
    let selector = "button.tab.ng-star-inserted";
    await page.waitForSelector(selector);
    await page.evaluate((s) => {
      document.querySelectorAll(s)[4].click();
    }, selector);
    console.log(2);

    const amtInput = await page.$("input.font-weight-bold");
    await amtInput.click({ clickCount: 3 });
    console.log(3);

    await amtInput.type(String(amount));
    console.log(4);
    selector = "div.input-switch";
    await page.evaluate((s) => {
      document.querySelectorAll(s)[4].click();
    }, selector);

    console.log(5);
    selector = "input.font-weight-bold";
    const elements = await page.$$(selector);
    await elements[1].click({ clickCount: 3 });
    await elements[1].type(String(multiplier));

    console.log(6);
    selector = "button.btn.btn-success.bet.ng-star-inserted";
    await page.evaluate((s) => {
      document.querySelectorAll(s)[0].click();
    }, selector);
    console.log(7);
    await delay(500);
    await page.waitForSelector("button.btn.btn-danger", { timeout: 120000 });
    await page.waitForSelector("button.btn.btn-warning", { timeout: 120000 });
    console.log(8);

    await delay(2000);

    selector = "div.input-switch";
    await page.waitForSelector(selector);
    await page.evaluate((s) => {
      document.querySelectorAll(s)[4].click();
    }, selector);
    console.log(9);

    selector = "button.tab.ng-star-inserted";
    await page.waitForSelector(selector);
    await page.evaluate((s) => {
      document.querySelectorAll(s)[3].click();
    }, selector);
    console.log(10);

    console.log("Exiting Bet Loop");
  } catch (error) {
    console.error("Single Bet error:", error);
    throw error;
  }
}

async function bustCollection(page) {
  let previousBust = null;
  let bustLog = [];
  let bustCount = 0;

  while (true) {
    try {
      const element = await page.$("app-bubble-multiplier.dropdown-item");
      const currentBust = element
        ? await element.evaluate((el) => el.textContent.trim())
        : null;

      if (currentBust && currentBust !== previousBust) {
        const currentTime = new Date();
        const formattedTime = currentTime.toTimeString().split(" ")[0];

        bustCount += 1;
        console.log(`No. ${bustCount}, Current bust: ${currentBust}`);

        const bustData = { Time: formattedTime, bust: parseFloat(currentBust) };
        bustLog.push(bustData);
        fs.writeFileSync("bustLog.json", JSON.stringify(bustLog));

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

    // await bustCollection(frame);
    await single_bet(frame, 10.0, 1.1);
  } catch (error) {
    console.error("An error occurred:", error);
  } finally {
    if (browser) await browser.close();
  }
}

main();
