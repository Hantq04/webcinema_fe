import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { AuthService } from '../services/auth.service';
import { LanguageService } from '../services/language.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
	const authService = inject(AuthService);
	const languageService = inject(LanguageService);
	const token = authService.getAccessToken();
	const acceptLanguage = languageService.currentLanguage();
	const shouldSkipAuthHeader = request.url.includes('/api/v1/user/login') || request.url.includes('/api/v1/captcha');
	const headers = {
		'Accept-Language': acceptLanguage
	};

	if (!token || shouldSkipAuthHeader) {
		return next(
			request.clone({
				setHeaders: headers
			})
		);
	}

	return next(
		request.clone({
			setHeaders: {
				Authorization: `Bearer ${token}`,
				...headers
			}
		})
	);
};