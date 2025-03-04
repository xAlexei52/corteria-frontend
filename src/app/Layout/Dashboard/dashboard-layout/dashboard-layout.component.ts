import { Component, OnInit } from '@angular/core';
import { UsersService } from 'src/app/_services/Users/users.service';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  user: {
    id: string;
    name: string;
    surname: string;
    email: string;
  };
  permissions: string[];
  cities: string[];
  iat: number;
  exp: number;
}

@Component({
  selector: 'app-dashboard-layout',
  templateUrl: './dashboard-layout.component.html',
  styleUrls: ['./dashboard-layout.component.css']
})
export class DashboardLayoutComponent implements OnInit {
  isSidebarOpen = false;
  userName: string = '';
  userEmail: string = '';

  constructor(private usersService: UsersService) {}

  ngOnInit() {
    this.loadUserInfo();
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  loadUserInfo() {
    const token = this.usersService.getCurrentUserToken();
    if (token) {
      const decodedToken = jwtDecode(token) as DecodedToken;
      this.userName = `${decodedToken.user.name} ${decodedToken.user.surname}`;
      this.userEmail = decodedToken.user.email;
    }
  }
}