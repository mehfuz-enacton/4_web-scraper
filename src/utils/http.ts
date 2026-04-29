// ============== HTTP REQUESTS ==============
// Handles downloading web pages with error handling

import axios from "axios";
import { ScrapingError } from "./errors";

/**
 * Wait for a specified number of milliseconds
 * This helps us avoid overwhelming the server with too many requests
 */
export function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

/**
 * Build the complete URL for a specific page
 * Example: "https://books.toscrape.com/catalogue/page-1.html"
 */
export function buildPageUrl(baseUrl: string, pageNumber: number): string {
  return `${baseUrl}${pageNumber}.html`;
}

/**
 * Download the HTML from a webpage with error handling
 * @throws ScrapingError if the page cannot be downloaded
 */
export async function downloadPage(url: string, pageNumber: number): Promise<string> {
  try {
    const response = await axios.get(url, {
      timeout: 10000, // 10 second timeout
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === "ECONNABORTED") {
        throw new ScrapingError(`Request timeout - page took too long to load`, pageNumber);
      } else if (error.response?.status === 404) {
        throw new ScrapingError(`Page not found (404)`, pageNumber);
      } else if (error.response?.status === 403) {
        throw new ScrapingError(`Access forbidden (403) - website blocked the request`, pageNumber);
      } else {
        throw new ScrapingError(`Network error: ${error.message}`, pageNumber);
      }
    }
    throw new ScrapingError(`Unknown error downloading page`, pageNumber);
  }
}
