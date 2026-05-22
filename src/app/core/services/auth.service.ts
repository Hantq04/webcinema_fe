import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, from, map, of, switchMap } from 'rxjs';

import { ApiService } from './api.service';

export interface LoginRequest {
  userName: string;
  passWord: string;
  captchaId: string;
  captchaValue: string;
}

export interface RegisterRequest {
  userName: string;
  email: string;
  name: string;
  phoneNumber: string;
  password: string;
  birthDate: string;
  gender: string;
}

export interface UserProfile {
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

export interface ChangePasswordRequest {
  email: string;
  otp: string;
  newPassWord: string;
  confirmPassWord: string;
}

export interface AuthSession {
  authenticated: boolean;
  accessToken: string | null;
  expiresIn: number | null;
  userId: number | null;
  userName: string | null;
  email: string | null;
  phoneNumber: string | null;
  role: string | null;
}

export interface CaptchaChallenge {
  captchaId: string;
  imageUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiService = inject(ApiService);
  private readonly sessionKey = 'webcinema.auth.session';
  private readonly session = signal<AuthSession>(this.readSession());

  readonly isAuthenticated = computed(() => this.session().authenticated);
  readonly currentUserId = computed(() => this.session().userId);
  readonly currentUserName = computed(() => this.session().userName);
  readonly currentUserEmail = computed(() => this.session().email);
  readonly currentUserPhone = computed(() => this.session().phoneNumber);
  readonly currentUserRole = computed(() => this.session().role);

  getAccessToken(): string | null {
    return this.session().accessToken;
  }

  login(payload: LoginRequest): Observable<AuthSession> {
    return this.http.post<unknown>(this.apiService.apiUrl('/api/v1/user/login'), payload).pipe(
      map((response) => {
        const session = this.normalizeLoginResponse(response, payload.userName);
        this.saveSession(session);
        return session;
      })
    );
  }

  register(payload: RegisterRequest): Observable<unknown> {
    return this.http.post<unknown>(this.apiService.apiUrl('/api/v1/user/register'), payload);
  }

  staffRegister(payload: RegisterRequest): Observable<unknown> {
    return this.http.post<unknown>(this.apiService.apiUrl('/api/v1/user/staff-register'), payload);
  }

  forgotPassword(email: string): Observable<unknown> {
    return this.http.get<unknown>(this.apiService.apiUrl('/api/v1/user/forgot-password'), {
      params: { email }
    });
  }

  changePassword(payload: ChangePasswordRequest): Observable<unknown> {
    return this.http.put<unknown>(this.apiService.apiUrl('/api/v1/user/reset-password'), payload);
  }

  getUserProfile(userName: string): Observable<UserProfile> {
    return this.http.get<{ data: UserProfile }>(this.apiService.apiUrl('/api/v1/user/profile'), {
      params: { userName }
    }).pipe(map(res => res.data));
  }

  updateProfile(formData: FormData): Observable<unknown> {
    return this.http.put<unknown>(this.apiService.apiUrl('/api/v1/user/update-profile'), formData);
  }

  changeUserPassword(payload: any): Observable<unknown> {
    return this.http.put<unknown>(this.apiService.apiUrl('/api/v1/user/change-password'), payload);
  }

  logout(): void {
    this.session.set({
      authenticated: false,
      accessToken: null,
      expiresIn: null,
      userId: null,
      userName: null,
      email: null,
      phoneNumber: null,
      role: null
    });
    localStorage.removeItem(this.sessionKey);
  }

  getCaptcha(): Observable<CaptchaChallenge> {
    return this.http
      .get(this.apiService.apiUrl('/api/v1/captcha'), {
        observe: 'response',
        responseType: 'blob'
      })
      .pipe(switchMap((response) => this.parseCaptchaResponse(response.body, response.headers)));
  }

