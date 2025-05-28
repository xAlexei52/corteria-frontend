// manufacturing-orders-list.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ManufacturingOrdersService } from 'src/app/_services/ManufacturingOrders/manufacturing-orders.service';
import { CityService } from 'src/app/_services/Cities/city.service';

@Component({
  selector: 'app-manufacturing-orders-list',
  templateUrl: './manufacturing-orders-list.component.html',
  styleUrls: ['./manufacturing-orders-list.component.css'],
})
export class ManufacturingOrdersListComponent implements OnInit {
  orders: any[] = [];
  isLoading: boolean = false;
  totalItems: number = 0;
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 0;

  filterForm: FormGroup;
  alertMessage: string = '';
  isSuccess: boolean = false;
  isClosing: boolean = false;

  cities: any[] = [];

  // Opciones para el filtro de estado
  statusOptions = [
    { value: '', label: 'Todos los estados' },
    { value: 'pending', label: 'Pendientes' },
    { value: 'in_progress', label: 'En proceso' },
    { value: 'completed', label: 'Completadas' },
  ];

  // Para modal de confirmación de eliminación
  showDeleteModal: boolean = false;
  orderToDelete: any = null;

  constructor(
    private manufacturingOrdersService: ManufacturingOrdersService,
    private fb: FormBuilder,
    private router: Router,
    private cityService: CityService
  ) {
    this.filterForm = this.fb.group({
      startDate: [''],
      endDate: [''],
      cityId: [''],
      status: [''],
      productId: [''],
    });
  }

  ngOnInit(): void {
    this.loadOrders();
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
    });
  }

  loadOrders(): void {
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

    this.manufacturingOrdersService.getManufacturingOrders(filters).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.orders = response.orders;
          this.totalItems = response.pagination.total;
          this.totalPages = response.pagination.totalPages;
          this.currentPage = response.pagination.currentPage;
          this.itemsPerPage = response.pagination.limit;
        } else {
          this.showAlert('Error al cargar las órdenes', false);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.showAlert('Error al cargar las órdenes: ' + err.message, false);
      },
    });
  }

  // Cambiar de página
  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadOrders();
  }

  // Aplicar filtros
  applyFilters(): void {
    this.currentPage = 1; // Resetear a la primera página
    this.loadOrders();
  }

  // Resetear filtros
  resetFilters(): void {
    this.filterForm.reset({
      startDate: '',
      endDate: '',
      cityId: '',
      status: '',
      productId: '',
    });
    this.currentPage = 1;
    this.loadOrders();
  }

  // Navegar a ver detalles de una orden
  viewOrderDetails(id: string): void {
    this.router.navigate([`/manufacturing-orders/details/${id}`]);
  }

  // Abrir modal para confirmar eliminación
  confirmDelete(order: any): void {
    this.orderToDelete = order;
    this.showDeleteModal = true;
  }

  // Cancelar eliminación
  cancelDelete(): void {
    this.showDeleteModal = false;
    this.orderToDelete = null;
  }

  // Eliminar orden
  deleteOrder(): void {
    if (!this.orderToDelete) return;

    this.isLoading = true;
    this.manufacturingOrdersService
      .deleteManufacturingOrder(this.orderToDelete.id)
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.showAlert('Orden eliminada correctamente', true);
            this.loadOrders(); // Recargar la lista
          } else {
            this.showAlert('Error al eliminar la orden', false);
          }
          this.showDeleteModal = false;
          this.orderToDelete = null;
        },
        error: (err) => {
          this.isLoading = false;
          this.showAlert('Error al eliminar la orden: ' + err.message, false);
          this.showDeleteModal = false;
          this.orderToDelete = null;
        },
      });
  }

  // Obtener clase de estado
  getStatusClass(status: string): string {
    switch (status) {
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  // Formatear estado para mostrar
  formatStatus(status: string): string {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'in_progress':
        return 'En proceso';
      case 'completed':
        return 'Completada';
      default:
        return status;
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
