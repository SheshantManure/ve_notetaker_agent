const express = require("express");
const puppeteer = require("puppeteer");
require("dotenv").config();
const moment = require("moment"); // Import moment
const schedule = require("node-schedule"); // Import node-schedule
const app = express();

// ENVIRONMENT VARIABLES
const PORT = process.env.PORT || 8080;
const NOTETAKER_EMAIL = process.env.NOTETAKER_EMAIL || "";
const NOTETAKER_PASSWORD = process.env.NOTETAKER_PASSWORD || "";
const CMD_KEY = process.env.CMD_KEY || "Control"; // Set to 'Meta' for MacOS (Command key) and 'Control' for Windows/Linux
const googleMeetLink = `https://meet.google.com/utj-oauq-zqj`;

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.get("/join-meeting", async (req, res) => {
  try {
    const dateTime = Date.now() + 1 * 1000;
    const date = moment(dateTime);

    schedule.scheduleJob(date.toDate(), async () => {
      const browser = await puppeteer.launch({
        headless: false, // use 'shell in production'
        args: ["--use-fake-ui-for-media-stream"], // This ensures a consistent media stream handling behavior for automated joining
      });

      const page = await browser.newPage();
      const googleAccountSignIn =
        "https://accounts.google.com/v3/signin/identifier?continue=https%3A%2F%2Faccounts.google.com%2F&followup=https%3A%2F%2Faccounts.google.com%2F&ifkv=AS5LTASlmnShJFMr_doWJSKjI3KZJYi04m10OjUbfkiXsMq1wIVnrAaQ-0A5vxtIKk7o5CHh5S4v&passive=1209600&flowName=GlifWebSignIn&flowEntry=ServiceLogin&dsh=S1613985402%3A1717571917170172&ddm=0";
      await page.goto(googleAccountSignIn);
      await page.waitForSelector('input[type="email"]');
      await page.type('input[type="email"]', NOTETAKER_EMAIL);
      await page.keyboard.press("Enter");
      await page.waitForNavigation();
      await page.waitForSelector('input[type="password"]', { visible: true });
      await page.type('input[type="password"]', NOTETAKER_PASSWORD);
      await page.keyboard.press("Enter");
      await page.waitForNavigation();
      await new Promise((resolve) => setTimeout(resolve, 3000));
      await page.goto(googleMeetLink); // To bypass the accounts page after sign in
      await new Promise((resolve) => setTimeout(resolve, 3000));
      await page.keyboard.down(CMD_KEY); // In production mode, set the value of CMD_KEY as Control (In development, its value is Command a.k.a Meta)
      await page.keyboard.press("KeyD");
      await page.keyboard.up(CMD_KEY);
      await page.keyboard.down("Meta");
      await page.keyboard.press("KeyE");
      await page.keyboard.up("Meta");
      await page.keyboard.down("Meta");
      await page.keyboard.press("KeyD");
      await page.keyboard.up("Meta");
      await new Promise((resolve) => setTimeout(resolve, 10000));
      const frame = page
        .frames()
        .find((frame) => frame.url().includes("meet.google.com"));
      await frame.waitForSelector(
        ".UywwFc-LgbsSe.UywwFc-LgbsSe-OWXEXe-SfQLQb-suEOdc.UywwFc-LgbsSe-OWXEXe-dgl2Hf.UywwFc-StrnGf-YYd4I-VtOx3e.tusd3.IyLmn.QJgqC",
        { visible: true }
      );
      await frame.click(
        ".UywwFc-LgbsSe.UywwFc-LgbsSe-OWXEXe-SfQLQb-suEOdc.UywwFc-LgbsSe-OWXEXe-dgl2Hf.UywwFc-StrnGf-YYd4I-VtOx3e.tusd3.IyLmn.QJgqC"
      );

      const meetId = currentUrl.split("meet.google.com/")[1].split("?")[0];
      const fileName = `meet_recording_${meetId}.mp3`;
    });

    res.status(200).json({
      message: "Assistant is joining the meeting",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred while joining the meeting", error });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
