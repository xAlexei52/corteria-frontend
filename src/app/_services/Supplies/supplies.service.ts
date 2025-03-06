// supplies.service.ts
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
export class SuppliesService {
  private apiUrl = `${environment.apiBase}/supplies`;

  constructor(private http: HttpClient) {}

  // Obtener listado de insumos
  getSupplies(params?: any): Observable<any> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.page) httpParams = httpParams.set('page', params.page);
      if (params.limit) httpParams = httpParams.set('limit', params.limit);
      if (params.search) httpParams = httpParams.set('search', params.search);
      if (params.active !== undefined)
        httpParams = httpParams.set('active', params.active);
    }

    return this.http
      .get<any>(this.apiUrl, { params: httpParams })
      .pipe(catchError(this.handleError));
  }

  // Obtener un insumo por ID
  getSupplyById(id: string): Observable<any> {
    return this.http
      .get<any>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  // Crear un nuevo insumo
  createSupply(supplyData: any): Observable<any> {
    return this.http
      .post<any>(this.apiUrl, supplyData)
      .pipe(catchError(this.handleError));
  }

  // Actualizar un insumo existente
  updateSupply(id: string, supplyData: any): Observable<any> {
    return this.http
      .put<any>(`${this.apiUrl}/${id}`, supplyData)
      .pipe(catchError(this.handleError));
  }

  // Eliminar un insumo
  deleteSupply(id: string): Observable<any> {
    return this.http
      .delete<any>(`${this.apiUrl}/${id}`)
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
