export interface BoxOfficeData {
  movieId: string;
  title: string;
  budget: number;
  revenue: number;
  releaseDate: string;
  /**
   * List of top billed actors in the movie.
   * Useful for downstream Actor Profitability and Star Power ML features.
   */
  topCast: string[];
  genres: string[];
}
