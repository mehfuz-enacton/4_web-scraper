// Import required libraries
import axios, { AxiosResponse } from "axios";
import * as cheerio from "cheerio";
import * as fs from "fs";
import { parse } from "json2csv";
import * as cron from "node-cron";

// Import our type definitions
import { Book, ScraperConfig } from "./types";

// Configuration with types
const config: ScraperConfig = {
  baseUrl: "https://books.toscrape.com/catalogue/page-",
  totalPages: 3,
  delayMs: 1000,
};

/**
 * Main scraping function
 * Scrapes books from multiple pages and returns array of Book objects
 */
async function scrapeBooks(): Promise<Book[]> {
  console.log("Starting to scrape books...\n");

  // Explicitly type the array as Book[]
  const allBooks: Book[] = [];

  // Loop through each page
  for (let page = 1; page <= config.totalPages; page++) {
    console.log(`📖 Scraping page ${page}...`);

    try {
      // Build URL for current page
      const url: string = `${config.baseUrl}${page}.html`;

      // Make HTTP request with typed response
      const response: AxiosResponse<string> = await axios.get(url);

      // Load HTML into Cheerio
      const $ = cheerio.load(response.data);
      // Find all book containers and extract data
      $(".product_pod").each((index: number, element: cheerio.Element) => {
        // Extract data with type safety
        const title: string =
          $(element).find("h3 a").attr("title") || "Unknown";
        const price: string = $(element).find(".price_color").text();
        const availability: string = $(element)
          .find(".availability")
          .text()
          .trim();

        // Extract star rating
        const ratingClass: string =
          $(element).find(".star-rating").attr("class") || "";
        const rating: string = ratingClass.split(" ")[1] || "No rating";

        // Create book object with proper typing
        const book: Book = {
          title,
          price,
          rating,
          availability,
          scrapedAt: new Date().toISOString(),
        };

        // Add to array
        allBooks.push(book);
      });

      console.log(`✅ Page ${page} scraped successfully!`);

      // Wait before next request
      await delay(config.delayMs);
    } catch (error) {
      // Type guard for error handling
      if (error instanceof Error) {
        console.error(`❌ Error scraping page ${page}:`, error.message);
      } else {
        console.error(`❌ Unknown error scraping page ${page}`);
      }
    }
  }

  console.log(`\n🎉 Scraped ${allBooks.length} books total!\n`);

  return allBooks;
}

/**
 * Helper function to create delay
 * @param ms - Milliseconds to wait
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Save scraped data to JSON and CSV files
 * @param books - Array of Book objects to save
 */
async function saveData(books: Book[]): Promise<void> {
  try {
    // Ensure data directory exists
    if (!fs.existsSync("./data")) {
      fs.mkdirSync("./data");
    }

    // Save as JSON
    const jsonData: string = JSON.stringify(books, null, 2);
    fs.writeFileSync("./data/books.json", jsonData, "utf-8");
    console.log("💾 Saved to data/books.json");

    // Save as CSV
    const csv: string = parse(books);
    fs.writeFileSync("./data/books.csv", csv, "utf-8");
    console.log("💾 Saved to data/books.csv");

    console.log("\n✨ Scraping complete!\n");
  } catch (error) {
    if (error instanceof Error) {
      console.error("❌ Error saving data:", error.message);
    } else {
      console.error("❌ Unknown error while saving data");
    }
    throw error;
  }
}

/**
 * Schedule scraping to run at specific times
 * Uses cron syntax for scheduling
 */
function scheduleScraping(): void {
  console.log("⏰ Scheduler activated!");
  console.log("Will run every day at 9:00 AM\n");

  // Cron format: minute hour day month weekday
  cron.schedule("0 9 * * *", async () => {
    console.log("\n🔔 Scheduled scraping started...");
    const books = await scrapeBooks();
    await saveData(books);
  });

  // Keep the process running
  console.log("Scheduler is running... Press Ctrl+C to stop.\n");
}

/**
 * Main execution function
 */
async function main(): Promise<void> {
  console.log("=".repeat(50));
  console.log("       📚 BOOK SCRAPER V2.0 (TypeScript) 📚");
  console.log("=".repeat(50));
  console.log("");

  try {
    // Run scraper immediately
    const books = await scrapeBooks();
    await saveData(books);

    // Uncomment to enable scheduling:
    // scheduleScraping();
  } catch (error) {
    if (error instanceof Error) {
      console.error("Fatal error:", error.message);
    }
    process.exit(1);
  }
}

// Execute main function
main();
