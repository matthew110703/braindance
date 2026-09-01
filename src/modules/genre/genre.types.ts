export interface TMDBGenreItem {
  id: number;
  name: string;
}

export interface TMDBGenreListResponse {
  genres: TMDBGenreItem[];
}

export interface AllGenresResponse {
  movie: TMDBGenreItem[];
  tv: TMDBGenreItem[];
}
