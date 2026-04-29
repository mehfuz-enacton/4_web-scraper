// ============== MAIN SCRAPER ORCHESTRATOR ==============
// This file coordinates all the modules to scrape books

import { config } from "./config";
import { wait, buildPageUrl, downloadPage } from "./utils/http";
import { extractBooksFromHTML } from "./utils/parser";
import { saveBooksToFile } from "./utils/storage";
import { setupScheduler } from "./utils/scheduler";
import { ScrapingError } from "./utils/errors";
import { Book } from "./types";

/**
 * Scrape a single page
 * Combines HTTP download and HTML parsing for one page
 */
async function scrapeSinglePage(pageNumber: number): Promise<Book[]> {
  console.log(`📖 Scraping page ${pageNumber}...`);

  // Step 1: Build the URL for this page
  const url = buildPageUrl(config.websiteUrl, pageNumber);

  // Step 2: Download the HTML from the webpage
  const html = await downloadPage(url, pageNumber);

  // Step 3: Extract book information from the HTML
  const booksOnPage = extractBooksFromHTML(html, pageNumber);

  console.log(`   ✅ Found ${booksOnPage.length} books on page ${pageNumber}`);

  return booksOnPage;
}

/**
 * Main scraping function that orchestrates the entire process
 *
 * Features:
 * 1. Targeted scraping of specific data fields
 * 2. Pagination handling for multiple pages
 * 3. Comprehensive error handling
 * 4. Data storage in JSON and CSV formats
 */
async function scrapeBooks(): Promise<Book[]> {
  console.log("=".repeat(60));
  console.log("       📚 BOOK SCRAPER - Starting...");
  console.log("=".repeat(60));
  console.log("");

  // This array will hold all the books we scrape
  const allBooks: Book[] = [];
  let errors = 0;

  // Loop through each page we want to scrape (PAGINATION FEATURE)
  for (let page = 1; page <= config.totalPages; page++) {
    try {
      // Scrape the current page
      const booksOnPage = await scrapeSinglePage(page);

      // Add these books to our collection
      allBooks.push(...booksOnPage);

      // Wait before scraping the next page
      // (Only wait if there are more pages to scrape)
      if (page < config.totalPages) {
        console.log(`   ⏳ Waiting ${config.delayBetweenRequests}ms...\n`);
        await wait(config.delayBetweenRequests);
      }

    } catch (error) {
      // Handle errors gracefully - continue to next page
      errors++;
      if (error instanceof ScrapingError) {
        console.error(`   ❌ ${error.message}`);
      } else {
        console.error(`   ❌ Unexpected error on page ${page}:`, error);
      }
    }
  }

  console.log("");
  console.log("=".repeat(60));
  console.log(`🎉 Done! Scraped ${allBooks.length} books in total!`);
  if (errors > 0) {
    console.log(`⚠️  Encountered errors on ${errors} page(s)`);
  }
  console.log("=".repeat(60));
  console.log("");

  // Save all the books to files (DATA STORAGE FEATURE)
  saveBooksToFile(allBooks);

  return allBooks;
}

/**
 * Wrapper function for scheduler (ignores return value)
 */
async function runScheduledScrape(): Promise<void> {
  await scrapeBooks();
}

/**
 * Main entry point - runs scraper and optionally sets up scheduler
 */
async function main(): Promise<void> {
  try {
    // Run the scraper immediately
    await scrapeBooks();

    // Set up scheduler if enabled
    if (config.enableScheduler) {
      setupScheduler(runScheduledScrape);
    } else {
      console.log("ℹ️  To enable automatic scheduling, edit config.ts");
      console.log("   Set 'enableScheduler: true' and choose your schedule time\n");
      // Exit if scheduler is not enabled
      process.exit(0);
    }
  } catch (error) {
    console.error("\n❌ Fatal error:", error);
    process.exit(1);
  }
}

// Start the scraper
main();
