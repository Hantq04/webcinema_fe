export interface BannerResponse {
  id: number;
  imageUrl: string;
  title: string;
  titleEn: string;
}

export interface BannerListResponse {
  data: BannerResponse[];
}
