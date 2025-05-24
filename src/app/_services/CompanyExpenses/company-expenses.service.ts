// src/app/_services/CompanyExpenses/company-expenses.service.ts
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
export class CompanyExpensesService {
  private apiUrl = `${environment.apiBase}/company-expenses`;

  constructor(private http: HttpClient) {}

  // Obtener listado de gastos con filtros opcionales
  getExpenses(params?: any): Observable<any> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.page) httpParams = httpParams.set('page', params.page);
      if (params.limit) httpParams = httpParams.set('limit', params.limit);
      if (params.search) httpParams = httpParams.set('search', params.search);
      if (params.category)
        httpParams = httpParams.set('category', params.category);
      if (params.startDate)
        httpParams = httpParams.set('startDate', params.startDate);
      if (params.endDate)
        httpParams = httpParams.set('endDate', params.endDate);
      if (params.cityId) httpParams = httpParams.set('cityId', params.cityId);
      if (params.isBillable !== undefined)
        httpParams = httpParams.set('isBillable', params.isBillable);
    }

    return this.http
      .get<any>(this.apiUrl, { params: httpParams })
      .pipe(catchError(this.handleError));
  }

  // Obtener un gasto por ID
  getExpenseById(id: string): Observable<any> {
    return this.http
      .get<any>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  // Crear un nuevo gasto
  createExpense(expenseData: FormData): Observable<any> {
    return this.http
      .post<any>(this.apiUrl, expenseData)
      .pipe(catchError(this.handleError));
  }

  // Actualizar un gasto existente
  updateExpense(id: string, expenseData: FormData): Observable<any> {
    return this.http
      .put<any>(`${this.apiUrl}/${id}`, expenseData)
      .pipe(catchError(this.handleError));
  }

  // Eliminar un gasto
  deleteExpense(id: string): Observable<any> {
    return this.http
      .delete<any>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  // Obtener estadísticas de gastos
  getStatistics(params?: any): Observable<any> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.startDate)
        httpParams = httpParams.set('startDate', params.startDate);
      if (params.endDate)
        httpParams = httpParams.set('endDate', params.endDate);
      if (params.cityId) httpParams = httpParams.set('cityId', params.cityId);
    }

    return this.http
      .get<any>(`${this.apiUrl}/statistics`, { params: httpParams })
      .pipe(catchError(this.handleError));
  }

  // Descargar archivo adjunto
  downloadFile(id: string): Observable<Blob> {
    return this.http
      .get(`${this.apiUrl}/${id}/download`, {
        responseType: 'blob',
        observe: 'body',
      })
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
