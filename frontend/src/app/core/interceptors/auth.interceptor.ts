import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.token();
  if (!token) return next(req);

  const isAbsolute = /^https?:\/\//i.test(req.url);
  const matchesApiBase = !!environment.apiUrl && req.url.startsWith(environment.apiUrl);
  const isApiCall = !isAbsolute || matchesApiBase;

  if (!isApiCall) return next(req);

  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
      'X-Authorization': `Bearer ${token}`,
    }
  });
  return next(authReq);
};
