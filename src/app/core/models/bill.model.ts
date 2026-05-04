export interface BillDTO {
  customerName: string;
  tickets: string[];
  foods?: any[];
  promotionCode?: string;
  // Other fields available from backend but not strictly needed for creation payload
  tradingCode?: string;
  createTime?: string;
  updateTime?: string;
  paidAt?: string;
  totalMoney?: number;
  name?: string;
}

export interface BillHoldResponse {
  tradingCode: string;
  createTime: string;
  holdExpiresAt: string;
  remainingSeconds: number;
}

export interface BillResponse {
  tradingCode: string;
  customerName: string;
  createTime: string;
  updateTime?: string;
  paidAt?: string;
  totalMoney: number;
  name: string; // The specific name assigned to the bill, usually same as customerName if not specified
  status: any; // Using any for status temporarily, can be refined based on actual backend response
  tickets: any[];
  foods: any[];
  promotionCode?: string;
}
