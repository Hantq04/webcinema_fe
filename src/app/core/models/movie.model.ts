export interface Movie {
  id: string;
  code?: string;
  title: string;
  titleEn?: string;
  durationMinutes: number;
  posterUrl?: string;
  backdropUrl?: string;
  trailerUrl?: string;
  rate?: string;
  rateEn?: string;
  description?: string;
  descriptionEn?: string;
  ageRating?: string;
  releaseDate?: string;
  genre?: string | string[];
  genreEn?: string | string[];
}

export interface MovieDetail extends Movie {
  director?: string;
  actor?: string;
  language?: string;
  movieSubtitle?: string;
  rateName?: string;
  rateNameEn?: string;
}

export interface CinemaSchedule {
  cinemaId: number;
  cinemaName: string;
  roomCode: string;
  roomType: string;
  showtimes: {
    time: string;
    scheduleCode: string;
  }[];
}

export interface DailySchedule {
  date: string;
  cinemas: CinemaSchedule[];
}