const puppeteer = require("puppeteer");
const fs = require("fs");

function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}

async function get_frame(page) {
  const iframeHandle = await page.$("iframe#aviator-iframe");
  if (!iframeHandle) throw new Error("iframe not found");
  const frame = await iframeHandle.contentFrame();
  if (!frame) throw new Error("Could not obtain a valid frame");
  return frame;
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

    const loginButtonSelector =
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
    const frame = await get_frame(page);

    await frame.waitForSelector("div.payout.ng-star-inserted");
    const payoutElement = await frame.$("div.payout.ng-star-inserted");
    const currentBust = payoutElement
      ? await payoutElement.evaluate((el) => el.textContent.trim())
      : null;

    let selector = "button.tab.ng-star-inserted";
    await frame.waitForSelector(selector);
    await frame.evaluate((s) => {
      document.querySelectorAll(s)[4].click();
    }, selector);

    await delay(1000);
    const amtInput = await frame.$("input");
    await amtInput.click({ clickCount: 3 });
    await amtInput.type(String(amount));

    selector = "div.input-switch";
    await frame.evaluate((s) => {
      document.querySelectorAll(s)[4].click();
    }, selector);

    selector = "input";
    const elements = await frame.$$(selector);
    await elements[1].click({ clickCount: 3 });
    await elements[1].type(String(multiplier));

    selector = "button.btn.btn-success.bet.ng-star-inserted";
    await frame.evaluate((s) => {
      document.querySelectorAll(s)[0].click();
    }, selector);

    await delay(500);
    await frame.waitForSelector("button.btn.btn-danger", { timeout: 120000 });
    await frame.waitForSelector("button.btn.btn-warning", { timeout: 120000 });

    await delay(2000);

    selector = "div.input-switch";
    await frame.waitForSelector(selector);
    await frame.evaluate((s) => {
      document.querySelectorAll(s)[4].click();
    }, selector);

    selector = "button.tab.ng-star-inserted";
    await frame.waitForSelector(selector);
    await frame.evaluate((s) => {
      document.querySelectorAll(s)[3].click();
    }, selector);

    console.log("Placed bet");
    await delay(2000);
  } catch (error) {
    console.error("Single Bet error:", error);
    throw error;
  }
}

// Module-level variables to maintain state
let globalConsecutiveLosses = 0;
let globalRangeStrategy = "strategy_3";

async function strategy_6point8_bet(page, amount, multiplier) {
  try {
    const frame = await get_frame(page);
    const amountSelector = "span.balance-amount";
    let cleaned_bust_array = [];
    console.log("Current range strategy:", globalRangeStrategy);

    // Get initial balance
    const initialBalance = await frame.evaluate((selector) => {
      const el = document.querySelector(selector);
      return el ? el.textContent.trim() : null;
    }, amountSelector);

    console.log("Initial balance:", initialBalance);
    let currentBalance = initialBalance;
    let betsPlaced = 0;
    let winsInCurrentSession = 0;

    // Collect bust values
    await frame.waitForSelector("div.payout.ng-star-inserted");
    const payoutElements = await frame.$$("div.payout.ng-star-inserted");

    for (let i = 0; i < Math.min(15, payoutElements.length); i++) {
      const bustText = await payoutElements[i].evaluate(el => el.textContent.trim());
      const cleanedBust = bustText.replace('x', '').replace(',', '');
      cleaned_bust_array.push(parseFloat(cleanedBust));
    }

    console.log("Recent busts:", cleaned_bust_array);

    // Rename variable to match functionality
    let globalStrategyFailureCount = globalConsecutiveLosses;

    if (globalStrategyFailureCount >= 3) {
      globalRangeStrategy = globalRangeStrategy === "strategy_3" ? "strategy_5" : "strategy_3";
      globalStrategyFailureCount = 0;
    }

    const indicesToCheck = globalRangeStrategy === "strategy_3" ? [5, 6, 7, 8, 9] : [0, 1, 2, 3, 4];

    // Place bets based on strategy
    for (const index of indicesToCheck) {
      if (cleaned_bust_array[index] >= 10) {
        console.log(`Placing bet based on bust at index ${index}: ${cleaned_bust_array[index]}`);
        await single_bet(page, amount, multiplier);
        betsPlaced++;

        // Wait to ensure balance updates
        await delay(2000);

        // Get updated balance after this bet
        const newBalance = await frame.evaluate((selector) => {
          const el = document.querySelector(selector);
          return el ? el.textContent.trim() : null;
        }, amountSelector);

        console.log(`Balance after bet ${betsPlaced}: ${newBalance} (was: ${currentBalance})`);

        // Check if this bet was a win
        if (newBalance && currentBalance && parseFloat(newBalance) > parseFloat(currentBalance)) {
          winsInCurrentSession++;
          console.log(`Win detected for bet on index ${index}!`);
        }

        // Update current balance for next comparison
        currentBalance = newBalance;
      }
    }

    // Only increment failure count if bets were placed but none resulted in a win
    if (betsPlaced > 0 && winsInCurrentSession === 0) {
      globalStrategyFailureCount++;
      console.log(`All ${betsPlaced} bets lost. Strategy failure count: ${globalStrategyFailureCount}`);
    } else if (betsPlaced > 0) {
      console.log(`${winsInCurrentSession} wins out of ${betsPlaced} bets. Strategy failure count remains ${globalStrategyFailureCount}`);
    } else {
      console.log("No bets placed in this session.");
    }

    // Update the original global variable
    globalConsecutiveLosses = globalStrategyFailureCount;

  } catch (error) {
    console.error("Strategy 6.8 error:", error);
  }
}
async function bustCollection(page) {
  let previousBust = null;
  let bustLog = [];
  let bustCount = 0;

  while (true) {
    try {
      const frame = await get_frame(page);

      await frame.waitForSelector("div.payout.ng-star-inserted");
      const payoutElement = await frame.$("div.payout.ng-star-inserted");
      const currentBust = payoutElement
        ? await payoutElement.evaluate((el) => el.textContent.trim())
        : null;

      await delay(1000);

      if (currentBust && currentBust !== previousBust) {
        const currentTime = new Date();
        const formattedTime = currentTime.toTimeString().split(" ")[0];

        bustCount += 1;
        console.log('--------------------');
        console.log('--------------------');
        console.log(`No. ${bustCount}, Current bust: ${currentBust}`);

        await strategy_6point8_bet(page, 10, 10);

        const bustData = { Time: formattedTime, bust: parseFloat(currentBust) };
        bustLog.push(bustData);
        fs.writeFileSync("bustLog.json", JSON.stringify(bustLog, null, 2));

        previousBust = currentBust;
      }
    } catch (error) {
      console.error("Error in bustCollection:", error);
      await delay(2000);
    }
  }
}

async function main() {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: false,
    });
    const page = await browser.newPage();
    const aviator_url = "https://www.betika.com/en-ke/aviator";
    await page.goto(aviator_url, { waitUntil: "load", timeout: 60000 });
    await login(page, "0115361123", "Kereskwe1"); // Note: It's not secure to hard-code credentials
    console.log("Signed in");

    await page.waitForSelector("iframe#aviator-iframe");

    await bustCollection(page);

  } catch (error) {
    console.error("An error occurred:", error);
  } finally {
    if (browser) await browser.close();
  }
}

main();


// REMOVE DOUBLE BETS BY MISTAKE