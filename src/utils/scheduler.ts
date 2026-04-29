// ============== SCHEDULER ==============
// Handles automatic scheduling of scraping tasks

import * as cron from "node-cron";
import { config } from "../config";

/**
 * Setup automatic scheduling for scraping (SCHEDULER FEATURE)
 * This allows the scraper to run automatically at regular intervals
 *
 * @param scrapeCallback - The function to run on schedule
 */
export function setupScheduler(scrapeCallback: () => Promise<void>): void {
  if (!config.enableScheduler) {
    console.log("ℹ️  Scheduler is disabled in config.");
    console.log("   To enable: Set 'enableScheduler: true' in config.ts\n");
    return;
  }

  console.log("=".repeat(60));
  console.log("       ⏰ SCHEDULER ENABLED");
  console.log("=".repeat(60));
  console.log(`Schedule: ${config.scheduleTime}`);
  console.log("Press Ctrl+C to stop the scheduler\n");

  // Create a scheduled task using node-cron
  cron.schedule(config.scheduleTime, async () => {
    console.log("\n🔔 Scheduled scraping started...");
    console.log(`Time: ${new Date().toLocaleString()}\n`);

    try {
      await scrapeCallback();
      console.log("✅ Scheduled scraping completed successfully!\n");
    } catch (error) {
      console.error("❌ Scheduled scraping failed:", error);
    }
  });

  console.log("✅ Scheduler is running...");
  console.log("   The scraper will run automatically according to the schedule.\n");
}
