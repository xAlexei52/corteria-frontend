// manufacturing-order-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ManufacturingOrdersService } from 'src/app/_services/ManufacturingOrders/manufacturing-orders.service';

@Component({
  selector: 'app-manufacturing-order-detail',
  templateUrl: './manufacturing-order-detail.component.html',
  styleUrls: ['./manufacturing-order-detail.component.css'],
})
export class ManufacturingOrderDetailComponent implements OnInit {
  orderId: string = '';
  order: any = null;
  isLoading: boolean = false;
  alertMessage: string = '';
  isSuccess: boolean = false;
  isClosing: boolean = false;

  // Para modal de confirmación de eliminación
  showDeleteModal: boolean = false;

  // Para modal de cambio de estado
  showStatusModal: boolean = false;
  statusForm: FormGroup;
  calculatingExpenses: boolean = false;

  // Opciones para el selector de estado
  statusOptions = [
    { value: 'pending', label: 'Pendiente' },
    { value: 'in_progress', label: 'En Proceso' },
    { value: 'completed', label: 'Completado' },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private manufacturingOrdersService: ManufacturingOrdersService
  ) {
    this.statusForm = this.fb.group({
      status: ['', Validators.required],
      startDate: [''],
      endDate: [''],
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.orderId = params['id'];
      if (this.orderId) {
        this.loadOrderData();
      } else {
        this.router.navigate(['/manufacturing-orders']);
      }
    });
  }

  loadOrderData(): void {
    this.isLoading = true;
    this.manufacturingOrdersService
      .getManufacturingOrderById(this.orderId)
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.order = response.order;

            // Inicializar el formulario de estado con los valores actuales
            this.statusForm.patchValue({
              status: this.order.status,
              startDate: this.formatDateForInput(this.order.startDate),
              endDate: this.formatDateForInput(this.order.endDate),
            });
          } else {
            this.showAlert('Error al cargar los detalles de la orden', false);
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.showAlert('Error al cargar los detalles: ' + err.message, false);
        },
      });
  }

  // Formatear fecha para input datetime-local
  formatDateForInput(dateStr: string | null): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toISOString().slice(0, 16);
  }

  // Ir a edición (si se implementa)
  editOrder(): void {
    // Implementar si es necesario
    this.showAlert('Función de edición en desarrollo', false);
  }

  // Regresar a la lista
  goBack(): void {
    this.router.navigate(['/manufacturing-orders']);
  }

  // Abrir modal de confirmación para eliminar
  confirmDelete(): void {
    this.showDeleteModal = true;
  }

  // Cancelar eliminación
  cancelDelete(): void {
    this.showDeleteModal = false;
  }

  // Eliminar orden
  deleteOrder(): void {
    this.isLoading = true;
    this.manufacturingOrdersService
      .deleteManufacturingOrder(this.orderId)
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.showDeleteModal = false;
          if (response.success) {
            this.showAlert('Orden eliminada correctamente', true);
            setTimeout(() => {
              this.router.navigate(['/manufacturing-orders']);
            }, 2000);
          } else {
            this.showAlert('Error al eliminar la orden', false);
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.showDeleteModal = false;
          this.showAlert('Error al eliminar la orden: ' + err.message, false);
        },
      });
  }

  // Abrir modal para cambiar estado
  openStatusModal(): void {
    // Asegurarse de que el formulario tenga los valores actuales
    this.statusForm.patchValue({
      status: this.order.status,
      startDate: this.formatDateForInput(this.order.startDate),
      endDate: this.formatDateForInput(this.order.endDate),
    });

    this.showStatusModal = true;
  }

  // Cerrar modal de estado
  cancelStatusChange(): void {
    this.showStatusModal = false;
  }

  // Guardar cambio de estado
  updateStatus(): void {
    if (this.statusForm.invalid) {
      return;
    }

    this.isLoading = true;
    const formData = this.statusForm.value;

    this.manufacturingOrdersService
      .updateOrderStatus(this.orderId, formData)
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.showStatusModal = false;
          if (response.success) {
            this.showAlert('Estado actualizado correctamente', true);
            this.loadOrderData(); // Recargar datos
          } else {
            this.showAlert('Error al actualizar el estado', false);
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.showStatusModal = false;
          this.showAlert(
            'Error al actualizar el estado: ' + err.message,
            false
          );
        },
      });
  }

  // Calcular gastos
  calculateExpenses(): void {
    this.calculatingExpenses = true;
    this.manufacturingOrdersService
      .calculateOrderExpenses(this.orderId)
      .subscribe({
        next: (response) => {
          this.calculatingExpenses = false;
          if (response.success) {
            this.showAlert('Gastos calculados correctamente', true);
            this.loadOrderData(); // Recargar datos con los gastos actualizados
          } else {
            this.showAlert('Error al calcular los gastos', false);
          }
        },
        error: (err) => {
          this.calculatingExpenses = false;
          this.showAlert('Error al calcular los gastos: ' + err.message, false);
        },
      });
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
