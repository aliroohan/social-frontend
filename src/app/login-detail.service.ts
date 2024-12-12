import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoginDetailService {
  user_id!: number;
  user_name: string = '';
  
  constructor() { }
}
