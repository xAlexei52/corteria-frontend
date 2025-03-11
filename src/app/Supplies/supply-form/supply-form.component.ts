// supply-form.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SuppliesService } from 'src/app/_services/Supplies/supplies.service';

@Component({
  selector: 'app-supply-form',
  templateUrl: './supply-form.component.html',
  styleUrls: ['./supply-form.component.css'],
})
export class SupplyFormComponent implements OnInit {
  supplyForm!: FormGroup;
  isLoading: boolean = false;
  isSubmitting: boolean = false;
  isEditMode: boolean = false;
  supplyId: string = '';

  alertMessage: string = '';
  isSuccess: boolean = false;
  isClosing: boolean = false;

  // Opciones de unidades comunes para insumos
  unitOptions: string[] = [
    'kg',
    'g',
    'l',
    'ml',
    'unidad',
    'paquete',
    'caja',
    'pieza',
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private suppliesService: SuppliesService
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.supplyId = params['id'];
        this.isEditMode = true;
        this.loadSupplyData();
      }
    });
  }

  createForm(): void {
    this.supplyForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      unit: ['kg', Validators.required],
      costPerUnit: ['', [Validators.required, Validators.min(0.01)]],
      active: [true],
    });
  }

  loadSupplyData(): void {
    this.isLoading = true;
    this.suppliesService.getSupplyById(this.supplyId).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.supplyForm.patchValue({
            name: response.supply.name,
            description: response.supply.description,
            unit: response.supply.unit,
            costPerUnit: response.supply.costPerUnit,
            active: response.supply.active,
          });
        } else {
          this.showAlert('Error al cargar los datos del insumo', false);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.showAlert('Error al cargar los datos: ' + err.message, false);
      },
    });
  }

  onSubmit(): void {
    if (this.supplyForm.invalid) {
      this.markFormGroupTouched(this.supplyForm);
      this.showAlert('Por favor, completa todos los campos requeridos', false);
      return;
    }

    this.isSubmitting = true;

    if (this.isEditMode) {
      this.suppliesService
        .updateSupply(this.supplyId, this.supplyForm.value)
        .subscribe({
          next: (response) => {
            this.isSubmitting = false;
            if (response.success) {
              this.showAlert('Insumo actualizado exitosamente', true);
              setTimeout(() => {
                this.router.navigate(['/supplies/details', this.supplyId]);
              }, 1500);
            } else {
              this.showAlert(
                'Error al actualizar el insumo: ' + response.message,
                false
              );
            }
          },
          error: (err) => {
            this.isSubmitting = false;
            this.showAlert(
              'Error al actualizar el insumo: ' + err.message,
              false
            );
          },
        });
    } else {
      this.suppliesService.createSupply(this.supplyForm.value).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          if (response.success) {
            this.showAlert('Insumo creado exitosamente', true);
            setTimeout(() => {
              this.router.navigate(['/supplies/details', response.supply.id]);
            }, 1500);
          } else {
            this.showAlert(
              'Error al crear el insumo: ' + response.message,
              false
            );
          }
        },
        error: (err) => {
          this.isSubmitting = false;
          this.showAlert('Error al crear el insumo: ' + err.message, false);
        },
      });
    }
  }

  cancelForm(): void {
    if (this.isEditMode) {
      this.router.navigate(['/supplies/details', this.supplyId]);
    } else {
      this.router.navigate(['/supplies/list']);
    }
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
