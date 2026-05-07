export interface RevenueTimePoint {
  period: string;
  totalRevenue: number;
  ticketRevenue: number;
  foodRevenue: number;
  ticketCount: number;
}

export interface MovieStatistic {
  name: string;
  nameEn: string;
  movieTypeName: string;
  movieTypeNameEn: string;
  movieDuration: number;
  premiereDate: string;
  ticketCount?: number;
  totalTicketsBooked?: number;
}

export interface OverviewRecentBooking {
  tradingCode: string;
  customerName: string;
  movieName: string | null;
  showTimeName: string | null;
  roomCode: string | null;
  seatCodes: string | null;
  totalMoney: number;
  billStatus: string;
  createTime: string;
}

export interface FoodRevenue {
  nameOfFood: string;
  totalQuantity: number;
}

export interface OverviewResponse {
  date: string;
  todayRevenue: number;
  todayRevenueChangePercent?: number;
  todayTicketCount: number;
  todayTicketCountChangePercent?: number;
  nowShowingMovieCount: number;
  seatOccupancyRate: number;
  seatOccupancyRateChangePercent?: number;
  revenueLast7Days: RevenueTimePoint[];
  topMovies: MovieStatistic[];
  recentBookings: OverviewRecentBooking[];
  foodRevenueLast7Days: FoodRevenue[];
  activePromotions: any[];
}
