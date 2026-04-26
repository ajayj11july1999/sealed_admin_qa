import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse,
} from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private router: Router, private toastr: ToastrService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const rawToken = (sessionStorage.getItem('tokenA') || '').toString().trim();
    const token = rawToken.replace(/^Bearer\s+/i, '');
    const rawUserId = localStorage.getItem('useridA') || '';
    let userId = '';
    try {
      userId = rawUserId ? JSON.parse(rawUserId) : '';
    } catch {
      userId = rawUserId.trim();
    }

    let authReq = req;

    const headers: any = {
      ...req.headers.keys().reduce((acc: any, key: string) => ({ ...acc, [key]: req.headers.get(key) }), {}),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    if (userId) {
      headers.userId = userId;
    }

    authReq = req.clone({ setHeaders: headers });

    return next.handle(authReq).pipe(
      catchError((error: any) => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          console.warn('Unauthorized (401) detected in AuthInterceptor. Clearing storages and redirecting to /login.');
          sessionStorage.clear();
          localStorage.clear();
          this.toastr.error('Session expired. Please login again.', 'Unauthorized');
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }
}

