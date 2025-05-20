import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { SalesService } from 'src/app/_services/Sales/sales.service';

@Component({
  selector: 'app-sale-romaneo',
  templateUrl: './sale-romaneo.component.html',
  styleUrls: ['./sale-romaneo.component.css'],
})
export class SaleRomaneoComponent implements OnInit {
  saleDetailId: string;
  saleDetail: any = null;
  sale: any = null;
  romaneo: any = null;
  isLoading: boolean = false;
  isEditing: boolean = false;
  romaneoForm: FormGroup;

  alertMessage: string = '';
  isSuccess: boolean = false;
  isClosing: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private salesService: SalesService,
    private fb: FormBuilder
  ) {
    this.saleDetailId = '';
    this.romaneoForm = this.fb.group({
      boxes: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.saleDetailId = params['detailId'];
      this.loadRomaneo();
    });
  }

  get boxesFormArray() {
    return this.romaneoForm.get('boxes') as FormArray;
  }

  loadRomaneo(): void {
    this.isLoading = true;
    this.salesService.getRomaneo(this.saleDetailId).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.romaneo = response.romaneo;
          this.initForm();
        } else {
          this.showAlert('No hay romaneo para este detalle de venta', false);
        }
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 404) {
          this.romaneo = null;
          this.showAlert('No hay romaneo para este detalle de venta', false);
        } else {
          this.showAlert('Error al cargar el romaneo: ' + err.message, false);
        }
      },
    });
  }

  initForm(): void {
    if (this.romaneo) {
      // Limpiar el array existente
      while (this.boxesFormArray.length !== 0) {
        this.boxesFormArray.removeAt(0);
      }

      // Agregar cada caja del romaneo al formulario
      this.romaneo.boxes.forEach((box: any) => {
        this.boxesFormArray.push(
          this.fb.group({
            boxNumber: [
              box.boxNumber,
              [Validators.required, Validators.min(1)],
            ],
            weight: [box.weight, [Validators.required, Validators.min(0.1)]],
          })
        );
      });
    }
  }

  addBox(): void {
    const nextBoxNumber = this.boxesFormArray.length + 1;
    this.boxesFormArray.push(
      this.fb.group({
        boxNumber: [nextBoxNumber, [Validators.required, Validators.min(1)]],
        weight: [0, [Validators.required, Validators.min(0.1)]],
      })
    );
  }

  removeBox(index: number): void {
    this.boxesFormArray.removeAt(index);
    // Renumerar las cajas
    for (let i = 0; i < this.boxesFormArray.length; i++) {
      this.boxesFormArray
        .at(i)
        .get('boxNumber')
        ?.setValue(i + 1);
    }
  }

  generateRomaneo(): void {
    this.isLoading = true;
    this.salesService.generateRomaneo(this.saleDetailId).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.romaneo = response.romaneo;
          this.initForm();
          this.showAlert('Romaneo generado correctamente', true);
        } else {
          this.showAlert('Error al generar el romaneo', false);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.showAlert('Error al generar el romaneo: ' + err.message, false);
      },
    });
  }

  saveRomaneo(): void {
    if (this.romaneoForm.invalid) {
      this.showAlert('Por favor, corrija los errores del formulario', false);
      return;
    }

    // Calcular el total de pesos
    const boxes = this.boxesFormArray.value;
    const totalWeight = boxes.reduce(
      (sum: number, box: any) => sum + Number(box.weight),
      0
    );

    const romaneoData = {
      boxes: boxes,
      totalWeight: totalWeight,
    };

    this.isLoading = true;
    this.salesService.updateRomaneo(this.saleDetailId, romaneoData).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.romaneo = romaneoData;
          this.isEditing = false;
          this.showAlert('Romaneo actualizado correctamente', true);
        } else {
          this.showAlert('Error al actualizar el romaneo', false);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.showAlert('Error al actualizar el romaneo: ' + err.message, false);
      },
    });
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (this.isEditing) {
      this.initForm();
    }
  }

  goBack(): void {
    this.router.navigate(['/sales/list']);
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

  getTotalWeight(): number {
    if (
      !this.romaneo ||
      !this.romaneo.boxes ||
      this.romaneo.boxes.length === 0
    ) {
      return 0;
    }
    return this.romaneo.boxes.reduce(
      (sum: number, box: any) => sum + Number(box.weight),
      0
    );
  }

  getCurrentTotalWeight(): number {
    if (!this.boxesFormArray || this.boxesFormArray.length === 0) {
      return 0;
    }
    return this.boxesFormArray.controls.reduce((sum: number, control: any) => {
      return sum + Number(control.get('weight').value);
    }, 0);
  }
}
