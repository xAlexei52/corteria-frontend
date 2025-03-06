// users.service.ts (actualizado con los endpoints correctos)
import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private apiUrl = `${environment.apiBase}/users`;

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        map((response) => {
          if (response.success) {
            this.handleAuthentication(response);
          }
          return response;
        }),
        catchError(this.handleError)
      );
  }

  private handleAuthentication(response: any): void {
    localStorage.setItem('token', response.token);
    localStorage.setItem('userData', JSON.stringify(response.data));
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ha ocurrido un error desconocido';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage =
        error.error?.message ||
        `Código de error: ${error.status}, Mensaje: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  register(userData: any): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/register`, userData)
      .pipe(catchError(this.handleError));
  }

  forgotPassword(email: string): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/forgot-password`, { email })
      .pipe(
        map((response) => {
          console.log('Forgot password response:', response);
          return response;
        }),
        catchError(this.handleError)
      );
  }

  resetPassword(token: string, password: string): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/reset-password/${token}`, { password })
      .pipe(catchError(this.handleError));
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return !!token;
  }

  getCurrentUserToken(): string | null {
    return localStorage.getItem('token');
  }

  getCurrentUserData(): any {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  }

  // Añadir estos métodos a tu servicio de usuarios existente

  // Obtener lista de usuarios (administración)
  getUsers(params?: any): Observable<any> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.page) httpParams = httpParams.set('page', params.page);
      if (params.limit) httpParams = httpParams.set('limit', params.limit);
      if (params.search) httpParams = httpParams.set('search', params.search);
      if (params.city) httpParams = httpParams.set('city', params.city);
      if (params.active !== undefined)
        httpParams = httpParams.set('active', params.active);
      if (params.role) httpParams = httpParams.set('role', params.role);
    }

    return this.http
      .get<any>(`${environment.apiBase}/admin/users`, { params: httpParams })
      .pipe(catchError(this.handleError));
  }

  // Obtener detalles de un usuario específico (administración)
  getUserById(id: string): Observable<any> {
    return this.http
      .get<any>(`${environment.apiBase}/admin/users/${id}`)
      .pipe(catchError(this.handleError));
  }

  // Activar/desactivar usuario
  toggleUserActive(id: string, active: boolean): Observable<any> {
    return this.http
      .patch<any>(`${environment.apiBase}/admin/users/${id}/toggle-active`, {
        active,
      })
      .pipe(catchError(this.handleError));
  }

  // Actualizar permisos de usuario
  updateUserPermissions(
    id: string,
    permissions: { role: string; city?: string }
  ): Observable<any> {
    return this.http
      .patch<any>(
        `${environment.apiBase}/admin/users/${id}/permissions`,
        permissions
      )
      .pipe(catchError(this.handleError));
  }

  updateUser(id: string, userData: any): Observable<any> {
    return this.http
      .put<any>(`${environment.apiBase}/admin/users/${id}`, userData)
      .pipe(catchError(this.handleError));
  }
}
