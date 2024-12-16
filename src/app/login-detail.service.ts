import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoginDetailService {
  user_id!: number;
  user_name: string = '';
  email: string = '';
  password: string = '';
  
  constructor() { 
    localStorage.getItem('user_id') ? this.user_id = parseInt(localStorage.getItem('user_id')!) : this.user_id = 0;
    localStorage.getItem('user_name') ? this.user_name = localStorage.getItem('user_name')! : this.user_name = '';  
    localStorage.getItem('email') ? this.email = localStorage.getItem('email')! : this.email = '';
    localStorage.getItem('password') ? this.password = localStorage.getItem('password')! : this.password = '';
  }
}
