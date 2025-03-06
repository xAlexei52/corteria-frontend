// recipe-list.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { RecipesService } from 'src/app/_services/Recipes/recipes.service';

@Component({
  selector: 'app-recipe-list',
  templateUrl: './recipe-list.component.html',
  styleUrls: ['./recipe-list.component.css'],
})
export class RecipeListComponent implements OnInit {
  recipes: any[] = [];
  isLoading: boolean = false;
  totalItems: number = 0;
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 0;

  filterForm!: FormGroup;
  alertMessage: string = '';
  isSuccess: boolean = false;
  isClosing: boolean = false;

  constructor(
    private recipesService: RecipesService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.filterForm = this.fb.group({
      search: [''],
      active: [''],
    });
  }

  ngOnInit(): void {
    this.loadRecipes();
  }

  loadRecipes(): void {
    this.isLoading = true;

    const filters = {
      page: this.currentPage,
      limit: this.itemsPerPage,
      ...this.filterForm.value,
    };

    // Eliminar propiedades vacías
    Object.keys(filters).forEach((key) => {
      if (filters[key] === '' || filters[key] === null) {
        delete filters[key];
      }
    });

    this.recipesService.getRecipes(filters).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.recipes = response.recipes;
          this.totalItems = response.pagination.total;
          this.totalPages = response.pagination.totalPages;
          this.currentPage = response.pagination.currentPage;
          this.itemsPerPage = response.pagination.limit;
        } else {
          this.showAlert('Error al cargar las recetas', false);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.showAlert('Error al cargar las recetas: ' + err.message, false);
      },
    });
  }

  // Cambiar de página
  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadRecipes();
  }

  // Aplicar filtros
  applyFilters(): void {
    this.currentPage = 1; // Resetear a la primera página
    this.loadRecipes();
  }

  // Resetear filtros
  resetFilters(): void {
    this.filterForm.reset({
      search: '',
      active: '',
    });
    this.currentPage = 1;
    this.loadRecipes();
  }

  // Navegar a la página de detalle de la receta
  viewRecipeDetails(id: string): void {
    this.router.navigate([`/recipes/details/${id}`]);
  }

  // Navegar a la página de edición de la receta
  editRecipe(id: string): void {
    this.router.navigate([`/recipes/edit/${id}`]);
  }

  // Crear nueva receta
  createNewRecipe(): void {
    this.router.navigate(['/recipes/new']);
  }

  // Eliminar una receta
  deleteRecipe(id: string): void {
    if (confirm('¿Estás seguro de que deseas eliminar esta receta?')) {
      this.recipesService.deleteRecipe(id).subscribe({
        next: (response) => {
          if (response.success) {
            this.showAlert('Receta eliminada correctamente', true);
            this.loadRecipes(); // Recargar la lista
          } else {
            this.showAlert('Error al eliminar la receta', false);
          }
        },
        error: (err) => {
          this.showAlert('Error al eliminar la receta: ' + err.message, false);
        },
      });
    }
  }

  // Obtener número de productos que usan la receta
  getProductCount(recipe: any): number {
    return recipe.products?.length || 0;
  }

  // Mostrar alerta
  private showAlert(message: string, isSuccess: boolean): void {
    this.alertMessage = message;
    this.isSuccess = isSuccess;
    this.isClosing = false;

    setTimeout(() => {
      this.isClosing = true;
      setTimeout(() => {
        this.alertMessage = '';
        this.isClosing = false;
      }, 300);
    }, 5000);
  }
}
