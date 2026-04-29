// ============== CUSTOM ERROR CLASS ==============
// Handles scraping-specific errors with page number context

export class ScrapingError extends Error {
  constructor(message: string, public page?: number) {
    super(message);
    this.name = "ScrapingError";
  }
}
