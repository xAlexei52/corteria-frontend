import { Injectable } from '@angular/core';
import { UsersService } from '../Users/users.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private usersService: UsersService) {}

  getUserRole(): string {
    const user = this.usersService.getCurrentUserData();
    return user?.role || '';
  }

  getUserCity(): string {
    const user = this.usersService.getCurrentUserData();
    return user?.city || '';
  }

  getUserWarehouse(): string {
    const user = this.usersService.getCurrentUserData();
    return user?.warehouse || '';
  }

  isAdmin(): boolean {
    return this.getUserRole() === 'admin';
  }

  isManager(): boolean {
    return this.getUserRole() === 'manager';
  }

  isUser(): boolean {
    return this.getUserRole() === 'user';
  }

  canAccessUsersModule(): boolean {
    return this.isAdmin(); // Only admin can access
  }

  canAccessCityAndWarehouse(targetCity: string, targetWarehouse: string): boolean {
    if (this.isAdmin()) return true;

    const userCity = this.getUserCity();
    const userWarehouse = this.getUserWarehouse();

    return targetCity === userCity && targetWarehouse === userWarehouse;
  }
}
