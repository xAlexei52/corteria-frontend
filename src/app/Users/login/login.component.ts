import { Component, OnInit } from '@angular/core';
import { UsersService } from 'src/app/_services/Users/users.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  hidePassword = true;
  email: string = '';
  password: string = '';
  alertMessage: string = '';
  isSuccess: boolean = false;
  isClosing: boolean = false;
  rememberMe: boolean = false;
  isLoading: boolean = false;

  constructor(
    private usersService: UsersService,
    private router: Router
  ) {}

  ngOnInit() {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      this.email = savedEmail;
      this.rememberMe = true;
    }
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  onLogin() {
    if (!this.email || !this.password) {
      this.showAlert('Por favor, completa todos los campos', false);
      return;
    }

    this.isLoading = true;
    this.usersService.login(this.email, this.password).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          if (this.rememberMe) {
            localStorage.setItem('rememberedEmail', this.email);
          } else {
            localStorage.removeItem('rememberedEmail');
          }
          
          // Verificar si el usuario está activo
          if (!response.user.active) {
            this.showAlert('Tu cuenta está desactivada. Contacta al administrador.', false);
            return;
          }

          this.showAlert(response.message || 'Inicio de sesión exitoso!', true);
          
          // Guardar información adicional del usuario
          localStorage.setItem('userRole', response.user.role);
          localStorage.setItem('userName', `${response.user.firstName} ${response.user.lastName}`);
          
          // Necesitamos guardar el usuario completo para usarlo después
          localStorage.setItem('userData', JSON.stringify(response.user));
          localStorage.setItem('token', response.token);
          
          setTimeout(() => {
            this.router.navigate(['/home']);
          }, 1500);
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Login error', error);
        this.showAlert(
          error.error?.message || 
          'Hubo un error al intentar iniciar sesión, contacte a soporte', 
          false
        );
      }
    });
  }

  private showAlert(message: string, isSuccess: boolean) {
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