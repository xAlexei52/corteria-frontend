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
export class TrailerEntriesService {
  private apiUrl = `${environment.apiBase}/trailer-entries`;

  constructor(private http: HttpClient) {}

  getTrailerEntries(params?: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.page) httpParams = httpParams.set('page', params.page);
      if (params.limit) httpParams = httpParams.set('limit', params.limit);
      if (params.startDate)
        httpParams = httpParams.set('startDate', params.startDate);
      if (params.endDate)
        httpParams = httpParams.set('endDate', params.endDate);
      if (params.city) httpParams = httpParams.set('city', params.city);
      if (params.supplier)
        httpParams = httpParams.set('supplier', params.supplier);
      if (params.productId)
        httpParams = httpParams.set('productId', params.productId);
      // Nuevos parámetros
      if (params.needsProcessing !== undefined)
        httpParams = httpParams.set('needsProcessing', params.needsProcessing);
      if (params.processingStatus)
        httpParams = httpParams.set(
          'processingStatus',
          params.processingStatus
        );
    }

    return this.http
      .get<any>(this.apiUrl, { params: httpParams })
      .pipe(catchError(this.handleError));
  }

  getTrailerEntryById(id: string): Observable<any> {
    return this.http
      .get<any>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  createTrailerEntry(entryData: any): Observable<any> {
    return this.http
      .post<any>(this.apiUrl, entryData)
      .pipe(catchError(this.handleError));
  }

  updateTrailerEntry(id: string, entryData: any): Observable<any> {
    return this.http
      .put<any>(`${this.apiUrl}/${id}`, entryData)
      .pipe(catchError(this.handleError));
  }

  deleteTrailerEntry(id: string): Observable<any> {
    return this.http
      .delete<any>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

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

  getTotalAmount(product?: any) {
    let httpParams = new HttpParams();
    httpParams = httpParams.set('productId', product);
    return this.http
      .get<any>(this.apiUrl, { params: httpParams })
      .pipe(catchError(this.handleError));
  }
}
