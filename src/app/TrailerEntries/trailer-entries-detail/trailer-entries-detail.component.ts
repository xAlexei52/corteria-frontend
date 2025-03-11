// trailer-entry-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TrailerEntriesService } from 'src/app/_services/TrailerEntry/trailer-entries.service';

@Component({
  selector: 'app-trailer-entry-detail',
  templateUrl: './trailer-entries-detail.component.html',
  styleUrls: ['./trailer-entries-detail.component.css'],
})
export class TrailerEntriesDetailComponent implements OnInit {
  entryId: string = '';
  entry: any = null;
  isLoading: boolean = false;
  alertMessage: string = '';
  isSuccess: boolean = false;
  isClosing: boolean = false;

  // Para modal de confirmación de eliminación
  showDeleteModal: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private trailerEntriesService: TrailerEntriesService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.entryId = params['id'];
      if (this.entryId) {
        this.loadEntryData();
      } else {
        this.router.navigate(['/trailer-entries']);
      }
    });
  }

  loadEntryData(): void {
    this.isLoading = true;
    this.trailerEntriesService.getTrailerEntryById(this.entryId).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.entry = response.entry;
        } else {
          this.showAlert('Error al cargar los detalles de la entrada', false);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.showAlert('Error al cargar los detalles: ' + err.message, false);
      },
    });
  }

  // Ir a edición
  editEntry(): void {
    this.router.navigate([`/trailer-entries/edit/${this.entryId}`]);
  }

  // Regresar a la lista
  goBack(): void {
    this.router.navigate(['/trailer-entries']);
  }

  // Abrir modal de confirmación para eliminar
  confirmDelete(): void {
    this.showDeleteModal = true;
  }

  // Cancelar eliminación
  cancelDelete(): void {
    this.showDeleteModal = false;
  }

  // Eliminar entrada
  deleteEntry(): void {
    this.isLoading = true;
    this.trailerEntriesService.deleteTrailerEntry(this.entryId).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.showDeleteModal = false;
        if (response.success) {
          this.showAlert('Entrada eliminada correctamente', true);
          setTimeout(() => {
            this.router.navigate(['/trailer-entries']);
          }, 2000);
        } else {
          this.showAlert('Error al eliminar la entrada', false);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.showDeleteModal = false;
        this.showAlert('Error al eliminar la entrada: ' + err.message, false);
      },
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

  createManufacturingOrder(): void {
    this.router.navigate(['/manufacturing-orders/create', this.entryId]);
  }
}
