// ============== HTML PARSER ==============
// Extracts data from HTML and validates it

import * as cheerio from "cheerio";
import { Book } from "../types";

/**
 * Validate book data and provide fallbacks for missing values
 * This handles cases where website structure changes or data is unavailable
 */
export function validateBookData(book: Book): Book {
  // Check if title is empty or just "Unknown"
  if (!book.title || book.title === "Unknown") {
    console.warn("   ⚠️  Warning: Book has no title, using default");
    book.title = "Untitled Book";
  }

  // Check if price is empty
  if (!book.price || book.price.trim() === "") {
    console.warn("   ⚠️  Warning: Book has no price, using default");
    book.price = "Price not available";
  }

  // Check if availability is empty
  if (!book.availability || book.availability.trim() === "") {
    console.warn("   ⚠️  Warning: Book availability unknown, using default");
    book.availability = "Availability unknown";
  }

  return book;
}

/**
 * Parse the HTML and extract book information with error handling
 * Returns empty array if no books found (handles website structure changes)
 */
export function extractBooksFromHTML(html: string, pageNumber: number): Book[] {
  const books: Book[] = [];

  try {
    // Load HTML into Cheerio (like jQuery for HTML)
    const $ = cheerio.load(html);

    // Check if the page structure is valid
    const bookElements = $(".product_pod");

    if (bookElements.length === 0) {
      console.warn(`   ⚠️  Warning: No books found on page ${pageNumber}`);
      console.warn(`   ⚠️  This might mean the website structure has changed!`);
      return books;
    }

    // Find all book containers on the page
    // Each book is in a <div class="product_pod"> element
    bookElements.each((_index, element) => {
      try {
        // Extract the book title with fallback
        // The title is in the "title" attribute of an <a> tag inside <h3>
        const title =
          $(element).find("h3 a").attr("title") ||
          $(element).find("h3 a").text() ||
          "Unknown";

        // Extract the price with fallback
        // Price is in a <p class="price_color"> element
        const price = $(element).find(".price_color").text() || "";

        // Extract availability with fallback
        const availability = $(element).find(".availability").text().trim() || "";

        // Extract the star rating with fallback
        // Rating is in the class attribute like "star-rating Three"
        const ratingClass = $(element).find(".star-rating").attr("class") || "";
        const ratingParts = ratingClass.split(" ");
        const rating = ratingParts[1] || "No rating";

        // Create a book object with all the information
        const book: Book = {
          title,
          price,
          rating,
          availability,
          scrapedAt: new Date().toISOString(),
        };

        // Validate the book data (handle missing/unavailable data)
        const validatedBook = validateBookData(book);

        // Add this book to our list
        books.push(validatedBook);
      } catch (error) {
        // If a single book fails to parse, log it but continue with others
        console.warn(`   ⚠️  Warning: Failed to parse a book on page ${pageNumber}`);
      }
    });

  } catch (error) {
    console.error(`   ❌ Error parsing HTML on page ${pageNumber}:`, error);
  }

  return books;
}
