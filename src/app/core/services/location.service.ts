import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, of, catchError } from 'rxjs';

export interface Province {
  name: string;
  code: number;
  division_type: string;
  codename: string;
  phone_code: number;
}

export interface District {
  name: string;
  code: number;
  division_type: string;
  codename: string;
  province_code: number;
}

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'https://provinces.open-api.vn/api';

  private readonly staticProvinces: Province[] = [
    { name: "Hà Nội", code: 1, codename: "ha_noi", division_type: "thanh_pho_trung_uong", phone_code: 24 },
    { name: "Hà Giang", code: 2, codename: "ha_giang", division_type: "tinh", phone_code: 219 },
    { name: "Cao Bằng", code: 4, codename: "cao_bang", division_type: "tinh", phone_code: 206 },
    { name: "Bắc Kạn", code: 6, codename: "bac_kan", division_type: "tinh", phone_code: 209 },
    { name: "Tuyên Quang", code: 8, codename: "tuyen_quang", division_type: "tinh", phone_code: 210 },
    { name: "Lào Cai", code: 10, codename: "lao_cai", division_type: "tinh", phone_code: 214 },
    { name: "Điện Biên", code: 11, codename: "dien_bien", division_type: "tinh", phone_code: 215 },
    { name: "Lai Châu", code: 12, codename: "lai_chau", division_type: "tinh", phone_code: 213 },
    { name: "Sơn La", code: 14, codename: "son_la", division_type: "tinh", phone_code: 212 },
    { name: "Yên Bái", code: 15, codename: "yen_bai", division_type: "tinh", phone_code: 216 },
    { name: "Hoà Bình", code: 17, codename: "hoa_binh", division_type: "tinh", phone_code: 218 },
    { name: "Thái Nguyên", code: 19, codename: "thai_nguyen", division_type: "tinh", phone_code: 208 },
    { name: "Lạng Sơn", code: 20, codename: "lang_son", division_type: "tinh", phone_code: 205 },
    { name: "Quảng Ninh", code: 22, codename: "quang_ninh", division_type: "tinh", phone_code: 203 },
    { name: "Bắc Giang", code: 24, codename: "bac_giang", division_type: "tinh", phone_code: 204 },
    { name: "Phú Thọ", code: 25, codename: "phu_tho", division_type: "tinh", phone_code: 210 },
    { name: "Vĩnh Phúc", code: 26, codename: "vinh_phuc", division_type: "tinh", phone_code: 211 },
    { name: "Bắc Ninh", code: 27, codename: "bac_ninh", division_type: "tinh", phone_code: 222 },
    { name: "Hải Dương", code: 30, codename: "hai_duong", division_type: "tinh", phone_code: 220 },
    { name: "Hải Phòng", code: 31, codename: "hai_phong", division_type: "thanh_pho_trung_uong", phone_code: 225 },
    { name: "Hưng Yên", code: 33, codename: "hung_yen", division_type: "tinh", phone_code: 221 },
    { name: "Thái Bình", code: 34, codename: "thai_binh", division_type: "tinh", phone_code: 227 },
    { name: "Hà Nam", code: 35, codename: "ha_nam", division_type: "tinh", phone_code: 226 },
    { name: "Nam Định", code: 36, codename: "nam_dinh", division_type: "tinh", phone_code: 228 },
    { name: "Ninh Bình", code: 37, codename: "ninh_binh", division_type: "tinh", phone_code: 229 },
    { name: "Thanh Hóa", code: 38, codename: "thanh_hoa", division_type: "tinh", phone_code: 237 },
    { name: "Nghệ An", code: 40, codename: "nghe_an", division_type: "tinh", phone_code: 238 },
    { name: "Hà Tĩnh", code: 42, codename: "ha_tinh", division_type: "tinh", phone_code: 239 },
    { name: "Quảng Bình", code: 44, codename: "quang_binh", division_type: "tinh", phone_code: 232 },
    { name: "Quảng Trị", code: 45, codename: "quang_tri", division_type: "tinh", phone_code: 233 },
    { name: "Thừa Thiên Huế", code: 46, codename: "thua_thien_hue", division_type: "tinh", phone_code: 234 },
    { name: "Đà Nẵng", code: 48, codename: "da_nang", division_type: "thanh_pho_trung_uong", phone_code: 236 },
    { name: "Quảng Nam", code: 49, codename: "quang_nam", division_type: "tinh", phone_code: 235 },
    { name: "Quảng Ngãi", code: 51, codename: "quang_ngai", division_type: "tinh", phone_code: 255 },
    { name: "Bình Định", code: 52, codename: "binh_dinh", division_type: "tinh", phone_code: 256 },
    { name: "Phú Yên", code: 54, codename: "phu_yen", division_type: "tinh", phone_code: 257 },
    { name: "Khánh Hòa", code: 56, codename: "khanh_hoa", division_type: "tinh", phone_code: 258 },
    { name: "Ninh Thuận", code: 58, codename: "ninh_thuan", division_type: "tinh", phone_code: 259 },
    { name: "Bình Thuận", code: 60, codename: "binh_thuan", division_type: "tinh", phone_code: 252 },
    { name: "Kon Tum", code: 62, codename: "kon_tum", division_type: "tinh", phone_code: 260 },
    { name: "Gia Lai", code: 64, codename: "gia_lai", division_type: "tinh", phone_code: 269 },
    { name: "Đắk Lắk", code: 66, codename: "dak_lak", division_type: "tinh", phone_code: 262 },
    { name: "Đắk Nông", code: 67, codename: "dak_nong", division_type: "tinh", phone_code: 261 },
    { name: "Lâm Đồng", code: 68, codename: "lam_dong", division_type: "tinh", phone_code: 263 },
    { name: "Bình Phước", code: 70, codename: "binh_phuoc", division_type: "tinh", phone_code: 271 },
    { name: "Tây Ninh", code: 72, codename: "tay_ninh", division_type: "tinh", phone_code: 276 },
    { name: "Bình Dương", code: 74, codename: "binh_duong", division_type: "tinh", phone_code: 274 },
    { name: "Đồng Nai", code: 75, codename: "dong_nai", division_type: "tinh", phone_code: 251 },
    { name: "Bà Rịa - Vũng Tàu", code: 77, codename: "ba_ria_vung_tau", division_type: "tinh", phone_code: 254 },
    { name: "Hồ Chí Minh", code: 79, codename: "ho_chi_minh", division_type: "thanh_pho_trung_uong", phone_code: 28 },
    { name: "Long An", code: 80, codename: "long_an", division_type: "tinh", phone_code: 272 },
    { name: "Tiền Giang", code: 82, codename: "tien_giang", division_type: "tinh", phone_code: 273 },
    { name: "Bến Tre", code: 83, codename: "ben_tre", division_type: "tinh", phone_code: 275 },
    { name: "Trà Vinh", code: 84, codename: "tra_vinh", division_type: "tinh", phone_code: 294 },
    { name: "Vĩnh Long", code: 86, codename: "vinh_long", division_type: "tinh", phone_code: 270 },
    { name: "Đồng Tháp", code: 87, codename: "dong_thap", division_type: "tinh", phone_code: 277 },
    { name: "An Giang", code: 89, codename: "an_giang", division_type: "tinh", phone_code: 296 },
    { name: "Kiên Giang", code: 91, codename: "kien_giang", division_type: "tinh", phone_code: 297 },
    { name: "Cần Thơ", code: 92, codename: "can_tho", division_type: "thanh_pho_trung_uong", phone_code: 292 },
    { name: "Hậu Giang", code: 93, codename: "hau_giang", division_type: "tinh", phone_code: 293 },
    { name: "Sóc Trăng", code: 94, codename: "soc_trang", division_type: "tinh", phone_code: 299 },
    { name: "Bạc Liêu", code: 95, codename: "bac_lieu", division_type: "tinh", phone_code: 291 },
    { name: "Cà Mau", code: 96, codename: "ca_mau", division_type: "tinh", phone_code: 290 }
  ];

  getProvinces(): Observable<Province[]> {
    return of(this.staticProvinces);
  }

  getDistricts(provinceCode: number): Observable<District[]> {
    return this.http.get<any>(`${this.baseUrl}/p/${provinceCode}?depth=2`).pipe(
      map(res => {
        const districts = res.districts as District[];
        return districts.map(d => ({
          ...d,
          name: this.cleanName(d.name)
        }));
      }),
      catchError(() => of(this.getFallbackDistricts(provinceCode)))
    );
  }

  private cleanName(name: string): string {
    return name
      .replace(/^(Quận|Huyện|Thị xã|Thành phố)\s+/i, '')
      .trim();
  }

  private getFallbackDistricts(code: number): District[] {
    // Fallback for major cities if API fails
    if (code === 1) { // Hà Nội
      return ["Ba Đình", "Hoàn Kiếm", "Tây Hồ", "Long Biên", "Cầu Giấy", "Đống Đa", "Hai Bà Trưng", "Hoàng Mai", "Thanh Xuân", "Nam Từ Liêm", "Bắc Từ Liêm", "Hà Đông", "Sơn Tây"]
        .map((n, i) => ({ name: n, code: 100 + i, codename: n, division_type: "quan", province_code: 1 }));
    }
    if (code === 79) { // HCM
      return ["Quận 1", "Quận 3", "Quận 4", "Quận 5", "Quận 6", "Quận 7", "Quận 8", "Quận 10", "Quận 11", "Quận 12", "Bình Tân", "Bình Thạnh", "Gò Vấp", "Phú Nhuận", "Tân Bình", "Tân Phú", "Thủ Đức"]
        .map((n, i) => ({ name: n, code: 700 + i, codename: n, division_type: "quan", province_code: 79 }));
    }
    return [];
  }
}
