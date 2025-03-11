// customer-financial-summary.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomersService } from 'src/app/_services/Customers/customers.service';

@Component({
  selector: 'app-customer-financial-summary',
  templateUrl: './customer-financial-summary.component.html',
  styleUrls: ['./customer-financial-summary.component.css'],
})
export class CustomerFinancialSummaryComponent implements OnInit {
  customerId: string = '';
  customer: any = null;
  financialSummary: any = null;
  customerSales: any[] = [];
  isLoading: boolean = false;
  isLoadingSales: boolean = false;
  alertMessage: string = '';
  isSuccess: boolean = false;
  isClosing: boolean = false;

  // Paginación
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;
  totalPages: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private customersService: CustomersService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.customerId = params['id'];
      if (this.customerId) {
        this.loadFinancialSummary();
        this.loadCustomerSales();
      } else {
        this.router.navigate(['/clients/list']);
      }
    });
  }

  loadFinancialSummary(): void {
    this.isLoading = true;
    this.customersService
      .getCustomerFinancialSummary(this.customerId)
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.customer = response.customer;
            this.financialSummary = response.summary;
          } else {
            this.showAlert('Error al cargar el resumen financiero', false);
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.showAlert(
            'Error al cargar el resumen financiero: ' + err.message,
            false
          );
        },
      });
  }

  loadCustomerSales(): void {
    this.isLoadingSales = true;

    const params = {
      page: this.currentPage,
      limit: this.itemsPerPage,
    };

    this.customersService.getCustomerSales(this.customerId, params).subscribe({
      next: (response) => {
        this.isLoadingSales = false;
        if (response.success) {
          this.customerSales = response.sales;
          this.totalItems = response.pagination.total;
          this.totalPages = response.pagination.totalPages;
          this.currentPage = response.pagination.currentPage;
        } else {
          this.showAlert('Error al cargar las ventas del cliente', false);
        }
      },
      error: (err) => {
        this.isLoadingSales = false;
        this.showAlert('Error al cargar las ventas: ' + err.message, false);
      },
    });
  }

  // Cambiar de página
  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadCustomerSales();
  }

  // Ir a detalles del cliente
  viewCustomerDetails(): void {
    this.router.navigate(['/clients/details', this.customerId]);
  }

  // Ir a gestión de deudas del cliente
  viewDebtManagement(): void {
    this.router.navigate(['/clients/debt-management', this.customerId]);
  }

  // Volver a la lista de clientes
  goBack(): void {
    this.router.navigate(['/clients/list']);
  }

  // Formatear nombre completo
  getFullName(): string {
    if (!this.customer) return '';
    return `${this.customer.firstName} ${this.customer.lastName}`;
  }

  // Formatear estado de venta
  formatSaleStatus(status: string): string {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'paid':
        return 'Pagada';
      case 'partial':
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
      case 'partial':
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
}
