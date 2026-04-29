// ============== DATA STORAGE ==============
// Saves scraped data to JSON and CSV files

import * as fs from "fs";
import { parse } from "json2csv";
import { Book } from "../types";
import { ScrapingError } from "./errors";

/**
 * Save data to files (JSON and CSV) with error handling
 */
export function saveBooksToFile(books: Book[]): void {
  try {
    // Create the data folder if it doesn't exist
    if (!fs.existsSync("./data")) {
      fs.mkdirSync("./data");
    }

    // Check if we have any data to save
    if (books.length === 0) {
      console.warn("   ⚠️  Warning: No books to save!");
      return;
    }

    // Save as JSON (easy to read for humans)
    const jsonData = JSON.stringify(books, null, 2);
    fs.writeFileSync("./data/books.json", jsonData, "utf-8");
    console.log("✅ Saved to data/books.json");

    // Save as CSV (good for opening in Excel)
    const csvData = parse(books);
    fs.writeFileSync("./data/books.csv", csvData, "utf-8");
    console.log("✅ Saved to data/books.csv");

  } catch (error) {
    console.error("❌ Error saving data to files:", error);
    throw new ScrapingError("Failed to save data to files");
  }
}
