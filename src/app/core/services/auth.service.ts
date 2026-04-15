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

export interface AuthSession {
  authenticated: boolean;
  token: string | null;
  userName: string | null;
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
  readonly currentUserName = computed(() => this.session().userName);

  getAccessToken(): string | null {
    return this.session().token;
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

  logout(): void {
    this.session.set({ authenticated: false, token: null, userName: null });
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
      return { authenticated: false, token: null, userName: null };
    }

    const rawSession = localStorage.getItem(this.sessionKey);

    if (!rawSession) {
      return { authenticated: false, token: null, userName: null };
    }

    try {
      const parsed = JSON.parse(rawSession) as Partial<AuthSession>;
      return {
        authenticated: Boolean(parsed.authenticated),
        token: typeof parsed.token === 'string' ? parsed.token : null,
        userName: typeof parsed.userName === 'string' ? parsed.userName : null
      };
    } catch {
      return { authenticated: false, token: null, userName: null };
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
    const token =
      this.firstString(responseObject, ['token', 'accessToken', 'jwt']) ??
      this.firstString(responseData, ['token', 'accessToken', 'jwt']) ??
      this.firstString(responseResult, ['token', 'accessToken', 'jwt']) ??
      this.firstString(responsePayload, ['token', 'accessToken', 'jwt']);
    const userName =
      this.firstString(responseObject, ['userName', 'username', 'fullName', 'name']) ??
      this.firstString(responseData, ['userName', 'username', 'fullName', 'name']) ??
      this.firstString(responseResult, ['userName', 'username', 'fullName', 'name']) ??
      this.firstString(responsePayload, ['userName', 'username', 'fullName', 'name']) ??
      fallbackUserName;

    return {
      authenticated: true,
      token,
      userName
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
}