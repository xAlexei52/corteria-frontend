// manufacturing-order-form.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ManufacturingOrdersService } from 'src/app/_services/ManufacturingOrders/manufacturing-orders.service';
import { TrailerEntriesService } from 'src/app/_services/TrailerEntry/trailer-entries.service';
import { WarehousesService } from 'src/app/_services/Warehouses/warehouses.service';

@Component({
  selector: 'app-manufacturing-order-form',
  templateUrl: './manufacturing-order-form.component.html',
  styleUrls: ['./manufacturing-order-form.component.css'],
})
export class ManufacturingOrderFormComponent implements OnInit {
  orderForm: FormGroup;
  trailerEntryId: string = '';
  trailerEntry: any = null;
  warehouses: any[] = [];
  isLoading: boolean = false;
  alertMessage: string = '';
  isSuccess: boolean = false;
  isClosing: boolean = false;

  constructor(
    private fb: FormBuilder,
    private manufacturingOrdersService: ManufacturingOrdersService,
    private trailerEntriesService: TrailerEntriesService,
    private warehousesService: WarehousesService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.orderForm = this.fb.group({
      trailerEntryId: ['', Validators.required],
      productId: ['', Validators.required],
      kilosToProcess: ['', [Validators.required, Validators.min(0.1)]],
      boxesEstimated: ['', [Validators.required, Validators.min(1)]],
      notes: [''],
      destinationWarehouseId: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    // Obtener el ID de la entrada de trailer desde la ruta
    this.route.params.subscribe((params) => {
      this.trailerEntryId = params['trailerEntryId'];
      if (this.trailerEntryId) {
        this.loadTrailerEntry();
        this.loadWarehouses();
      } else {
        this.router.navigate(['/trailer-entries']);
      }
    });
  }

  loadTrailerEntry(): void {
    this.isLoading = true;
    this.trailerEntriesService
      .getTrailerEntryById(this.trailerEntryId)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.trailerEntry = response.entry;

            // Pre-llenar el formulario con los datos de la entrada
            this.orderForm.patchValue({
              trailerEntryId: this.trailerEntryId,
              productId: this.trailerEntry.productId,
              kilosToProcess: this.trailerEntry.kilos,
              boxesEstimated: this.trailerEntry.boxes,
            });

            this.isLoading = false;
          } else {
            this.showAlert('Error al cargar los datos de la entrada', false);
            this.isLoading = false;
          }
        },
        error: (err) => {
          this.showAlert('Error al cargar los datos: ' + err.message, false);
          this.isLoading = false;
        },
      });
  }

  loadWarehouses(): void {
    // Cargar los almacenes activos de la misma ciudad que la entrada
    this.warehousesService
      .getWarehouses({
        active: true,
        city: this.trailerEntry?.city || '',
      })
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.warehouses = response.warehouses;

            // Si solo hay un almacén, seleccionarlo por defecto
            if (this.warehouses.length === 1) {
              this.orderForm.patchValue({
                destinationWarehouseId: this.warehouses[0].id,
              });
            }
          } else {
            this.showAlert('Error al cargar los almacenes', false);
          }
        },
        error: (err) => {
          this.showAlert(
            'Error al cargar los almacenes: ' + err.message,
            false
          );
        },
      });
  }

  onSubmit(): void {
    if (this.orderForm.invalid) {
      this.markFormGroupTouched(this.orderForm);
      return;
    }

    this.isLoading = true;
    const formData = this.orderForm.value;

    this.manufacturingOrdersService
      .createManufacturingOrder(formData)
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.showAlert('Orden de fabricación creada correctamente', true);
            setTimeout(() => {
              this.router.navigate([
                '/manufacturing-orders/details',
                response.order.id,
              ]);
            }, 2000);
          } else {
            this.showAlert('Error al crear la orden de fabricación', false);
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.showAlert('Error al crear la orden: ' + err.message, false);
        },
      });
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
    const control = this.orderForm.get(fieldName);
    return control
      ? control.invalid && (control.dirty || control.touched)
      : false;
  }

  // Obtener mensaje de error para un campo
  getErrorMessage(fieldName: string): string {
    const control = this.orderForm.get(fieldName);

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
    this.router.navigate(['/trailer-entries/details', this.trailerEntryId]);
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
