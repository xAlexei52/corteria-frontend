import { Component, OnInit } from '@angular/core';
import { UsersService } from 'src/app/_services/Users/users.service';

@Component({
  selector: 'app-dashboard-layout',
  templateUrl: './dashboard-layout.component.html',
  styleUrls: ['./dashboard-layout.component.css'],
})
export class DashboardLayoutComponent implements OnInit {
  isSidebarOpen = false;
  userData: any = null;

  constructor(private usersService: UsersService) {}

  ngOnInit() {
    this.loadUserData();
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  loadUserData() {
    this.userData = this.usersService.getCurrentUserData();
  }

  // Método para obtener las iniciales del usuario
  getUserInitials(): string {
    if (!this.userData) return '';

    const firstName = this.userData.firstName || '';
    const lastName = this.userData.lastName || '';

    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  }

  // Método para generar un color basado en el nombre del usuario
  getUserColor(firstName: string, lastName: string): string {
    if (!firstName || !lastName) return '#3B82F6'; // Color azul por defecto

    // Generamos un hash simple basado en las iniciales
    const fullName = firstName + lastName;
    let hash = 0;
    for (let i = 0; i < fullName.length; i++) {
      hash = fullName.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Convertimos el hash a un color HSL
    // Usamos HSL para asegurarnos de que el color sea lo suficientemente oscuro para texto blanco
    const h = Math.abs(hash % 360);
    const s = 65; // Saturación al 65%
    const l = 45; // Luminosidad al 45% para asegurar que el texto blanco sea legible

    return `hsl(${h}, ${s}%, ${l}%)`;
  }
}
