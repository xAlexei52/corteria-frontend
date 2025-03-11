// supply-list.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { SuppliesService } from 'src/app/_services/Supplies/supplies.service';

@Component({
  selector: 'app-supply-list',
  templateUrl: './supply-list.component.html',
  styleUrls: ['./supply-list.component.css'],
})
export class SupplyListComponent implements OnInit {
  supplies: any[] = [];
  isLoading: boolean = false;
  totalItems: number = 0;
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 0;

  filterForm!: FormGroup;
  alertMessage: string = '';
  isSuccess: boolean = false;
  isClosing: boolean = false;

  constructor(
    private suppliesService: SuppliesService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.filterForm = this.fb.group({
      search: [''],
      active: [''],
    });
  }

  ngOnInit(): void {
    this.loadSupplies();
  }

  loadSupplies(): void {
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

    this.suppliesService.getSupplies(filters).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.supplies = response.supplies;
          this.totalItems = response.pagination.total;
          this.totalPages = response.pagination.totalPages;
          this.currentPage = response.pagination.currentPage;
          this.itemsPerPage = response.pagination.limit;
        } else {
          this.showAlert('Error al cargar los insumos', false);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.showAlert('Error al cargar los insumos: ' + err.message, false);
      },
    });
  }

  // Cambiar de página
  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadSupplies();
  }

  // Aplicar filtros
  applyFilters(): void {
    this.currentPage = 1; // Resetear a la primera página
    this.loadSupplies();
  }

  // Resetear filtros
  resetFilters(): void {
    this.filterForm.reset({
      search: '',
      active: '',
    });
    this.currentPage = 1;
    this.loadSupplies();
  }

  // Navegar a la página de detalle del insumo
  viewSupplyDetails(id: string): void {
    this.router.navigate([`/supplies/details/${id}`]);
  }

  // Navegar a la página de edición del insumo
  editSupply(id: string): void {
    this.router.navigate([`/supplies/edit/${id}`]);
  }

  // Crear nuevo insumo
  createNewSupply(): void {
    this.router.navigate(['/supplies/new']);
  }

  // Eliminar un insumo
  deleteSupply(id: string): void {
    if (confirm('¿Estás seguro de que deseas eliminar este insumo?')) {
      this.suppliesService.deleteSupply(id).subscribe({
        next: (response) => {
          if (response.success) {
            this.showAlert('Insumo eliminado correctamente', true);
            this.loadSupplies(); // Recargar la lista
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
