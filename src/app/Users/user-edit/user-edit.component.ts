// user-edit.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UsersService } from 'src/app/_services/Users/users.service';
import { CityService } from 'src/app/_services/Cities/city.service';

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.css'],
})
export class UserEditComponent implements OnInit {
  userId: string = '';
  user: any = null;
  isLoading: boolean = true;
  isSubmitting: boolean = false;
  showPassword: boolean = false;

  userForm!: FormGroup;

  alertMessage: string = '';
  isSuccess: boolean = false;
  isClosing: boolean = false;
  cities: any[] = [];

  roleOptions = [
    { value: 'admin', label: 'Administrador' },
    { value: 'manager', label: 'Gerente' },
    { value: 'user', label: 'Usuario' },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private usersService: UsersService,
    private fb: FormBuilder,
    private cityService: CityService
  ) {}

  ngOnInit(): void {
    this.loadCities();
    // Inicializar el formulario
    this.userForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: [''],
      role: ['', [Validators.required]],
      city: [''],
      active: [true],
    });

    // Obtener el ID del usuario de la URL
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.userId = id;
        this.loadUserDetails();
      } else {
        this.router.navigate(['/users/list']);
      }
    });
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
  loadUserDetails(): void {
    this.isLoading = true;
    this.usersService.getUserById(this.userId).subscribe({
      next: (response) => {
        if (response.success) {
          this.user = response.user;
          // Rellenar el formulario con los datos del usuario
          this.userForm.patchValue({
            firstName: this.user.firstName,
            lastName: this.user.lastName,
            email: this.user.email,
            role: this.user.role,
            city: this.user.city || '',
            active: this.user.active,
          });
        } else {
          this.showAlert('Error al cargar los detalles del usuario', false);
          setTimeout(() => this.router.navigate(['/users/list']), 3000);
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.showAlert(
          'Error al cargar los detalles del usuario: ' + err.message,
          false
        );
        setTimeout(() => this.router.navigate(['/users/list']), 3000);
      },
    });
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.showAlert(
        'Por favor completa todos los campos requeridos correctamente',
        false
      );
      // Marcar todos los campos como tocados para mostrar errores
      Object.keys(this.userForm.controls).forEach((key) => {
        this.userForm.get(key)?.markAsTouched();
      });
      return;
    }

    // Si el campo de contraseña está vacío, eliminarlo para no actualizar la contraseña
    const userData = { ...this.userForm.value };
    if (!userData.password) {
      delete userData.password;
    }

    this.isSubmitting = true;
    this.usersService.updateUser(this.userId, userData).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        if (response.success) {
          this.showAlert('Usuario actualizado correctamente', true);
          // Redirigir a la página de detalles después de una actualización exitosa
          setTimeout(
            () => this.router.navigate(['/users/details', this.userId]),
            1500
          );
        } else {
          this.showAlert(
            'Error al actualizar el usuario: ' + response.message,
            false
          );
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        this.showAlert('Error al actualizar el usuario: ' + err.message, false);
      },
    });
  }

  goBack(): void {
    // Redirigir a la página de detalles sin guardar los cambios
    this.router.navigate(['/users/details', this.userId]);
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
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
