const cron = require("node-cron");
const axios = require("axios");

// Replace with your deployed base URL or localhost if running locally
const BASE_URL = process.env.BASE_URL || "http://localhost:5001";
// =============== DAILY DUMP ===============
// Runs every day at 11:59 PM
cron.schedule("59 23 * * *", async () => {
  try {
    console.log("⏳ Running Daily Dump...");
    await axios.get(`${BASE_URL}/api/customer-dump/daily-dump?cron=true`);
    console.log("✅ Daily dump triggered successfully.");
  } catch (err) {
    console.error("❌ Error triggering Daily Dump:", err.message);
  }
});

// =============== WEEKLY DUMP ===============
// Runs every Monday at 12:00 AM
cron.schedule("0 0 * * 1", async () => {
  try {
    console.log("⏳ Running Weekly Dump...");
    await axios.get(`${BASE_URL}/api/customer-dump/weekly-dump`);
    console.log("✅ Weekly dump triggered successfully.");
  } catch (err) {
    console.error("❌ Error triggering Weekly Dump:", err.message);
  }
});

// =============== QUARTERLY DUMP ===============
// Runs on the 1st day of January, April, July, October at 12:30 AM
cron.schedule("30 0 1 1,4,7,10 *", async () => {
  try {
    console.log("⏳ Running Quarterly Dump...");
    await axios.get(`${BASE_URL}/api/customer-dump/quarterly-dump`);
    console.log("✅ Quarterly dump triggered successfully.");
  } catch (err) {
    console.error("❌ Error triggering Quarterly Dump:", err.message);
  }
});

