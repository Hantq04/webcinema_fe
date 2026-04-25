export interface Event {
  name: string;
  imageUrl: string;
  isActive: boolean;
}

export interface EventResponse {
  data: Event[];
}
