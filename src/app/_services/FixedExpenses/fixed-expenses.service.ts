// src/app/_services/FixedExpenses/fixed-expenses.service.ts
import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpParams,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class FixedExpensesService {
  private apiUrl = `${environment.apiBase}/fixed-expenses`;

  constructor(private http: HttpClient) {}

  // Obtener listado de gastos fijos
  getFixedExpenses(params?: any): Observable<any> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.active !== undefined)
        httpParams = httpParams.set('active', params.active);
      if (params.city) httpParams = httpParams.set('city', params.city);
      if (params.period) httpParams = httpParams.set('period', params.period);
      if (params.search) httpParams = httpParams.set('search', params.search);
      if (params.page) httpParams = httpParams.set('page', params.page);
      if (params.limit) httpParams = httpParams.set('limit', params.limit);
    }

    return this.http
      .get<any>(this.apiUrl, { params: httpParams })
      .pipe(catchError(this.handleError));
  }

  // Obtener un gasto fijo por ID
  getFixedExpenseById(id: string): Observable<any> {
    return this.http
      .get<any>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  // Crear un nuevo gasto fijo
  createFixedExpense(expenseData: any): Observable<any> {
    return this.http
      .post<any>(this.apiUrl, expenseData)
      .pipe(catchError(this.handleError));
  }

  // Actualizar un gasto fijo existente
  updateFixedExpense(id: string, expenseData: any): Observable<any> {
    return this.http
      .put<any>(`${this.apiUrl}/${id}`, expenseData)
      .pipe(catchError(this.handleError));
  }

  // Eliminar o desactivar un gasto fijo
  deleteFixedExpense(id: string): Observable<any> {
    return this.http
      .delete<any>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  // Obtener el costo diario total por ciudad
  getTotalDailyCost(city: string): Observable<any> {
    return this.http
      .get<any>(`${this.apiUrl}/total-daily-cost/${city}`)
      .pipe(catchError(this.handleError));
  }

  // Manejador de errores genérico
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ha ocurrido un error desconocido';

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // El backend devolvió un código de respuesta no exitoso
      errorMessage =
        error.error?.message ||
        `Código de error: ${error.status}, Mensaje: ${error.message}`;
    }

    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
