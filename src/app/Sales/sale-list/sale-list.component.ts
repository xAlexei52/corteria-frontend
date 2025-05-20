// sale-list.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { SalesService } from 'src/app/_services/Sales/sales.service';

@Component({
  selector: 'app-sale-list',
  templateUrl: './sale-list.component.html',
  styleUrls: ['./sale-list.component.css'],
})
export class SaleListComponent implements OnInit {
  sales: any[] = [];
  isLoading: boolean = false;
  totalItems: number = 0;
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 0;

  filterForm: FormGroup;
  alertMessage: string = '';
  isSuccess: boolean = false;
  isClosing: boolean = false;

  constructor(
    private salesService: SalesService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.filterForm = this.fb.group({
      status: [''],
      startDate: [''],
      endDate: [''],
      customerId: [''],
      city: [''],
    });
  }

  ngOnInit(): void {
    this.loadSales();
  }

  loadSales(): void {
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

    this.salesService.getSales(filters).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.sales = response.sales;
          this.totalItems = response.pagination.total;
          this.totalPages = response.pagination.totalPages;
          this.currentPage = response.pagination.currentPage;
          this.itemsPerPage = response.pagination.limit;
        } else {
          this.showAlert('Error al cargar las ventas', false);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.showAlert('Error al cargar las ventas: ' + err.message, false);
      },
    });
  }

  // Cambiar de página
  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadSales();
  }

  // Aplicar filtros
  applyFilters(): void {
    this.currentPage = 1; // Resetear a la primera página
    this.loadSales();
  }

  // Resetear filtros
  resetFilters(): void {
    this.filterForm.reset({
      status: '',
      startDate: '',
      endDate: '',
      customerId: '',
      city: '',
    });
    this.currentPage = 1;
    this.loadSales();
  }

  // Navegar a la página de detalle de la venta
  viewSaleDetails(id: string): void {
    this.router.navigate([`/sales/details/${id}`]);
  }

  // Navegar a la página de edición de la venta
  editSale(id: string): void {
    this.router.navigate([`/sales/edit/${id}`]);
  }

  // Navegar a la página de pago de la venta
  viewPayment(id: string): void {
    this.router.navigate([`/sales/payment/${id}`]);
  }

  // Crear nueva venta
  createNewSale(): void {
    this.router.navigate(['/sales/new']);
  }

  // Cancelar una venta
  cancelSale(id: string): void {
    if (confirm('¿Estás seguro de que deseas cancelar esta venta?')) {
      this.salesService.cancelSale(id).subscribe({
        next: (response) => {
          if (response.success) {
            this.showAlert('Venta cancelada correctamente', true);
            this.loadSales(); // Recargar la lista
          } else {
            this.showAlert('Error al cancelar la venta', false);
          }
        },
        error: (err) => {
          this.showAlert('Error al cancelar la venta: ' + err.message, false);
        },
      });
    }
  }

  // Formatear estado de venta
  formatSaleStatus(status: string): string {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'paid':
        return 'Pagada';
      case 'partially_paid':
        return 'Pago Parcial';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status;
    }
  }

  // Obtener clase de estado de venta
  getSaleStatusClass(status: string): string {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'partially_paid':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  // Convertir string a número
  parseFloat(value: string): number {
    return parseFloat(value) || 0;
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

  viewRomaneo(saleId: string): void {
    // Primero obtenemos los detalles de la venta para obtener la lista de detalles
    this.salesService.getSaleById(saleId).subscribe({
      next: (response) => {
        if (
          response.success &&
          response.sale.details &&
          response.sale.details.length > 0
        ) {
          // Usamos el ID del primer detalle de venta (se puede mejorar para elegir el detalle específico)
          const detailId = response.sale.details[0].id;
          this.router.navigate([`/sales/romaneo/${detailId}`]);
        } else {
          this.showAlert('No hay detalles disponibles para esta venta', false);
        }
      },
      error: (err) => {
        this.showAlert(
          'Error al obtener detalles de la venta: ' + err.message,
          false
        );
      },
    });
  }
}
