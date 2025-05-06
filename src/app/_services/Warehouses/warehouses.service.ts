// src/app/_services/Warehouses/warehouses.service.ts (actualizado)

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
export class WarehousesService {
  private apiUrl = `${environment.apiBase}/warehouses`;

  constructor(private http: HttpClient) {}

  // Obtener listado de almacenes
  getWarehouses(params?: any): Observable<any> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.active !== undefined)
        httpParams = httpParams.set('active', params.active);
      if (params.city) httpParams = httpParams.set('city', params.city);
      if (params.isMain !== undefined)
        httpParams = httpParams.set('isMain', params.isMain);
      if (params.page) httpParams = httpParams.set('page', params.page);
      if (params.limit) httpParams = httpParams.set('limit', params.limit);
      if (params.search) httpParams = httpParams.set('search', params.search);
    }

    return this.http
      .get<any>(this.apiUrl, { params: httpParams })
      .pipe(catchError(this.handleError));
  }

  // Obtener un almacén por ID
  getWarehouseById(id: string): Observable<any> {
    return this.http
      .get<any>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  // Crear un nuevo almacén
  createWarehouse(warehouseData: any): Observable<any> {
    return this.http
      .post<any>(this.apiUrl, warehouseData)
      .pipe(catchError(this.handleError));
  }

  // Actualizar un almacén existente
  updateWarehouse(id: string, warehouseData: any): Observable<any> {
    return this.http
      .put<any>(`${this.apiUrl}/${id}`, warehouseData)
      .pipe(catchError(this.handleError));
  }

  // Eliminar un almacén
  deleteWarehouse(id: string): Observable<any> {
    return this.http
      .delete<any>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  // Obtener los almacenes por ciudad
  getWarehousesByCity(city: string): Observable<any> {
    return this.http
      .get<any>(`${this.apiUrl}/by-city/${city}`)
      .pipe(catchError(this.handleError));
  }

  // Obtener el almacén principal de una ciudad
  getMainWarehouseByCity(city: string): Observable<any> {
    return this.http
      .get<any>(`${this.apiUrl}/main/${city}`)
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
