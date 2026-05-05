export interface Event {
  id: number;
  name: string;
  imageUrl: string;
  isActive: boolean;
}

export interface EventResponse {
  data: Event[];
}
