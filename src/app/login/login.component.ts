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
const localApi  = 'http://127.0.0.1:8000';

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
  showPassword: boolean = false; // Variable to track password visibility
  constructor(
    private http: HttpClient,
    private login: LoginDetailService,
    private router: Router
  ) {
    if (localStorage.getItem('user_id')) {
      this.router.navigate(['/home']);
    }
  }
  toggleForm() {
    this.isLogin = !this.isLogin;
    this.errorMessage = '';
  }
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword; // Toggle password visibility
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
          this.login.email = response['email'];
          this.login.password = response['password'];
          this.router.navigate(['/home']);
          localStorage.setItem('user_id', this.login.user_id.toString());
          localStorage.setItem('user_name', this.login.user_name);
          localStorage.setItem('email', this.login.email);
          localStorage.setItem('password', this.login.password);
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
    if (this.name === '' || this.email === '' || this.password === '') {
      this.errorMessage = 'All is required';
      return;
    }
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
          alert('Signup successful');
          this.email = '';
          this.password = '';
          this.name = '';
          console.log('Signup successful', response);
          
        },
        (error) => {
          if (error.status === 400) {
            this.errorMessage = error.error.detail;
          } else {
            this.errorMessage =
              error.error.detail || 'An unexpected error occurred. Please try again.';
          }
          this.name = '';
          this.email = '';
          this.password = '';
          console.error('Signup failed', error);
        }
      );
  }

}