  private readSession(): AuthSession {
    if (typeof localStorage === 'undefined') {
      return {
        authenticated: false,
        accessToken: null,
        expiresIn: null,
        userId: null,
        userName: null,
        email: null,
        phoneNumber: null,
        role: null
      };
    }

    const rawSession = localStorage.getItem(this.sessionKey);

    if (!rawSession) {
      return {
        authenticated: false,
        accessToken: null,
        expiresIn: null,
        userId: null,
        userName: null,
        email: null,
        phoneNumber: null,
        role: null
      };
    }

    try {
      const parsed = JSON.parse(rawSession) as Partial<AuthSession>;
      return {
        authenticated: Boolean(parsed.authenticated),
        accessToken: typeof parsed.accessToken === 'string' ? parsed.accessToken : null,
        expiresIn: typeof parsed.expiresIn === 'number' && Number.isFinite(parsed.expiresIn) ? parsed.expiresIn : null,
        userId: typeof parsed.userId === 'number' && Number.isFinite(parsed.userId) ? parsed.userId : null,
        userName: typeof parsed.userName === 'string' ? parsed.userName : null,
        email: typeof parsed.email === 'string' ? parsed.email : null,
        phoneNumber: typeof parsed.phoneNumber === 'string' ? parsed.phoneNumber : null,
        role: typeof parsed.role === 'string' ? parsed.role : null
      };
    } catch {
      return {
        authenticated: false,
        accessToken: null,
        expiresIn: null,
        userId: null,
        userName: null,
        email: null,
        phoneNumber: null,
        role: null
      };
    }
  }

  private saveSession(session: AuthSession): void {
    this.session.set(session);
    localStorage.setItem(this.sessionKey, JSON.stringify(session));
  }

  private normalizeLoginResponse(response: unknown, fallbackUserName: string): AuthSession {
    const responseObject = this.asRecord(response);
    const responseData = this.asRecord(responseObject['data']);
    const responseResult = this.asRecord(responseObject['result']);
    const responsePayload = this.asRecord(responseObject['payload']);
    const accessToken =
      this.firstString(responseObject, ['accessToken', 'access_token']) ??
      this.firstString(responseData, ['accessToken', 'access_token']) ??
      this.firstString(responseResult, ['accessToken', 'access_token']) ??
      this.firstString(responsePayload, ['accessToken', 'access_token']) ??
      '';
    const expiresIn =
      this.firstNumber(responseObject, ['expiresIn', 'expires_in']) ??
      this.firstNumber(responseData, ['expiresIn', 'expires_in']) ??
      this.firstNumber(responseResult, ['expiresIn', 'expires_in']) ??
      this.firstNumber(responsePayload, ['expiresIn', 'expires_in']);
    const userId =
      this.firstNumber(responseObject, ['userId', 'user_id', 'id']) ??
      this.firstNumber(responseData, ['userId', 'user_id', 'id']) ??
      this.firstNumber(responseResult, ['userId', 'user_id', 'id']) ??
      this.firstNumber(responsePayload, ['userId', 'user_id', 'id']);
    const userName =
      this.firstString(responseObject, ['userName', 'username', 'fullName', 'name']) ??
      this.firstString(responseData, ['userName', 'username', 'fullName', 'name']) ??
      this.firstString(responseResult, ['userName', 'username', 'fullName', 'name']) ??
      this.firstString(responsePayload, ['userName', 'username', 'fullName', 'name']) ??
      fallbackUserName;
    const role =
      this.firstString(responseObject, ['role', 'userRole']) ??
      this.firstString(responseData, ['role', 'userRole']) ??
      this.firstString(responseResult, ['role', 'userRole']) ??
      this.firstString(responsePayload, ['role', 'userRole']);
    const email =
      this.firstString(responseObject, ['email', 'emailAddress']) ??
      this.firstString(responseData, ['email', 'emailAddress']) ??
      this.firstString(responseResult, ['email', 'emailAddress']) ??
      this.firstString(responsePayload, ['email', 'emailAddress']);
    const phoneNumber =
      this.firstString(responseObject, ['phoneNumber', 'phone', 'mobile']) ??
      this.firstString(responseData, ['phoneNumber', 'phone', 'mobile']) ??
      this.firstString(responseResult, ['phoneNumber', 'phone', 'mobile']) ??
      this.firstString(responsePayload, ['phoneNumber', 'phone', 'mobile']);

    return {
      authenticated: true,
      accessToken,
      expiresIn,
      userId,
      userName,
      email,
      phoneNumber,
      role
    };
  }

