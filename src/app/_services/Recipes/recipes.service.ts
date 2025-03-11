// recipes.service.ts
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
export class RecipesService {
  private apiUrl = `${environment.apiBase}/recipes`;

  constructor(private http: HttpClient) {}

  // Obtener listado de recetas
  getRecipes(params?: any): Observable<any> {
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

  // Obtener una receta por ID
  getRecipeById(id: string): Observable<any> {
    return this.http
      .get<any>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  // Crear una nueva receta
  createRecipe(recipeData: any): Observable<any> {
    return this.http
      .post<any>(this.apiUrl, recipeData)
      .pipe(catchError(this.handleError));
  }

  // Actualizar una receta existente
  updateRecipe(id: string, recipeData: any): Observable<any> {
    return this.http
      .put<any>(`${this.apiUrl}/${id}`, recipeData)
      .pipe(catchError(this.handleError));
  }

  // Eliminar una receta
  deleteRecipe(id: string): Observable<any> {
    return this.http
      .delete<any>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  // Asignar receta a un producto
  assignRecipeToProduct(recipeId: string, productId: string): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/${recipeId}/assign/${productId}`, {})
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
