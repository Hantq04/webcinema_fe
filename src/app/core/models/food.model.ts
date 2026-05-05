export interface FoodDTO {
  id: number;
  price: number;
  description: string;
  image: string;
  nameOfFood: string;
}

export interface FoodResponse {
  data: FoodDTO[];
}
