// product-form.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductsService } from 'src/app/_services/Products/products.service';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.css'],
})
export class ProductFormComponent implements OnInit {
  productForm!: FormGroup;
  isLoading: boolean = false;
  isSubmitting: boolean = false;
  isEditMode: boolean = false;
  productId: string = '';

  alertMessage: string = '';
  isSuccess: boolean = false;
  isClosing: boolean = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private productsService: ProductsService
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.productId = params['id'];
        this.isEditMode = true;
        this.loadProductData();
      }
    });
  }

  // Modificación de src/app/Proeducts/product-form/product-form.component.ts
  createForm(): void {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      pricePerKilo: ['', [Validators.required, Validators.min(0.01)]],
      costPerKilo: ['', [Validators.min(0.01)]], // Nuevo campo
    });
  }

  loadProductData(): void {
    this.isLoading = true;
    this.productsService.getProductById(this.productId).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.productForm.patchValue({
            name: response.product.name,
            description: response.product.description,
            pricePerKilo: response.product.pricePerKilo,
            costPerKilo: response.product.costPerKilo, // Agregar campo nuevo
          });
        } else {
          this.showAlert('Error al cargar los datos del producto', false);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.showAlert('Error al cargar los datos: ' + err.message, false);
      },
    });
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.markFormGroupTouched(this.productForm);
      this.showAlert('Por favor, completa todos los campos requeridos', false);
      return;
    }

    this.isSubmitting = true;

    if (this.isEditMode) {
      this.productsService
        .updateProduct(this.productId, this.productForm.value)
        .subscribe({
          next: (response) => {
            this.isSubmitting = false;
            if (response.success) {
              this.showAlert('Producto actualizado exitosamente', true);
              setTimeout(() => {
                this.router.navigate(['/products/list']);
              }, 1500);
            } else {
              this.showAlert(
                'Error al actualizar el producto: ' + response.message,
                false
              );
            }
          },
          error: (err) => {
            this.isSubmitting = false;
            this.showAlert(
              'Error al actualizar el producto: ' + err.message,
              false
            );
          },
        });
    } else {
      this.productsService.createProduct(this.productForm.value).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          if (response.success) {
            this.showAlert('Producto creado exitosamente', true);
            setTimeout(() => {
              this.router.navigate(['/products/list']);
            }, 1500);
          } else {
            this.showAlert(
              'Error al crear el producto: ' + response.message,
              false
            );
          }
        },
        error: (err) => {
          this.isSubmitting = false;
          this.showAlert('Error al crear el producto: ' + err.message, false);
        },
      });
    }
  }

  cancelForm(): void {
    this.router.navigate(['/products/list']);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
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
