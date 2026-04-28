import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, tap, throwError } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { LanguageService } from '../services/language.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
	const authService = inject(AuthService);
	const languageService = inject(LanguageService);
	const token = authService.getAccessToken();
	const acceptLanguage = languageService.currentLanguage();
	const shouldSkipAuthHeader =
		request.url.includes('/api/v1/user/login') ||
		request.url.includes('/api/v1/user/register') ||
		request.url.includes('/api/v1/user/staff-register') ||
		request.url.includes('/api/v1/captcha') ||
		request.url.includes('/api/v1/user/forgot-password') ||
		request.url.includes('/api/v1/user/reset-password');
	const headers: Record<string, string> = {
		'Accept-Language': acceptLanguage
	};

	if (token && !shouldSkipAuthHeader) {
		headers['Authorization'] = `Bearer ${token}`;
	}

	const clonedRequest = request.clone({
		setHeaders: headers
	});

	return next(clonedRequest).pipe(
		tap((event) => {
			if (event instanceof HttpResponse) {
				const body = event.body as any;
				if (body && (body.status === 1104 || body.code === 1104)) {
					authService.logout();
				}
			}
		}),
		catchError((error) => {
			const errorBody = error.error as any;
			if (errorBody && (errorBody.status === 1104 || errorBody.code === 1104)) {
				authService.logout();
			}
			return throwError(() => error);
		})
	);
};