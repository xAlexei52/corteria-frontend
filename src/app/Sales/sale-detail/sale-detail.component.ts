// sale-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SalesService } from 'src/app/_services/Sales/sales.service';

@Component({
  selector: 'app-sale-detail',
  templateUrl: './sale-detail.component.html',
  styleUrls: ['./sale-detail.component.css'],
})
export class SaleDetailComponent implements OnInit {
  saleId: string = '';
  sale: any = null;
  payments: any[] = [];
  isLoading: boolean = false;
  alertMessage: string = '';
  isSuccess: boolean = false;
  isClosing: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private salesService: SalesService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.saleId = params['id'];
      if (this.saleId) {
        this.loadSaleDetails();
      } else {
        this.router.navigate(['/sales/list']);
      }
    });
  }

  loadSaleDetails(): void {
    this.isLoading = true;
    this.salesService.getSaleById(this.saleId).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.sale = response.sale;
          this.payments = response.sale.payments || [];
        } else {
          this.showAlert('Error al cargar los detalles de la venta', false);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.showAlert('Error al cargar los detalles: ' + err.message, false);
      },
    });
  }

  // Navegar a la página de registro de pago
  registerPayment(): void {
    this.router.navigate(['/sales/payment', this.saleId]);
  }

  // Cancelar venta
  cancelSale(): void {
    if (confirm('¿Estás seguro de que deseas cancelar esta venta?')) {
      this.salesService.cancelSale(this.saleId).subscribe({
        next: (response) => {
          if (response.success) {
            this.showAlert('Venta cancelada correctamente', true);
            this.loadSaleDetails(); // Recargar los detalles para reflejar el cambio
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

  // Volver a la lista de ventas
  goBack(): void {
    this.router.navigate(['/sales/list']);
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

  // Formatear método de pago
  formatPaymentMethod(method: string): string {
    switch (method) {
      case 'cash':
        return 'Efectivo';
      case 'transfer':
        return 'Transferencia';
      case 'check':
        return 'Cheque';
      case 'credit_card':
        return 'Tarjeta de Crédito';
      case 'debit_card':
        return 'Tarjeta de Débito';
      default:
        return method;
    }
  }

  // Convertir string a número
  parseFloat(value: string): number {
    return parseFloat(value) || 0;
  }

  // Calcular el porcentaje pagado
  calculatePaidPercentage(): number {
    if (!this.sale) return 0;
    const total = this.parseFloat(this.sale.totalAmount);
    if (total === 0) return 0;

    const paid = this.parseFloat(this.sale.paidAmount);
    return (paid / total) * 100;
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
