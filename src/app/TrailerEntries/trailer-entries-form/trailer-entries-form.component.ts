import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TrailerEntriesService } from 'src/app/_services/TrailerEntry/trailer-entries.service';
import { ProductsService } from 'src/app/_services/Products/products.service';
import { WarehousesService } from 'src/app/_services/Warehouses/warehouses.service';

@Component({
  selector: 'app-trailer-entries-form',
  templateUrl: './trailer-entries-form.component.html',
  styleUrls: ['./trailer-entries-form.component.css'],
})
export class TrailerEntriesFormComponent implements OnInit {
  entryForm: FormGroup;
  isEditMode: boolean = false;
  entryId: string = '';
  isLoading: boolean = false;
  alertMessage: string = '';
  isSuccess: boolean = false;
  isClosing: boolean = false;
  products: any[] = [];
  warehouses: any[] = [];

  constructor(
    private fb: FormBuilder,
    private trailerEntriesService: TrailerEntriesService,
    private productsService: ProductsService,
    private warehousesService: WarehousesService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.entryForm = this.fb.group({
      date: [new Date().toISOString().slice(0, 16), Validators.required],
      productId: ['', Validators.required],
      supplier: ['', Validators.required],
      boxes: ['', [Validators.required, Validators.min(1)]],
      kilos: ['', [Validators.required, Validators.min(0.1)]],
      reference: ['', Validators.required],
      city: ['', Validators.required],
      // Nuevos campos
      needsProcessing: [true, Validators.required],
      entryCost: [''],
      targetWarehouseId: [''],
    });
  }

  ngOnInit(): void {
    this.loadProducts();
    this.loadWarehouses();

    // Verificar si estamos en modo edición
    this.route.params.subscribe((params) => {
      this.entryId = params['id'];
      if (this.entryId) {
        this.isEditMode = true;
        this.loadEntryData(this.entryId);
      }
    });

    // Escuchar cambios en el campo needsProcessing para validar targetWarehouseId
    this.entryForm.get('needsProcessing')?.valueChanges.subscribe((value) => {
      const targetWarehouseIdControl = this.entryForm.get('targetWarehouseId');
      if (!value) {
        // Si no necesita procesamiento, targetWarehouseId es requerido
        targetWarehouseIdControl?.setValidators([Validators.required]);
      } else {
        // Si necesita procesamiento, targetWarehouseId no es requerido
        targetWarehouseIdControl?.clearValidators();
      }
      targetWarehouseIdControl?.updateValueAndValidity();
    });
  }

  loadProducts(): void {
    // Cargar solo productos activos
    this.productsService.getProducts({ active: true }).subscribe({
      next: (response) => {
        if (response.success) {
          // Ajustar a la estructura real de la respuesta
          this.products = response.products;
        } else {
          this.showAlert('Error al cargar productos', false);
        }
      },
      error: (err) => {
        this.showAlert('Error al cargar productos: ' + err.message, false);
      },
    });
  }

  loadWarehouses(): void {
    // Cargar almacenes activos
    this.warehousesService.getWarehouses({ active: true }).subscribe({
      next: (response) => {
        if (response.success) {
          this.warehouses = response.warehouses;
        } else {
          this.showAlert('Error al cargar almacenes', false);
        }
      },
      error: (err) => {
        this.showAlert('Error al cargar almacenes: ' + err.message, false);
      },
    });
  }

  loadEntryData(id: string): void {
    this.isLoading = true;
    this.trailerEntriesService.getTrailerEntryById(id).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          // Formatear la fecha para el input datetime-local
          const date = new Date(response.entry.date);
          const formattedDate = date.toISOString().slice(0, 16);

          this.entryForm.patchValue({
            date: formattedDate,
            productId: response.entry.productId,
            supplier: response.entry.supplier,
            boxes: response.entry.boxes,
            kilos: response.entry.kilos,
            reference: response.entry.reference,
            city: response.entry.city,
            // Nuevos campos
            needsProcessing: response.entry.needsProcessing,
            entryCost: response.entry.entryCost,
            targetWarehouseId: response.entry.targetWarehouseId,
          });
        } else {
          this.showAlert('Error al cargar los datos de la entrada', false);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.showAlert('Error al cargar los datos: ' + err.message, false);
      },
    });
  }

  onSubmit(): void {
    if (this.entryForm.invalid) {
      this.markFormGroupTouched(this.entryForm);
      return;
    }

    this.isLoading = true;
    // Crear una copia de los valores del formulario
    const formData = { ...this.entryForm.value };

    // Si needsProcessing es true, no debemos enviar targetWarehouseId
    if (formData.needsProcessing === true) {
      delete formData.targetWarehouseId;
    }

    if (this.isEditMode) {
      this.trailerEntriesService
        .updateTrailerEntry(this.entryId, formData)
        .subscribe({
          next: (response) => {
            this.isLoading = false;
            if (response.success) {
              this.showAlert('Entrada actualizada correctamente', true);
              setTimeout(() => {
                this.router.navigate(['/trailer-entries']);
              }, 2000);
            } else {
              this.showAlert('Error al actualizar la entrada', false);
            }
          },
          error: (err) => {
            this.isLoading = false;
            this.showAlert(
              'Error al actualizar la entrada: ' + err.message,
              false
            );
          },
        });
    } else {
      this.trailerEntriesService.createTrailerEntry(formData).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.showAlert('Entrada creada correctamente', true);
            setTimeout(() => {
              this.router.navigate(['/trailer-entries']);
            }, 2000);
          } else {
            this.showAlert('Error al crear la entrada', false);
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.showAlert('Error al crear la entrada: ' + err.message, false);
        },
      });
    }
  }

  // Función para marcar todos los campos del formulario como tocados
  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // Comprobar si un campo es inválido
  isFieldInvalid(fieldName: string): boolean {
    const control = this.entryForm.get(fieldName);
    return control
      ? control.invalid && (control.dirty || control.touched)
      : false;
  }

  // Obtener mensaje de error para un campo
  getErrorMessage(fieldName: string): string {
    const control = this.entryForm.get(fieldName);

    if (!control) return '';

    if (control.hasError('required')) {
      return 'Este campo es obligatorio';
    }

    if (control.hasError('min')) {
      return `El valor debe ser mayor que ${control.errors?.['min'].min}`;
    }

    return 'Campo inválido';
  }

  // Cancelar y volver a la lista
  cancel(): void {
    this.router.navigate(['/trailer-entries']);
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
