import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { UsersService } from 'src/app/_services/Users/users.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent {
  @Input() isSidebarOpen = false;
  @Output() toggleSidebar = new EventEmitter<void>();

  isInventarioExpanded: boolean = false;
  isClientesExpanded: boolean = false;
  isInsumosExpanded: boolean = false;
  isProyectosExpanded: boolean = false;

  role: string = '';


  constructor(private usersService: UsersService, private router: Router) {
    const user = this.usersService.getCurrentUserData();
    this.role = user?.role || '';
  }

  get isAdmin() {
    return this.role === 'admin';
  }
  
  get isManager() {
    return this.role === 'manager';
  }
  
  get isRegularUser() {
    return this.role === 'user';
  }

  closeSidebar() {
    this.toggleSidebar.emit();
  }

  toggleInventario() {
    this.isInventarioExpanded = !this.isInventarioExpanded;
  }

  toggleClientes() {
    this.isClientesExpanded = !this.isClientesExpanded;
  }

  toggleInsumos() {
    this.isInsumosExpanded = !this.isInsumosExpanded;
  }

  logout() {
    this.usersService.logout(); // Esto debería limpiar el token y otros datos de sesión
    this.router.navigate(['/login']); // Redirige al usuario a la página de login
  }

  toggleProyectos() {
    this.isProyectosExpanded = !this.isProyectosExpanded;
  }
}
