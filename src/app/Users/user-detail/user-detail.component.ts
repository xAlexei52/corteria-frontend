// user-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UsersService } from 'src/app/_services/Users/users.service';

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.css'],
})
export class UserDetailComponent implements OnInit {
  userId: string = '';
  user: any = null;
  isLoading: boolean = true;
  isUpdating: boolean = false;

  permissionsForm!: FormGroup;

  alertMessage: string = '';
  isSuccess: boolean = false;
  isClosing: boolean = false;

  roleOptions = [
    { value: 'admin', label: 'Administrador' },
    { value: 'manager', label: 'Gerente' },
    { value: 'user', label: 'Usuario' },
  ];

  cityOptions = [
    { value: 'Guadalajara', label: 'Guadalajara' },
    { value: 'Ciudad de México', label: 'Ciudad de México' },
    { value: 'Monterrey', label: 'Monterrey' },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private usersService: UsersService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.permissionsForm = this.fb.group({
      role: ['', Validators.required],
      city: [''],
    });

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

  loadUserDetails(): void {
    this.isLoading = true;
    this.usersService.getUserById(this.userId).subscribe({
      next: (response) => {
        if (response.success) {
          this.user = response.user;
          this.permissionsForm.patchValue({
            role: this.user.role,
            city: this.user.city || '',
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

  updatePermissions(): void {
    if (this.permissionsForm.invalid) {
      this.showAlert('Por favor completa todos los campos requeridos', false);
      return;
    }

    this.isUpdating = true;
    const permissions = this.permissionsForm.value;

    this.usersService
      .updateUserPermissions(this.userId, permissions)
      .subscribe({
        next: (response) => {
          this.isUpdating = false;
          if (response.success) {
            this.showAlert('Permisos actualizados correctamente', true);
            this.loadUserDetails(); // Recargar los datos
          } else {
            this.showAlert(
              'Error al actualizar los permisos del usuario',
              false
            );
          }
        },
        error: (err) => {
          this.isUpdating = false;
          this.showAlert(
            'Error al actualizar los permisos: ' + err.message,
            false
          );
        },
      });
  }

  toggleUserActive(): void {
    const newStatus = !this.user.active;
    const action = newStatus ? 'activar' : 'desactivar';

    if (confirm(`¿Estás seguro de que deseas ${action} este usuario?`)) {
      this.isUpdating = true;

      this.usersService.toggleUserActive(this.userId, newStatus).subscribe({
        next: (response) => {
          this.isUpdating = false;
          if (response.success) {
            this.showAlert(`Usuario ${action}do correctamente`, true);
            this.user.active = newStatus; // Actualizar el estado localmente
          } else {
            this.showAlert(`Error al ${action} el usuario`, false);
          }
        },
        error: (err) => {
          this.isUpdating = false;
          this.showAlert(
            `Error al ${action} el usuario: ${err.message}`,
            false
          );
        },
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/users/list']);
  }

  editUser(): void {
    this.router.navigate(['/users/edit', this.userId]);
  }

  formatRole(role: string): string {
    const roleOption = this.roleOptions.find((r) => r.value === role);
    return roleOption ? roleOption.label : role;
  }

  formatDate(date: string): string {
    if (!date) return 'No disponible';
    return new Date(date).toLocaleString();
  }

  getFullName(): string {
    if (!this.user) return '';
    return `${this.user.firstName} ${this.user.lastName}`;
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
