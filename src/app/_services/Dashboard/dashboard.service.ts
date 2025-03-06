// src/app/_services/dashboard/dashboard.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private apiUrl = `${environment.apiBase}/dashboard`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene los datos del dashboard
   */
  getDashboardData(): Observable<any> {
    return this.http.get<any>(this.apiUrl).pipe(
      map((response) => {
        if (response.success) {
          return response.summary;
        }
        throw new Error('Error obteniendo datos del dashboard');
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Maneja errores de las peticiones HTTP
   */
  private handleError(error: any) {
    let errorMessage = 'Ha ocurrido un error desconocido';
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del servidor
      errorMessage =
        error.error?.message ||
        `Código de error: ${error.status}, Mensaje: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
