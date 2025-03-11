// sale-payment.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SalesService } from 'src/app/_services/Sales/sales.service';

@Component({
  selector: 'app-sale-payment',
  templateUrl: './sale-payment.component.html',
  styleUrls: ['./sale-payment.component.css'],
})
export class SalePaymentComponent implements OnInit {
  saleId: string = '';
  sale: any = null;
  isLoading: boolean = false;
  isSubmitting: boolean = false;

  paymentForm!: FormGroup;

  alertMessage: string = '';
  isSuccess: boolean = false;
  isClosing: boolean = false;

  paymentMethods = [
    { value: 'cash', label: 'Efectivo' },
    { value: 'transfer', label: 'Transferencia' },
    { value: 'check', label: 'Cheque' },
    { value: 'credit_card', label: 'Tarjeta de Crédito' },
    { value: 'debit_card', label: 'Tarjeta de Débito' },
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private salesService: SalesService
  ) {
    this.createForm();
  }

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

  createForm(): void {
    this.paymentForm = this.fb.group({
      amount: [0, [Validators.required, Validators.min(0.01)]],
      date: [new Date().toISOString().substring(0, 16), Validators.required],
      paymentMethod: ['cash', Validators.required],
      referenceNumber: [''],
      notes: [''],
    });
  }

  loadSaleDetails(): void {
    this.isLoading = true;
    this.salesService.getSaleById(this.saleId).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.sale = response.sale;

          // Si la venta está cancelada o completamente pagada, no permitir registrar pagos
          if (this.sale.status === 'cancelled' || this.sale.status === 'paid') {
            this.showAlert(
              'No se pueden registrar pagos para esta venta',
              false
            );
            setTimeout(() => {
              this.router.navigate(['/sales/details', this.saleId]);
            }, 2000);
            return;
          }

          // Establecer el monto pendiente como valor predeterminado
          const pendingAmount = this.parseFloat(this.sale.pendingAmount);
          this.paymentForm.get('amount')?.setValue(pendingAmount);
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

  onSubmit(): void {
    if (this.paymentForm.invalid) {
      this.markFormGroupTouched(this.paymentForm);
      this.showAlert('Por favor, completa todos los campos requeridos', false);
      return;
    }

    const formValue = this.paymentForm.value;
    const amount = this.parseFloat(formValue.amount);
    const pendingAmount = this.parseFloat(this.sale.pendingAmount);

    // Validar que el monto del pago no exceda el monto pendiente
    if (amount > pendingAmount) {
      this.showAlert(
        `El monto no puede exceder el saldo pendiente ($${pendingAmount.toFixed(
          2
        )})`,
        false
      );
      return;
    }

    this.isSubmitting = true;

    this.salesService.registerPayment(this.saleId, formValue).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        if (response.success) {
          this.showAlert('Pago registrado exitosamente', true);
          setTimeout(() => {
            this.router.navigate(['/sales/details', this.saleId]);
          }, 1500);
        } else {
          this.showAlert(
            'Error al registrar el pago: ' + response.message,
            false
          );
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        this.showAlert('Error al registrar el pago: ' + err.message, false);
      },
    });
  }

  cancelPayment(): void {
    this.router.navigate(['/sales/details', this.saleId]);
  }

  // Convertir string a número
  parseFloat(value: string | number): number {
    if (typeof value === 'number') return value;
    return parseFloat(value) || 0;
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
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
