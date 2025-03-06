// user-list.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { UsersService } from 'src/app/_services/Users/users.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css'],
})
export class UserListComponent implements OnInit {
  users: any[] = [];
  isLoading: boolean = false;
  totalItems: number = 0;
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 0;

  filterForm!: FormGroup;
  alertMessage: string = '';
  isSuccess: boolean = false;
  isClosing: boolean = false;

  roleOptions = [
    { value: '', label: 'Todos' },
    { value: 'admin', label: 'Administrador' },
    { value: 'manager', label: 'Gerente' },
    { value: 'user', label: 'Usuario' },
  ];

  cities = [
    { value: '', label: 'Todas' },
    { value: 'Guadalajara', label: 'Guadalajara' },
    { value: 'Ciudad de México', label: 'Ciudad de México' },
    { value: 'Monterrey', label: 'Monterrey' },
  ];

  constructor(
    private usersService: UsersService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.filterForm = this.fb.group({
      search: [''],
      city: [''],
      role: [''],
      active: [''],
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;

    const filters = {
      page: this.currentPage,
      limit: this.itemsPerPage,
      ...this.filterForm.value,
    };

    // Eliminar propiedades vacías
    Object.keys(filters).forEach((key) => {
      if (filters[key] === '' || filters[key] === null) {
        delete filters[key];
      }
    });

    this.usersService.getUsers(filters).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.users = response.users;
          this.totalItems = response.pagination.total;
          this.totalPages = response.pagination.totalPages;
          this.currentPage = response.pagination.currentPage;
          this.itemsPerPage = response.pagination.limit;
        } else {
          this.showAlert('Error al cargar los usuarios', false);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.showAlert('Error al cargar los usuarios: ' + err.message, false);
      },
    });
  }

  // Cambiar de página
  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadUsers();
  }

  // Aplicar filtros
  applyFilters(): void {
    this.currentPage = 1; // Resetear a la primera página
    this.loadUsers();
  }

  // Resetear filtros
  resetFilters(): void {
    this.filterForm.reset({
      search: '',
      city: '',
      role: '',
      active: '',
    });
    this.currentPage = 1;
    this.loadUsers();
  }

  // Navegar a la página de detalle del usuario
  viewUserDetails(id: string): void {
    this.router.navigate([`/users/details/${id}`]);
  }

  // Activar/desactivar usuario directamente desde la lista
  toggleUserActive(id: string, currentActive: boolean): void {
    const action = currentActive ? 'desactivar' : 'activar';
    if (confirm(`¿Estás seguro de que deseas ${action} este usuario?`)) {
      this.usersService.toggleUserActive(id, !currentActive).subscribe({
        next: (response) => {
          if (response.success) {
            this.showAlert(`Usuario ${action}do correctamente`, true);
            this.loadUsers(); // Recargar la lista
          } else {
            this.showAlert(`Error al ${action} el usuario`, false);
          }
        },
        error: (err) => {
          this.showAlert(
            `Error al ${action} el usuario: ${err.message}`,
            false
          );
        },
      });
    }
  }

  // Formatear rol
  formatRole(role: string): string {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'manager':
        return 'Gerente';
      case 'user':
        return 'Usuario';
      default:
        return role;
    }
  }

  // Obtener clase para el estado
  getStatusClass(active: boolean): string {
    return active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
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
