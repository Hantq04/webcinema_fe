export interface GeneralSetting {
  id?: number;
  breakTime: any;
  businessHours: number;
  openTime: string;
  closeTime: string;
  percentWeekend: number;
  timeBeginToChange: string;
}

export interface GeneralSettingResponse {
  data: GeneralSetting;
}

export interface GeneralSettingListResponse {
  data: GeneralSetting[];
}
