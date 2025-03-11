// recipe-form.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RecipesService } from 'src/app/_services/Recipes/recipes.service';
import { SuppliesService } from 'src/app/_services/Supplies/supplies.service';

@Component({
  selector: 'app-recipe-form',
  templateUrl: './recipe-form.component.html',
  styleUrls: ['./recipe-form.component.css'],
})
export class RecipeFormComponent implements OnInit {
  recipeForm!: FormGroup;
  isLoading: boolean = false;
  isSubmitting: boolean = false;
  isEditMode: boolean = false;
  recipeId: string = '';

  supplies: any[] = [];
  isLoadingSupplies: boolean = false;

  alertMessage: string = '';
  isSuccess: boolean = false;
  isClosing: boolean = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private recipesService: RecipesService,
    private suppliesService: SuppliesService
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    this.loadSupplies();

    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.recipeId = params['id'];
        this.isEditMode = true;
        this.loadRecipeData();
      }
    });
  }

  createForm(): void {
    this.recipeForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      processingTime: [60, [Validators.required, Validators.min(1)]],
      active: [true],
      supplies: this.fb.array([]),
    });
  }

  get suppliesArray(): FormArray {
    return this.recipeForm.get('supplies') as FormArray;
  }

  addSupply(): void {
    const supplyGroup = this.fb.group({
      supplyId: ['', Validators.required],
      quantity: [0, [Validators.required, Validators.min(0.001)]],
    });

    this.suppliesArray.push(supplyGroup);
  }

  removeSupply(index: number): void {
    this.suppliesArray.removeAt(index);
  }

  loadSupplies(): void {
    this.isLoadingSupplies = true;
    this.suppliesService.getSupplies({ active: true }).subscribe({
      next: (response) => {
        this.isLoadingSupplies = false;
        if (response.success) {
          this.supplies = response.supplies;
        } else {
          this.showAlert('Error al cargar los insumos', false);
        }
      },
      error: (err) => {
        this.isLoadingSupplies = false;
        this.showAlert('Error al cargar los insumos: ' + err.message, false);
      },
    });
  }

  loadRecipeData(): void {
    this.isLoading = true;
    this.recipesService.getRecipeById(this.recipeId).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          const recipe = response.recipe;

          // Cargar datos básicos
          this.recipeForm.patchValue({
            name: recipe.name,
            description: recipe.description,
            processingTime: recipe.processingTime,
            active: recipe.active,
          });

          // Cargar insumos
          if (recipe.supplies && recipe.supplies.length > 0) {
            // Limpiar array actual
            while (this.suppliesArray.length) {
              this.suppliesArray.removeAt(0);
            }

            // Agregar insumos
            recipe.supplies.forEach((item: any) => {
              const supplyGroup = this.fb.group({
                supplyId: [item.supplyId, Validators.required],
                quantity: [
                  item.quantity,
                  [Validators.required, Validators.min(0.001)],
                ],
              });

              this.suppliesArray.push(supplyGroup);
            });
          } else {
            // Si no tiene insumos, agregar uno vacío para que el usuario pueda empezar a agregar
            this.addSupply();
          }
        } else {
          this.showAlert('Error al cargar los datos de la receta', false);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.showAlert('Error al cargar los datos: ' + err.message, false);
      },
    });
  }

  onSubmit(): void {
    if (this.recipeForm.invalid) {
      this.markFormGroupTouched(this.recipeForm);
      this.showAlert('Por favor, completa todos los campos requeridos', false);
      return;
    }

    if (this.suppliesArray.length === 0) {
      this.showAlert('Debe agregar al menos un insumo', false);
      return;
    }

    this.isSubmitting = true;

    if (this.isEditMode) {
      this.recipesService
        .updateRecipe(this.recipeId, this.recipeForm.value)
        .subscribe({
          next: (response) => {
            this.isSubmitting = false;
            if (response.success) {
              this.showAlert('Receta actualizada exitosamente', true);
              setTimeout(() => {
                this.router.navigate(['/recipes/details', this.recipeId]);
              }, 1500);
            } else {
              this.showAlert(
                'Error al actualizar la receta: ' + response.message,
                false
              );
            }
          },
          error: (err) => {
            this.isSubmitting = false;
            this.showAlert(
              'Error al actualizar la receta: ' + err.message,
              false
            );
          },
        });
    } else {
      this.recipesService.createRecipe(this.recipeForm.value).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          if (response.success) {
            this.showAlert('Receta creada exitosamente', true);
            setTimeout(() => {
              this.router.navigate(['/recipes/details', response.recipe.id]);
            }, 1500);
          } else {
            this.showAlert(
              'Error al crear la receta: ' + response.message,
              false
            );
          }
        },
        error: (err) => {
          this.isSubmitting = false;
          this.showAlert('Error al crear la receta: ' + err.message, false);
        },
      });
    }
  }

  cancelForm(): void {
    if (this.isEditMode) {
      this.router.navigate(['/recipes/details', this.recipeId]);
    } else {
      this.router.navigate(['/recipes/list']);
    }
  }

  // Obtener la unidad de medida del insumo seleccionado
  getSupplyUnit(supplyId: string): string {
    const supply = this.supplies.find((s) => s.id === supplyId);
    return supply ? supply.unit : '';
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        for (let i = 0; i < control.length; i++) {
          const arrayControl = control.at(i);
          if (arrayControl instanceof FormGroup) {
            this.markFormGroupTouched(arrayControl);
          } else {
            arrayControl.markAsTouched();
          }
        }
      }
    });
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
