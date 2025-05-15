// customer-form.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomersService } from 'src/app/_services/Customers/customers.service';
import { CityService } from 'src/app/_services/Cities/city.service';

@Component({
  selector: 'app-customer-form',
  templateUrl: './customer-form.component.html',
  styleUrls: ['./customer-form.component.css'],
})
export class CustomerFormComponent implements OnInit {
  customerId: string = '';
  customerForm: FormGroup;
  isEditMode: boolean = false;
  isLoading: boolean = false;
  alertMessage: string = '';
  isSuccess: boolean = false;
  isClosing: boolean = false;
  cities: any[] = [];
  constructor(
    private fb: FormBuilder,
    private customersService: CustomersService,
    private route: ActivatedRoute,
    private router: Router,
    private cityService: CityService
  ) {
    this.customerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.email]],
      phone: [''],
      address: [''],
      cityId: [''],
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.customerId = params['id'];
      if (this.customerId) {
        this.isEditMode = true;
        this.loadCustomerData();
      }
    });
    this.loadCities();
  }

  loadCities(): void {
    this.cityService.getCities().subscribe({
      next: (response) => {
        if (response.success) {
          this.cities = response.cities;
        } else {
          this.showAlert('Error al cargar las ciudades', false);
        }
      },
      error: (err) => {
        this.showAlert('Error al cargar las ciudades: ' + err.message, false);
      },
    });
  }

  loadCustomerData(): void {
    this.isLoading = true;
    this.customersService.getCustomerById(this.customerId).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          const customer = response.customer;
          this.customerForm.patchValue({
            firstName: customer.firstName,
            lastName: customer.lastName,
            email: customer.email,
            phone: customer.phone,
            address: customer.address,
            cityId: customer.cityId,
          });
        } else {
          this.showAlert('Error al cargar los datos del cliente', false);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.showAlert('Error al cargar los datos: ' + err.message, false);
      },
    });
  }

  onSubmit(): void {
    if (this.customerForm.invalid) {
      this.markFormGroupTouched(this.customerForm);
      return;
    }

    this.isLoading = true;
    const formData = this.customerForm.value;

    if (this.isEditMode) {
      this.customersService
        .updateCustomer(this.customerId, formData)
        .subscribe({
          next: (response) => {
            this.isLoading = false;
            if (response.success) {
              this.showAlert('Cliente actualizado correctamente', true);
              setTimeout(() => {
                this.router.navigate(['/clients/details', this.customerId]);
              }, 2000);
            } else {
              this.showAlert('Error al actualizar el cliente', false);
            }
          },
          error: (err) => {
            this.isLoading = false;
            this.showAlert(
              'Error al actualizar el cliente: ' + err.message,
              false
            );
          },
        });
    } else {
      this.customersService.createCustomer(formData).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.showAlert('Cliente creado correctamente', true);
            setTimeout(() => {
              this.router.navigate(['/clients/list']);
            }, 2000);
          } else {
            this.showAlert('Error al crear el cliente', false);
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.showAlert('Error al crear el cliente: ' + err.message, false);
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
    const control = this.customerForm.get(fieldName);
    return control
      ? control.invalid && (control.dirty || control.touched)
      : false;
  }

  // Obtener mensaje de error para un campo
  getErrorMessage(fieldName: string): string {
    const control = this.customerForm.get(fieldName);

    if (!control) return '';

    if (control.hasError('required')) {
      return 'Este campo es obligatorio';
    }

    if (control.hasError('minlength')) {
      return `Debe tener al menos ${control.errors?.['minlength'].requiredLength} caracteres`;
    }

    if (control.hasError('email')) {
      return 'Formato de email inválido';
    }

    return 'Campo inválido';
  }

  // Cancelar y volver a la lista
  cancel(): void {
    if (this.isEditMode) {
      this.router.navigate(['/clients/details', this.customerId]);
    } else {
      this.router.navigate(['/clients/list']);
    }
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
