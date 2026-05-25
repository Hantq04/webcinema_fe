import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, OnDestroy, OnInit, signal, effect } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, EMPTY, finalize, from, switchMap, tap } from 'rxjs';

import { AuthService, CaptchaChallenge, LoginRequest, RegisterRequest } from '../../core/services/auth.service';
import { LanguageService } from '../../core/services/language.service';

type AuthTab = 'login' | 'register' | 'forgotpassword' | 'changepassword';

interface FlashMessage {
  type: 'success' | 'error' | 'info';
  text: string;
}

interface BackendFieldError {
  field?: string;
  message?: string;
}

interface BackendErrorDetails {
  message: string;
  fieldErrors: BackendFieldError[];
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
  private readonly titleService = inject(Title);
  private readonly route = inject(ActivatedRoute);

  protected readonly t = this.languageService.t.bind(this.languageService);

  protected readonly activeTab = signal<AuthTab>('login');
  protected readonly staffMode = signal(false);
  protected readonly submittingLogin = signal(false);
  protected readonly submittingRegister = signal(false);
  protected readonly submittingForgotPassword = signal(false);
  protected readonly submittingResetPassword = signal(false);
  protected readonly captchaLoading = signal(false);
  protected readonly captcha = signal<CaptchaChallenge | null>(null);
  protected readonly message = signal<FlashMessage | null>(null);
  protected readonly loginServerErrors = signal<Record<string, string>>({});
  protected readonly registerServerErrors = signal<Record<string, string>>({});
  protected readonly forgotServerErrors = signal<Record<string, string>>({});
  protected readonly resetServerErrors = signal<Record<string, string>>({});
  protected readonly showLoginPassword = signal(false);
  protected readonly showRegisterPassword = signal(false);
  protected readonly showResetNewPassword = signal(false);
  protected readonly showResetConfirmPassword = signal(false);

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

