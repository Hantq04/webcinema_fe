export interface PromotionResponse {
  id: number;
  code: string;
  percent: number;
  quantity: number;
  promotionType: string;
  startTime: string;
  endTime: string;
  description: string;
  name: string;
  isActive: boolean;
  rankCustomerName: string;
}

export interface PromotionRequest {
  name: string;
  percent: number;
  quantity: number;
  promotionType: string;
  startTime: string;
  endTime: string;
  description: string;
  nameRankCustomer: string;
}

export interface PromotionListResponse {
  data: PromotionResponse[];
}
