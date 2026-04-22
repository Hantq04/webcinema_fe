export interface SeatItem {
  id: number;
  line: string;
  number: number;
  status: 'AVAILABLE' | 'BOOKED' | 'UNAVAILABLE';
  seatType: 'Standard' | 'VIP' | 'Sweet Box';
  pairIndex?: number;
}

export interface SeatScheduleData {
  cinema: string;
  room: string;
  remainSeats: number;
  capacity: number;
  startAt: string;
  endAt: string;
  seats: SeatItem[];
}
