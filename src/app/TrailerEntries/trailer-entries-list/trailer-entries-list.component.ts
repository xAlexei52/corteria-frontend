import { Component, OnInit } from '@angular/core';
import { TrailerEntriesService } from 'src/app/_services/TrailerEntry/trailer-entries.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CityService } from 'src/app/_services/Cities/city.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-trailer-entries-list',
  templateUrl: './trailer-entries-list.component.html',
  styleUrls: ['./trailer-entries-list.component.css'],
})
export class TrailerEntriesListComponent implements OnInit {
  entries: any[] = [];
  isLoading: boolean = false;
  totalItems: number = 0;
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 0;

  filterForm: FormGroup;
  alertMessage: string = '';
  isSuccess: boolean = false;
  isClosing: boolean = false;

  // Para el modal de confirmación de eliminación
  showDeleteModal: boolean = false;
  entryToDelete: any = null;
  cities: any[] = [];

  // Opciones para el filtro de procesamiento
  processingStatusOptions = [
    { value: '', label: 'Todos los estados' },
    { value: 'pending', label: 'Pendiente' },
    { value: 'partial', label: 'Parcial' },
    { value: 'completed', label: 'Completado' },
    { value: 'not_needed', label: 'No requiere' },
  ];

  constructor(
    private trailerEntriesService: TrailerEntriesService,
    private fb: FormBuilder,
    private router: Router,
    private cityService: CityService
  ) {
    this.filterForm = this.fb.group({
      startDate: [''],
      endDate: [''],
      cityId: [''],
      supplier: [''],
      reference: [''],
      needsProcessing: [''],
      processingStatus: [''],
    });
  }

  ngOnInit(): void {
    this.loadEntries();
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

  loadEntries(): void {
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

    this.trailerEntriesService.getTrailerEntries(filters).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          // Ajuste para manejar la estructura real de la respuesta
          this.entries = response.entries;
          this.totalItems = response.pagination.total;
          this.totalPages = response.pagination.totalPages;
          this.currentPage = response.pagination.currentPage;
          this.itemsPerPage = response.pagination.limit;
        } else {
          this.showAlert('Error al cargar las entradas', false);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.showAlert('Error al cargar las entradas: ' + err.message, false);
      },
    });
  }

  // Cambiar de página
  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadEntries();
  }

  // Aplicar filtros
  applyFilters(): void {
    this.currentPage = 1; // Resetear a la primera página
    this.loadEntries();
  }

  // Resetear filtros
  resetFilters(): void {
    this.filterForm.reset({
      startDate: '',
      endDate: '',
      cityId: '',
      supplier: '',
      reference: '',
      needsProcessing: '',
      processingStatus: '',
    });
    this.currentPage = 1;
    this.loadEntries();
  }

  // Navegar a crear nueva entrada
  createNewEntry(): void {
    this.router.navigate(['/trailer-entries/create']);
  }

  // Navegar a editar entrada
  editEntry(id: string): void {
    this.router.navigate([`/trailer-entries/edit/${id}`]);
  }

  // Abrir modal para confirmar eliminación
  confirmDelete(entry: any): void {
    this.entryToDelete = entry;
    this.showDeleteModal = true;
  }

  // Cancelar eliminación
  cancelDelete(): void {
    this.showDeleteModal = false;
    this.entryToDelete = null;
  }

  // Eliminar entrada
  deleteEntry(): void {
    if (!this.entryToDelete) return;

    this.isLoading = true;
    this.trailerEntriesService
      .deleteTrailerEntry(this.entryToDelete.id)
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.showAlert('Entrada eliminada correctamente', true);
            this.loadEntries(); // Recargar la lista
          } else {
            this.showAlert('Error al eliminar la entrada', false);
          }
          this.showDeleteModal = false;
          this.entryToDelete = null;
        },
        error: (err) => {
          this.isLoading = false;
          this.showAlert('Error al eliminar la entrada: ' + err.message, false);
          this.showDeleteModal = false;
          this.entryToDelete = null;
        },
      });
  }

  // Ver detalles de una entrada
  viewDetails(id: string): void {
    this.router.navigate([`/trailer-entries/details/${id}`]);
  }

  // Formatear estado de procesamiento
  formatProcessingStatus(status: string): string {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'partial':
        return 'Parcial';
      case 'completed':
        return 'Completado';
      case 'not_needed':
        return 'No requiere';
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
