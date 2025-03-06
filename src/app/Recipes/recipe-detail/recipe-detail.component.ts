// recipe-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RecipesService } from 'src/app/_services/Recipes/recipes.service';
import { ProductsService } from 'src/app/_services/Products/products.service';

@Component({
  selector: 'app-recipe-detail',
  templateUrl: './recipe-detail.component.html',
  styleUrls: ['./recipe-detail.component.css'],
})
export class RecipeDetailComponent implements OnInit {
  recipeId: string = '';
  recipe: any = null;
  isLoading: boolean = false;

  // Para asignar receta a producto
  productForm!: FormGroup;
  availableProducts: any[] = [];
  isLoadingProducts: boolean = false;
  isSubmittingAssignment: boolean = false;

  alertMessage: string = '';
  isSuccess: boolean = false;
  isClosing: boolean = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private recipesService: RecipesService,
    private productsService: ProductsService
  ) {
    this.createProductForm();
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.recipeId = params['id'];
      if (this.recipeId) {
        this.loadRecipeDetails();
        this.loadAvailableProducts();
      } else {
        this.router.navigate(['/recipes/list']);
      }
    });
  }

  createProductForm(): void {
    this.productForm = this.fb.group({
      productId: ['', Validators.required],
    });
  }

  loadRecipeDetails(): void {
    this.isLoading = true;
    this.recipesService.getRecipeById(this.recipeId).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.recipe = response.recipe;
        } else {
          this.showAlert('Error al cargar los detalles de la receta', false);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.showAlert('Error al cargar los detalles: ' + err.message, false);
      },
    });
  }

  loadAvailableProducts(): void {
    this.isLoadingProducts = true;
    this.productsService.getProducts({ active: true }).subscribe({
      next: (response) => {
        this.isLoadingProducts = false;
        if (response.success) {
          this.availableProducts = response.products;
        } else {
          this.showAlert('Error al cargar los productos disponibles', false);
        }
      },
      error: (err) => {
        this.isLoadingProducts = false;
        this.showAlert('Error al cargar los productos: ' + err.message, false);
      },
    });
  }

  assignToProduct(): void {
    if (this.productForm.invalid) {
      this.showAlert('Por favor, selecciona un producto', false);
      return;
    }

    const productId = this.productForm.get('productId')?.value;
    const productName =
      this.availableProducts.find((p) => p.id === productId)?.name ||
      'Producto seleccionado';

    if (
      confirm(
        `¿Estás seguro de que deseas asignar esta receta a "${productName}"?`
      )
    ) {
      this.isSubmittingAssignment = true;

      this.recipesService
        .assignRecipeToProduct(this.recipeId, productId)
        .subscribe({
          next: (response) => {
            this.isSubmittingAssignment = false;
            if (response.success) {
              this.showAlert('Receta asignada al producto correctamente', true);
              // Recargar detalles para reflejar el cambio
              this.loadRecipeDetails();
              this.productForm.reset();
            } else {
              this.showAlert(
                'Error al asignar la receta: ' +
                  (response.message || 'Error desconocido'),
                false
              );
            }
          },
          error: (err) => {
            this.isSubmittingAssignment = false;
            this.showAlert('Error al asignar la receta: ' + err.message, false);
          },
        });
    }
  }

  // Navegar a la página de edición de la receta
  editRecipe(): void {
    this.router.navigate([`/recipes/edit/${this.recipeId}`]);
  }

  // Eliminar la receta
  deleteRecipe(): void {
    if (confirm('¿Estás seguro de que deseas eliminar esta receta?')) {
      this.recipesService.deleteRecipe(this.recipeId).subscribe({
        next: (response) => {
          if (response.success) {
            this.showAlert('Receta eliminada correctamente', true);
            setTimeout(() => {
              this.router.navigate(['/recipes/list']);
            }, 1500);
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

  // Volver a la lista de recetas
  goBack(): void {
    this.router.navigate(['/recipes/list']);
  }

  // Calcular costo total de los insumos
  calculateTotalCost(): number {
    if (!this.recipe || !this.recipe.supplies) return 0;

    return this.recipe.supplies.reduce((total: number, supply: any) => {
      return (
        total +
        parseFloat(supply.quantity) * parseFloat(supply.supply.costPerUnit)
      );
    }, 0);
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
