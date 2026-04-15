export interface Movie {
  id: string;
  title: string;
  durationMinutes: number;
  posterUrl?: string;
  backdropUrl?: string;
  description?: string;
  ageRating?: string;
  releaseDate?: string;
  genre?: string;
}