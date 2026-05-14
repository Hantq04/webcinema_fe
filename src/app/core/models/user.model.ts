export interface UserResponse {
  id: number;
  userName: string;
  email: string;
  name: string;
  phoneNumber: string;
  point: number;
  role: string;
  // Optional depending on API
  status?: string;
}

export interface UserDetailResponse {
  id: number;
  userName: string;
  email: string;
  name: string;
  phoneNumber: string;
  point: number;
  role: string;
  birthDate?: string;
  gender?: string;
  address?: string;
  city?: string;
  district?: string;
  avatarUrl?: string;
  createTime?: string;
  status?: string;
}

export interface UserProfileResponse {
  email: string | null;
  name: string | null;
  phoneNumber: string | null;
  address: string | null;
  city: string | null;
  district: string | null;
  gender: string | null;
  birthDate: string | null;
  avatarUrl: string | null;
  point: number | null;
}

export interface StaffRegisterDTO {
  userName: string;
  email: string;
  name: string;
  phoneNumber: string;
  birthDate: string;
  gender: string;
  password?: string;
  captchaId?: string;
  captchaValue?: string;
  point?: number;
}
