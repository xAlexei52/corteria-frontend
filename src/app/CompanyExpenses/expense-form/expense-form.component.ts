// src/app/CompanyExpenses/expense-form/expense-form.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CompanyExpensesService } from 'src/app/_services/CompanyExpenses/company-expenses.service';
import { CityService } from 'src/app/_services/Cities/city.service';
import { AuthService } from 'src/app/_services/AuthService/authservice.service';

@Component({
  selector: 'app-expense-form',
  templateUrl: './expense-form.component.html',
  styleUrls: ['./expense-form.component.css'],
})
export class ExpenseFormComponent implements OnInit {
  expenseId: string = '';
  expenseForm: FormGroup;
  isEditMode: boolean = false;
  isLoading: boolean = false;
  alertMessage: string = '';
  isSuccess: boolean = false;
  isClosing: boolean = false;
  cities: any[] = [];
  selectedFile: File | null = null;
  currentFileName: string = '';

  // Categorías disponibles
  categories = [
    { value: 'utilities', label: 'Servicios Públicos' },
    { value: 'rent', label: 'Alquiler' },
    { value: 'salaries', label: 'Salarios' },
    { value: 'supplies', label: 'Suministros' },
    { value: 'maintenance', label: 'Mantenimiento' },
    { value: 'taxes', label: 'Impuestos' },
    { value: 'insurance', label: 'Seguros' },
    { value: 'advertising', label: 'Publicidad' },
    { value: 'travel', label: 'Viajes' },
    { value: 'other', label: 'Otros' },
  ];

  constructor(
    private fb: FormBuilder,
    private companyExpensesService: CompanyExpensesService,
    private cityService: CityService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.expenseForm = this.fb.group({
      date: [new Date().toISOString().split('T')[0], [Validators.required]],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      referenceNumber: [''],
      category: ['other', [Validators.required]],
      isBillable: [true], // NUEVO CAMPO AGREGADO - Por defecto facturable
      notes: [''],
      cityId: [''],
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.expenseId = params['id'];
      if (this.expenseId) {
        this.isEditMode = true;
        this.loadExpenseData();
      }
    });

    this.loadCities();
    this.setDefaultCity();
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

  setDefaultCity(): void {
    // Si no es admin, establecer la ciudad del usuario
    if (!this.authService.isAdmin()) {
      const userCity = this.authService.getUserCity();
      if (userCity) {
        this.expenseForm.patchValue({ cityId: userCity });
      }
    }
  }

  loadExpenseData(): void {
    this.isLoading = true;
    this.companyExpensesService.getExpenseById(this.expenseId).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          const expense = response.expense;
          this.expenseForm.patchValue({
            date: expense.date.split('T')[0], // Formato YYYY-MM-DD para input date
            amount: expense.amount,
            referenceNumber: expense.referenceNumber,
            category: expense.category,
            isBillable: expense.isBillable, // NUEVO CAMPO
            notes: expense.notes,
            cityId: expense.cityId,
          });

          // Guardar nombre del archivo actual si existe
          if (expense.fileName) {
            this.currentFileName = expense.fileName;
          }
        } else {
          this.showAlert('Error al cargar los datos del gasto', false);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.showAlert('Error al cargar los datos: ' + err.message, false);
      },
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.selectedFile = input.files[0];

      // Validar tipo de archivo
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];

      if (!allowedTypes.includes(this.selectedFile.type)) {
        this.showAlert(
          'Tipo de archivo no permitido. Solo se aceptan PDF, imágenes y documentos de Word.',
          false
        );
        this.selectedFile = null;
        input.value = '';
        return;
      }

      // Validar tamaño (10MB máximo)
      if (this.selectedFile.size > 10 * 1024 * 1024) {
        this.showAlert(
          'El archivo es demasiado grande. Tamaño máximo: 10MB',
          false
        );
        this.selectedFile = null;
        input.value = '';
        return;
      }
    }
  }

  onSubmit(): void {
    if (this.expenseForm.invalid) {
      this.markFormGroupTouched(this.expenseForm);
      return;
    }

    this.isLoading = true;

    // Crear FormData para enviar datos y archivo
    const formData = new FormData();
    const formValues = this.expenseForm.value;

    // Agregar campos del formulario
    Object.keys(formValues).forEach((key) => {
      if (formValues[key] !== null && formValues[key] !== '') {
        formData.append(key, formValues[key]);
      }
    });

    // Agregar archivo si se seleccionó
    if (this.selectedFile) {
      formData.append('file', this.selectedFile);
    }

    if (this.isEditMode) {
      this.companyExpensesService
        .updateExpense(this.expenseId, formData)
        .subscribe({
          next: (response) => {
            this.isLoading = false;
            if (response.success) {
              this.showAlert('Gasto actualizado correctamente', true);
              setTimeout(() => {
                this.router.navigate([
                  '/company-expenses/details',
                  this.expenseId,
                ]);
              }, 2000);
            } else {
              this.showAlert('Error al actualizar el gasto', false);
            }
          },
          error: (err) => {
            this.isLoading = false;
            this.showAlert(
              'Error al actualizar el gasto: ' + err.message,
              false
            );
          },
        });
    } else {
      this.companyExpensesService.createExpense(formData).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.showAlert('Gasto registrado correctamente', true);
            setTimeout(() => {
              this.router.navigate(['/company-expenses/list']);
            }, 2000);
          } else {
            this.showAlert('Error al registrar el gasto', false);
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.showAlert('Error al registrar el gasto: ' + err.message, false);
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
    const control = this.expenseForm.get(fieldName);
    return control
      ? control.invalid && (control.dirty || control.touched)
      : false;
  }

  // Obtener mensaje de error para un campo
  getErrorMessage(fieldName: string): string {
    const control = this.expenseForm.get(fieldName);

    if (!control) return '';

    if (control.hasError('required')) {
      return 'Este campo es obligatorio';
    }

    if (control.hasError('min')) {
      return 'El monto debe ser mayor a 0';
    }

    return 'Campo inválido';
  }

  // Cancelar y volver a la lista
  cancel(): void {
    if (this.isEditMode) {
      this.router.navigate(['/company-expenses/details', this.expenseId]);
    } else {
      this.router.navigate(['/company-expenses/list']);
    }
  }

  // Verificar si el usuario puede seleccionar ciudad
  canSelectCity(): boolean {
    return this.authService.isAdmin();
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