  protected readonly forgotPasswordForm = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]]
  });

  protected readonly resetPasswordForm = this.formBuilder.group({
    otp: ['', [Validators.required]],
    newPassWord: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassWord: ['', [Validators.required]]
  });

  protected readonly dayOptions = Array.from({ length: 31 }, (_, index) => String(index + 1));
  protected readonly monthOptions = Array.from({ length: 12 }, (_, index) => String(index + 1));
  protected readonly yearOptions = Array.from({ length: 100 }, (_, index) => String(new Date().getFullYear() - index));

  protected readonly loginCaptchaImage = computed(() => this.captcha()?.imageUrl ?? '');
  protected readonly loginCaptchaId = computed(() => this.captcha()?.captchaId ?? '');

  protected readonly promoSlides = [
    { imageUrl: '1.jpg' },
    { imageUrl: '2.jpg' },
    { imageUrl: '3.jpg' }
  ] as const;

  protected activePromoIndex = 0;

  private captchaObjectUrl: string | null = null;

  constructor() {
    effect(() => {
      // Trigger update when tab or language changes
      this.activeTab();
      this.languageService.currentLanguage();
      this.updateTitle();
    });
  }

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      void this.router.navigateByUrl('/');
      return;
    }

    const snapshot = this.route.snapshot;
    // Check staff mode from data (passed from app.routes.ts) or URL path
    if (snapshot.data['staff'] === true || this.router.url.includes('/staff/account')) {
      this.staffMode.set(true);
    }

    // Set active tab from route data (passed from auth.routes.ts)
    const tab = snapshot.data['tab'] as AuthTab;
    if (tab) {
      this.activeTab.set(tab);
    }

    this.loadCaptcha();
    this.updateTitle();

    // Check for message in history state (e.g. from forgot password flow)
    const state = history.state as { flashMessage?: string; flashType?: 'success' | 'error' | 'info' };
    if (state?.flashMessage) {
      this.message.set({ 
        type: state.flashType || 'info', 
        text: state.flashMessage 
      });
    }
  }

  ngOnDestroy(): void {
    if (this.captchaObjectUrl && this.captchaObjectUrl.startsWith('blob:')) {
      URL.revokeObjectURL(this.captchaObjectUrl);
    }
  }

  protected selectTab(tab: AuthTab, message: FlashMessage | null = null): void {
    this.activeTab.set(tab);
    this.message.set(message);
    this.loginServerErrors.set({});
    this.registerServerErrors.set({});
    this.forgotServerErrors.set({});
    this.resetServerErrors.set({});
    this.showLoginPassword.set(false);
    this.showRegisterPassword.set(false);
    this.showResetNewPassword.set(false);
    this.showResetConfirmPassword.set(false);

    if ((tab === 'login' || tab === 'register') && !this.captcha()) {
      this.loadCaptcha();
    }
    this.updateTitle();

    const base = this.staffMode() ? '/staff/account' : '/customer/account';
    void this.router.navigate([base, tab], {
      state: message ? { flashMessage: message.text, flashType: message.type } : undefined
    });
  }

  protected togglePasswordVisibility(field: 'login' | 'register' | 'resetNew' | 'resetConfirm'): void {
    if (field === 'login') this.showLoginPassword.update(v => !v);
    else if (field === 'register') this.showRegisterPassword.update(v => !v);
    else if (field === 'resetNew') this.showResetNewPassword.update(v => !v);
    else if (field === 'resetConfirm') this.showResetConfirmPassword.update(v => !v);
  }

  protected refreshCaptcha(): void {
    this.loadCaptcha();
  }

  protected submitLogin(): void {
    this.message.set(null);
    this.loginServerErrors.set({});
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
          return this.handleFormError('login', error, this.t('auth.loginError'), () => {
            this.refreshCaptcha();
            this.loginForm.reset({
              userName: '',
              passWord: '',
              captchaValue: ''
            });
          });
        }),
        finalize(() => this.submittingLogin.set(false))
      )
      .subscribe((session) => {
        if (this.staffMode()) {
          const role = session.role?.toUpperCase();
          if (role !== 'STAFF' && role !== 'ADMIN') {
            this.authService.logout();
            this.message.set({ type: 'error', text: this.t('auth.staffOnly') });
            return;
          }
        }

        this.message.set({
          type: 'success',
          text: session.userName ? `${this.t('auth.loginSuccessPrefix')}${session.userName}` : this.t('auth.loginSuccess')
        });

        if (this.staffMode()) {
          if (typeof localStorage !== 'undefined') {
            localStorage.removeItem('management_sidebar_collapsed');
          }
          void this.router.navigateByUrl('/management/dashboard');
        } else {
          void this.router.navigateByUrl('/');
        }
      });
  }

  protected submitRegister(): void {
    this.message.set(null);
    this.registerServerErrors.set({});
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
    const registerObs = this.staffMode() ? this.authService.staffRegister(payload) : this.authService.register(payload);

    registerObs
      .pipe(
        catchError((error: unknown) => {
          return this.handleFormError('register', error, this.t('auth.registerError'), () => this.refreshCaptcha());
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

  protected submitForgotPassword(): void {
    this.message.set(null);
    this.forgotServerErrors.set({});
    this.forgotPasswordForm.markAllAsTouched();

    if (this.forgotPasswordForm.invalid) return;

    const email = this.forgotPasswordForm.getRawValue().email?.trim() ?? '';
    this.submittingForgotPassword.set(true);

    this.authService.forgotPassword(email)
      .pipe(
        catchError((error: unknown) => {
          return this.handleFormError('forgotpassword', error, this.t('auth.forgotPasswordError'));
        }),
        finalize(() => this.submittingForgotPassword.set(false))
      )
      .subscribe(() => {
        this.selectTab('changepassword', {
          type: 'info',
          text: this.t('auth.otpSentMessage')
        });
        this.resetPasswordForm.patchValue({ otp: '' });
      });
  }

  protected submitResetPassword(): void {
    this.message.set(null);
    this.resetServerErrors.set({});
    this.resetPasswordForm.markAllAsTouched();

    if (this.resetPasswordForm.invalid) return;

    const rawValue = this.resetPasswordForm.getRawValue();
    const email = this.forgotPasswordForm.getRawValue().email?.trim() ?? '';

    if (rawValue.newPassWord !== rawValue.confirmPassWord) {
      this.message.set({ type: 'error', text: this.t('auth.passwordMismatch') });
      return;
    }

    const payload = {
      email,
      otp: rawValue.otp?.trim() ?? '',
      newPassWord: rawValue.newPassWord?.trim() ?? '',
      confirmPassWord: rawValue.confirmPassWord?.trim() ?? ''
    };

    this.submittingResetPassword.set(true);
    this.authService.changePassword(payload)
      .pipe(
        catchError((error: unknown) => {
          return this.handleFormError('changepassword', error, this.t('auth.resetPasswordError'));
        }),
        finalize(() => this.submittingResetPassword.set(false))
      )
      .subscribe(() => {
        this.message.set({ type: 'success', text: this.t('auth.resetPasswordSuccess') });
        this.selectTab('login');
      });
  }

  protected nextPromo(): void {
    this.activePromoIndex = (this.activePromoIndex + 1) % this.promoSlides.length;
  }

  private updateTitle(): void {
    const tab = this.activeTab();
    const key = tab === 'login' ? 'titles.login'
      : tab === 'register' ? 'titles.register'
      : tab === 'forgotpassword' ? 'titles.forgotpassword'
      : 'titles.changepassword';
    this.titleService.setTitle(this.t(key));
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

  protected serverFieldError(form: AuthTab, fieldName: string): string {
    if (form === 'login') {
      return this.loginServerErrors()[fieldName] ?? '';
    } else if (form === 'forgotpassword') {
      return this.forgotServerErrors()[fieldName] ?? '';
    } else if (form === 'changepassword') {
      return this.resetServerErrors()[fieldName] ?? '';
    }

    return this.registerServerErrors()[fieldName] ?? '';
  }

  private applyCaptcha(challenge: CaptchaChallenge): void {
    if (this.captchaObjectUrl && this.captchaObjectUrl.startsWith('blob:')) {
      URL.revokeObjectURL(this.captchaObjectUrl);
    }

    this.captchaObjectUrl = challenge.imageUrl;
    this.captcha.set(challenge);
  }

  private handleError(error: unknown, fallbackMessage: string, afterAction?: () => void) {
    return from(this.extractErrorDetailsAsync(error, fallbackMessage)).pipe(
      tap((details) => {
        this.message.set({ type: 'error', text: details.message });
        afterAction?.();
      }),
      switchMap(() => EMPTY)
    );
  }

  private handleFormError(form: AuthTab, error: unknown, fallbackMessage: string, afterAction?: () => void) {
    return from(this.extractErrorDetailsAsync(error, fallbackMessage)).pipe(
      tap((details) => {
        this.message.set({ type: 'error', text: details.message });
        this.setServerErrors(form, details.fieldErrors);
        afterAction?.();
      }),
      switchMap(() => EMPTY)
    );
  }

  private setServerErrors(form: AuthTab, fieldErrors: BackendFieldError[]): void {
    const mappedErrors = fieldErrors.reduce<Record<string, string>>((accumulator, item) => {
      if (item.field && item.message) {
        accumulator[item.field] = item.message;

        const lowerField = item.field.toLowerCase();
        accumulator[lowerField] = item.message;

        if (lowerField === 'username') {
          accumulator['userName'] = item.message;
          accumulator['username'] = item.message;
        } else if (lowerField === 'password') {
          accumulator['password'] = item.message;
          accumulator['passWord'] = item.message;
        } else if (lowerField === 'phonenumber') {
          accumulator['phoneNumber'] = item.message;
        } else if (lowerField === 'birthday' || lowerField === 'birthmonth' || lowerField === 'birthyear' || lowerField === 'birthdate') {
          accumulator['birthDay'] = item.message;
          accumulator['birthMonth'] = item.message;
          accumulator['birthYear'] = item.message;
          accumulator['birthDate'] = item.message;
        } else if (lowerField === 'newpassword') {
          accumulator['newPassWord'] = item.message;
        } else if (lowerField === 'confirmpassword') {
          accumulator['confirmPassWord'] = item.message;
        }
      }

      return accumulator;
    }, {});

    if (form === 'login') {
      this.loginServerErrors.set(mappedErrors);
      return;
    } else if (form === 'forgotpassword') {
      this.forgotServerErrors.set(mappedErrors);
      return;
    } else if (form === 'changepassword') {
      this.resetServerErrors.set(mappedErrors);
      return;
    }

    this.registerServerErrors.set(mappedErrors);
  }

  private async extractErrorDetailsAsync(error: unknown, fallbackMessage: string): Promise<BackendErrorDetails> {
    const payload = await this.extractErrorPayloadAsync(error);
    const payloadObject = this.asRecord(payload);
    const payloadData = this.asRecord(payloadObject['data']);
    const payloadResult = this.asRecord(payloadObject['result']);
    const payloadPayload = this.asRecord(payloadObject['payload']);
    const message =
      this.firstString(payloadObject, ['message', 'error', 'detail', 'title']) ??
      this.firstString(payloadData, ['message', 'error', 'detail', 'title']) ??
      this.firstString(payloadResult, ['message', 'error', 'detail', 'title']) ??
      this.firstString(payloadPayload, ['message', 'error', 'detail', 'title']) ??
      fallbackMessage;

    return {
      message,
      fieldErrors: this.extractFieldErrors(payloadObject, payloadData, payloadResult, payloadPayload)
    };
  }

  private async extractErrorPayloadAsync(error: unknown): Promise<unknown> {
    if (error instanceof HttpErrorResponse) {
      const responseError = error.error;

      if (typeof responseError === 'string' && responseError.trim()) {
        return this.tryParseJson(responseError);
      }

      if (responseError instanceof Blob) {
        try {
          return this.tryParseJson(await responseError.text());
        } catch {
          return responseError;
        }
      }

      return responseError;
    }

    return error;
  }

  private extractFieldErrors(...payloads: Record<string, unknown>[]): BackendFieldError[] {
    const fieldErrors: BackendFieldError[] = [];

    for (const payload of payloads) {
      const candidateErrors = payload['errors'] ?? payload['validationErrors'] ?? payload['fieldErrors'];

      if (!Array.isArray(candidateErrors)) {
        continue;
      }

      for (const candidateError of candidateErrors) {
        const errorRecord = this.asRecord(candidateError);
        const field = this.firstString(errorRecord, ['field', 'name', 'property', 'path']);
        const message = this.firstString(errorRecord, ['message', 'detail', 'error', 'reason']);

        if (field && message) {
          fieldErrors.push({ field, message });
        }
      }
    }

    return fieldErrors;
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
        return candidate.trim();
      }
    }

    return null;
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
}