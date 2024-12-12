import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { LoginDetailService } from '../login-detail.service';
import { Router } from '@angular/router';

interface User {
  id: number;
  name: string; 
  email: string;
  password: string;
}
const apiAddress = 'https://social-delta-nine.vercel.app';

@Component({
  selector: 'app-login',
  imports: [
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    CommonModule,
    FormsModule,
    HttpClientModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})


export class LoginComponent {
  isLogin: boolean = true; // Toggle between login and signup
  email: string = '';
  password: string = '';
  name: string = '';
  errorMessage: string = '';
  constructor(
    private http: HttpClient,
    private login: LoginDetailService,
    private router: Router
  ) {}
  toggleForm() {
    this.isLogin = !this.isLogin;
    this.errorMessage = '';
  }
  onLogin() {
    this.http
      .get<User>(
        apiAddress + '/user/?name=' +
          this.name +
          '&password=' +
          this.password
      )
      .subscribe(
        (response) => {
          this.login.user_id = response['id'];
          this.login.user_name = response['name'];
          this.router.navigate(['/home']);
          console.log('Login successful', response);
        },
        (error) => {
          if (error.status === 404 || error.status === 400) {
            this.errorMessage = error.error.detail;
          } else {
            this.errorMessage =
              'An unexpected error occurred. Please try again.';
          }
          console.error('Login failed', error);
        }
      );
    console.log('Logging in with', this.name, this.password);
  }

  onSignup() {
    const signupData = {    
      name: this.name,
      email: this.email,
      password: this.password,
    };
    console.log('Signing up with', signupData);

    this.http
      .post(
        apiAddress + '/users/?name=' +
          this.name +
          '&email=' +
          this.email +
          '&password=' +
          this.password,
        signupData
      )
      .subscribe(
        (response) => {
          console.log('Signup successful', response);
          // Handle successful signup (e.g., navigate to login or show a success message)
        },
        (error) => {
          if (error.status === 400) {
            this.errorMessage = 'User with this email already exists';
          } else {
            this.errorMessage =
              'An unexpected error occurred. Please try again.';
          }
          this.name = '';
          this.email = '';
          this.password = '';
          console.error('Signup failed', error);
        }
      );
  }
}
