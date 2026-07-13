export interface SearchResultItem {
  title: string;
  url: string;
  snippet: string;
}

export interface SearchProvider {
  readonly name: string;
  search(query: string, apiKey: string, count?: number): Promise<SearchResultItem[]>;
}
