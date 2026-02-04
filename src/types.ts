// Define the structure of a Book object
export interface Book {
  title: string;
  price: string;
  rating: string;
  availability: string;
  scrapedAt: string;
}

// Configuration interface
export interface ScraperConfig {
  baseUrl: string;
  totalPages: number;
  delayMs: number;
}