import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, EMPTY, finalize, from, switchMap, tap } from 'rxjs';

import { AuthService, CaptchaChallenge, LoginRequest, RegisterRequest } from '../../core/services/auth.service';
import { LanguageService } from '../../core/services/language.service';

type AuthTab = 'login' | 'register';

interface FlashMessage {
  type: 'success' | 'error' | 'info';
  text: string;
}

@Component({
  selector: 'app-auth',
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css'
})
export class AuthComponent implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);
  private readonly languageService = inject(LanguageService);

  protected readonly t = this.languageService.t.bind(this.languageService);

  protected readonly activeTab = signal<AuthTab>('login');
  protected readonly submittingLogin = signal(false);
  protected readonly submittingRegister = signal(false);
  protected readonly captchaLoading = signal(false);
  protected readonly captcha = signal<CaptchaChallenge | null>(null);
  protected readonly message = signal<FlashMessage | null>(null);

  protected readonly loginForm = this.formBuilder.group({
    userName: ['', [Validators.required]],
    passWord: ['', [Validators.required]],
    captchaValue: ['', [Validators.required]]
  });

  protected readonly registerForm = this.formBuilder.group({
    name: ['', [Validators.required]],
    userName: ['', [Validators.required]],
    phoneNumber: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    birthDay: ['', [Validators.required]],
    birthMonth: ['', [Validators.required]],
    birthYear: ['', [Validators.required]],
    gender: ['', [Validators.required]],
    captchaValue: ['', [Validators.required]],
    acceptPrivacyPolicy: [false, [Validators.requiredTrue]],
    confirmIdentity: [false, [Validators.requiredTrue]],
    confirmEmailBirth: [false, [Validators.requiredTrue]],
    acceptTerms: [false, [Validators.requiredTrue]]
  });

  protected readonly dayOptions = Array.from({ length: 31 }, (_, index) => String(index + 1));
  protected readonly monthOptions = Array.from({ length: 12 }, (_, index) => String(index + 1));
  protected readonly yearOptions = Array.from({ length: 100 }, (_, index) => String(new Date().getFullYear() - index));

  protected readonly loginCaptchaImage = computed(() => this.captcha()?.imageUrl ?? '');
  protected readonly loginCaptchaId = computed(() => this.captcha()?.captchaId ?? '');

  protected readonly promoSlides = [
    {
      badge: 'CHƯƠNG TRÌNH TÍCH ĐIỂM',
      title: '1 điểm = 1.000 VND',
      description: 'tại tất cả các rạp CG trên toàn quốc',
      accent: 'coin'
    },
    {
      badge: 'CHƯƠNG TRÌNH KHUYẾN MÃI',
      title: 'Nhiều chương trình hấp dẫn',
      description: 'dành riêng cho thành viên CG',
      accent: 'gift'
    },
    {
      badge: 'QUÀ TẶNG SINH NHẬT',
      title: 'Quà tặng dành cho thành viên',
      description: 'áp dụng theo cấp độ thành viên trong tháng sinh nhật',
      accent: 'celebration'
    }
  ] as const;

  protected activePromoIndex = 0;

  private captchaObjectUrl: string | null = null;

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      void this.router.navigateByUrl('/');
      return;
    }

    this.loadCaptcha();
  }

  ngOnDestroy(): void {
    if (this.captchaObjectUrl && this.captchaObjectUrl.startsWith('blob:')) {
      URL.revokeObjectURL(this.captchaObjectUrl);
    }
  }

  protected selectTab(tab: AuthTab): void {
    this.activeTab.set(tab);
    this.message.set(null);

    if ((tab === 'login' || tab === 'register') && !this.captcha()) {
      this.loadCaptcha();
    }
  }

  protected refreshCaptcha(): void {
    this.loadCaptcha();
  }

  protected submitLogin(): void {
    this.message.set(null);
    this.loginForm.markAllAsTouched();

    if (this.loginForm.invalid || !this.loginCaptchaId()) {
      if (!this.loginCaptchaId()) {
        this.message.set({ type: 'error', text: this.t('auth.captchaReload') });
      }

      return;
    }

    const rawValue = this.loginForm.getRawValue();
    const payload: LoginRequest = {
      userName: rawValue.userName?.trim() ?? '',
      passWord: rawValue.passWord?.trim() ?? '',
      captchaId: this.loginCaptchaId(),
      captchaValue: rawValue.captchaValue?.trim() ?? ''
    };

    this.submittingLogin.set(true);
    this.authService
      .login(payload)
      .pipe(
        catchError((error: unknown) => {
          return this.handleError(error, this.t('auth.loginError'), () => this.refreshCaptcha());
        }),
        finalize(() => this.submittingLogin.set(false))
      )
      .subscribe((session) => {
        this.message.set({
          type: 'success',
          text: session.userName ? `${this.t('auth.loginSuccessPrefix')}${session.userName}` : this.t('auth.loginSuccess')
        });
        void this.router.navigateByUrl('/');
      });
  }

  protected submitRegister(): void {
    this.message.set(null);
    this.registerForm.markAllAsTouched();

    if (this.registerForm.invalid || !this.loginCaptchaId()) {
      if (!this.loginCaptchaId()) {
        this.message.set({ type: 'error', text: this.t('auth.captchaReload') });
      }

      return;
    }

    const rawValue = this.registerForm.getRawValue();
    const birthDate = `${rawValue.birthYear?.trim() ?? ''}-${String(rawValue.birthMonth ?? '').padStart(2, '0')}-${String(rawValue.birthDay ?? '').padStart(2, '0')}`;
    const payload: RegisterRequest = {
      userName: rawValue.userName?.trim() ?? '',
      email: rawValue.email?.trim() ?? '',
      name: rawValue.name?.trim() ?? '',
      phoneNumber: rawValue.phoneNumber?.trim() ?? '',
      password: rawValue.password?.trim() ?? '',
      birthDate,
      gender: rawValue.gender ?? 'Nam'
    };

    this.submittingRegister.set(true);
    this.authService
      .register(payload)
      .pipe(
        catchError((error: unknown) => {
          return this.handleError(error, this.t('auth.registerError'), () => this.refreshCaptcha());
        }),
        finalize(() => this.submittingRegister.set(false))
      )
      .subscribe(() => {
        this.message.set({ type: 'success', text: this.t('auth.registerSuccess') });
        this.registerForm.reset({
          gender: '',
          userName: '',
          acceptPrivacyPolicy: false,
          confirmIdentity: false,
          confirmEmailBirth: false,
          acceptTerms: false
        });
        this.selectTab('login');
      });
  }

  protected nextPromo(): void {
    this.activePromoIndex = (this.activePromoIndex + 1) % this.promoSlides.length;
  }

  protected previousPromo(): void {
    this.activePromoIndex = (this.activePromoIndex - 1 + this.promoSlides.length) % this.promoSlides.length;
  }

  protected selectPromo(index: number): void {
    this.activePromoIndex = index;
  }

  protected get activePromo() {
    return this.promoSlides[this.activePromoIndex];
  }

  private loadCaptcha(): void {
    this.captchaLoading.set(true);
    this.authService
      .getCaptcha()
      .pipe(
        catchError((error: unknown) => {
          return this.handleError(error, this.t('auth.captchaError'), () => this.captcha.set(null));
        }),
        finalize(() => this.captchaLoading.set(false))
      )
      .subscribe((challenge) => this.applyCaptcha(challenge));
  }

  protected get acceptTermsInvalid(): boolean {
    const controls = this.registerForm.controls;
    return [
      controls.acceptPrivacyPolicy,
      controls.confirmIdentity,
      controls.confirmEmailBirth,
      controls.acceptTerms
    ].some((control) => control.touched && control.invalid);
  }

  protected consentInvalid(controlName: 'acceptPrivacyPolicy' | 'confirmIdentity' | 'confirmEmailBirth' | 'acceptTerms'): boolean {
    const control = this.registerForm.controls[controlName];
    return control.invalid && (control.touched || control.dirty);
  }

  protected get birthDateInvalid(): boolean {
    const controls = this.registerForm.controls;
    return [controls.birthDay, controls.birthMonth, controls.birthYear].some((control) => control.touched && control.invalid);
  }

  protected get genderInvalid(): boolean {
    const control = this.registerForm.controls.gender;
    return control.touched && control.invalid;
  }

  private applyCaptcha(challenge: CaptchaChallenge): void {
    if (this.captchaObjectUrl && this.captchaObjectUrl.startsWith('blob:')) {
      URL.revokeObjectURL(this.captchaObjectUrl);
    }

    this.captchaObjectUrl = challenge.imageUrl;
    this.captcha.set(challenge);
  }

  private handleError(error: unknown, fallbackMessage: string, afterAction?: () => void) {
    return from(this.extractErrorMessageAsync(error, fallbackMessage)).pipe(
      tap((message) => {
        this.message.set({ type: 'error', text: message });
        afterAction?.();
      }),
      switchMap(() => EMPTY)
    );
  }

  private async extractErrorMessageAsync(error: unknown, fallbackMessage: string): Promise<string> {
    if (error instanceof HttpErrorResponse) {
      const responseError = error.error;

      if (typeof responseError === 'string' && responseError.trim()) {
        return responseError.trim();
      }

      if (responseError instanceof Blob) {
        try {
          const text = await responseError.text();
          const parsed = this.extractErrorMessageFromPayload(text, fallbackMessage);
          if (parsed !== fallbackMessage) {
            return parsed;
          }
        } catch {
          // fall through to standard handling
        }
      }

      const payloadMessage = this.extractErrorMessageFromPayload(responseError, fallbackMessage);
      if (payloadMessage !== fallbackMessage) {
        return payloadMessage;
      }

      if (error.message && error.message.trim()) {
        return error.message;
      }
    }

    return this.extractErrorMessageFromPayload(error, fallbackMessage);
  }

  private extractErrorMessageFromPayload(error: unknown, fallbackMessage: string): string {
    if (error instanceof Error && error.message) {
      return error.message;
    }

    if (typeof error === 'string' && error.trim()) {
      return error;
    }

    if (error && typeof error === 'object') {
      const record = error as Record<string, unknown>;

      for (const key of ['message', 'error', 'detail', 'title']) {
        const candidate = record[key];

        if (typeof candidate === 'string' && candidate.trim()) {
          return candidate;
        }

        if (candidate && typeof candidate === 'object') {
          const nestedRecord = candidate as Record<string, unknown>;

          for (const nestedKey of ['message', 'error', 'detail', 'title']) {
            const nestedCandidate = nestedRecord[nestedKey];

            if (typeof nestedCandidate === 'string' && nestedCandidate.trim()) {
              return nestedCandidate;
            }
          }
        }
      }
    }

    return fallbackMessage;
  }
}