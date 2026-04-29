export const config = {
  websiteUrl: "https://books.toscrape.com/catalogue/page-",

  totalPages: 3,

  delayBetweenRequests: 1000,

  enableScheduler: false, // Set to true to enable automatic scraping

  // Schedule time (using cron format: minute hour day month weekday)
  // Example: "0 9 * * *" = Every day at 9:00 AM
  // Example: "0 */6 * * *" = Every 6 hours
  // Example: "0 0 * * 1" = Every Monday at midnight
  // scheduleTime: "0 9 * * *", // Every day at 9:00 AM
  scheduleTime: "* * * * *", // Every single minute
};
