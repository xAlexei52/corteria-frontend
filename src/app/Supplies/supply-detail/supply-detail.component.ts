// supply-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SuppliesService } from 'src/app/_services/Supplies/supplies.service';

@Component({
  selector: 'app-supply-detail',
  templateUrl: './supply-detail.component.html',
  styleUrls: ['./supply-detail.component.css'],
})
export class SupplyDetailComponent implements OnInit {
  supplyId: string = '';
  supply: any = null;
  isLoading: boolean = false;
  alertMessage: string = '';
  isSuccess: boolean = false;
  isClosing: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private suppliesService: SuppliesService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.supplyId = params['id'];
      if (this.supplyId) {
        this.loadSupplyDetails();
      } else {
        this.router.navigate(['/supplies/list']);
      }
    });
  }

  loadSupplyDetails(): void {
    this.isLoading = true;
    this.suppliesService.getSupplyById(this.supplyId).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.supply = response.supply;
        } else {
          this.showAlert('Error al cargar los detalles del insumo', false);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.showAlert('Error al cargar los detalles: ' + err.message, false);
      },
    });
  }

  // Navegar a la página de edición del insumo
  editSupply(): void {
    this.router.navigate([`/supplies/edit/${this.supplyId}`]);
  }

  // Eliminar el insumo
  deleteSupply(): void {
    if (confirm('¿Estás seguro de que deseas eliminar este insumo?')) {
      this.suppliesService.deleteSupply(this.supplyId).subscribe({
        next: (response) => {
          if (response.success) {
            this.showAlert('Insumo eliminado correctamente', true);
            setTimeout(() => {
              this.router.navigate(['/supplies/list']);
            }, 1500);
          } else {
            this.showAlert('Error al eliminar el insumo', false);
          }
        },
        error: (err) => {
          this.showAlert('Error al eliminar el insumo: ' + err.message, false);
        },
      });
    }
  }

  // Volver a la lista de insumos
  goBack(): void {
    this.router.navigate(['/supplies/list']);
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