  private parseCaptchaResponse(body: Blob | null, headers: HttpHeaders): Observable<CaptchaChallenge> {
    if (!body) {
      throw new Error('Không lấy được captcha');
    }

    const contentType = headers.get('content-type') ?? '';

    if (contentType.includes('json') || contentType.includes('text')) {
      return from(body.text()).pipe(
        map((text) => {
          const captchaPayload = this.tryParseJson(text);
          const captchaPayloadObject = this.asRecord(captchaPayload);
          const captchaData = this.asRecord(captchaPayloadObject['data']);
          const captchaResult = this.asRecord(captchaPayloadObject['result']);
          const captchaPayloadData = this.asRecord(captchaPayloadObject['payload']);
          const captchaId =
            this.firstString(captchaPayload, ['captchaId', 'id', 'captchaID']) ??
            this.firstString(captchaData, ['captchaId', 'id', 'captchaID']) ??
            this.firstString(captchaResult, ['captchaId', 'id', 'captchaID']) ??
            this.firstString(captchaPayloadData, ['captchaId', 'id', 'captchaID']) ??
            '';
          const imageUrl = this.extractCaptchaImageUrl(captchaPayload, text);

          if (!imageUrl) {
            throw new Error('Không lấy được captcha');
          }

          return { captchaId, imageUrl };
        })
      );
    }

    const captchaId = headers.get('x-captcha-id') ?? headers.get('captcha-id') ?? '';

    return of({
      captchaId,
      imageUrl: URL.createObjectURL(body)
    });
  }

  private extractCaptchaImageUrl(payload: unknown, fallbackText: string): string {
    const payloadObject = this.asRecord(payload);
    const payloadData = this.asRecord(payloadObject['data']);
    const payloadResult = this.asRecord(payloadObject['result']);
    const payloadPayload = this.asRecord(payloadObject['payload']);
    const candidate =
      this.firstString(payloadObject, ['imageUrl', 'captchaImageUrl', 'captchaUrl']) ??
      this.firstString(payloadObject, ['image', 'captchaImage', 'base64', 'captchaBase64', 'data']) ??
      this.firstString(payloadData, ['imageUrl', 'captchaImageUrl', 'captchaUrl', 'image', 'captchaImage', 'base64', 'captchaBase64', 'data']) ??
      this.firstString(payloadResult, ['imageUrl', 'captchaImageUrl', 'captchaUrl', 'image', 'captchaImage', 'base64', 'captchaBase64', 'data']) ??
      this.firstString(payloadPayload, ['imageUrl', 'captchaImageUrl', 'captchaUrl', 'image', 'captchaImage', 'base64', 'captchaBase64', 'data']) ??
      (typeof payload === 'string' ? payload : '');

    return this.toImageUrl(candidate || fallbackText);
  }

  private toImageUrl(value: string): string {
    const trimmed = value.trim();

    if (!trimmed) {
      return '';
    }

    if (trimmed.startsWith('data:') || trimmed.startsWith('blob:') || trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }

    const looksLikeBase64 = /^[A-Za-z0-9+/=\n\r]+$/.test(trimmed) && trimmed.length > 32;

    if (looksLikeBase64) {
      return `data:image/png;base64,${trimmed.replace(/\s+/g, '')}`;
    }

    return trimmed;
  }

  private tryParseJson(value: string): unknown {
    const trimmed = value.trim();

    if (!trimmed) {
      return value;
    }

    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        return JSON.parse(trimmed) as unknown;
      } catch {
        return value;
      }
    }

    return value;
  }

  private asRecord(value: unknown): Record<string, unknown> {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return {};
    }

    return value as Record<string, unknown>;
  }

  private firstString(value: unknown, keys: string[]): string | null {
    const record = this.asRecord(value);

    for (const key of keys) {
      const candidate = record[key];

      if (typeof candidate === 'string' && candidate.trim()) {
        return candidate;
      }
    }

    return null;
  }

  private firstNumber(value: unknown, keys: string[]): number | null {
    const record = this.asRecord(value);

    for (const key of keys) {
      const candidate = record[key];

      if (typeof candidate === 'number' && Number.isFinite(candidate)) {
        return candidate;
      }

      if (typeof candidate === 'string') {
        const parsed = Number(candidate);
        if (Number.isFinite(parsed)) {
          return parsed;
        }
      }
    }

    return null;
  }
}