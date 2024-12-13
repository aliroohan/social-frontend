import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatCard, MatCardModule } from '@angular/material/card';
import { LoginDetailService } from '../login-detail.service';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Observable } from 'rxjs';
class post {
  user_id: number = 0;
  user_name: string = '';
  content: string = '';
  constructor(user_id: number, user_name: string, content: string) {
    this.user_id = user_id;
    this.user_name = user_name;
    this.content = content;
  }
}
const apiAddress = 'https://social-delta-nine.vercel.app';
class user {
  id!: number;
  name!: string;
  email!: string;
  password!: string;
}
@Component({
  selector: 'app-home',
  imports: [
    MatCardModule,
    CommonModule,
    MatFormField,
    MatLabel,
    FormsModule,
    MatInputModule,
    MatButtonModule,
    HttpClientModule,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  name: string = '';
  postContent: string = '';
  post: boolean = false;
  posts: post[] = [];
  friends: user[] = [];
  

  constructor(
    private login: LoginDetailService,
    private http: HttpClient,
    private router: Router
  ) {
    this.name = login.user_name;
    this.http
      .get<user[]>(apiAddress +'/friends/' + this.login.user_id)
      .subscribe(
        (response) => {
          console.log(response);
          for (let i = 0; i < response.length; i++) {
            this.friends.push(response[i]);
          }
        },
        (error) => {
          console.log(error);
        }
      );
      this.http
        .get<post[]>(
          apiAddress+'/posts/?user_id=' + this.login.user_id
        )
        .subscribe(
          (response) => {
            console.log(response);
            for (let i = 0; i < response.length; i++) {
              this.posts.push(response[i]);
            }
          },
          (error) => {
            console.log(error);
          }
        );
    for (let i = 0; i < this.friends.length; i++) {
      this.http
        .get<post[]>(
          apiAddress+'/posts/?user_id=' + this.friends[i].id
        )
        .subscribe(
          (response) => {
            console.log(response);
            for (let i = 0; i < response.length; i++) {
              this.posts.push(response[i]);
            }
          },
          (error) => {
            console.log(error);
          }
        );
    }
    console.log(this.posts);
  }

  Post() {
    this.post = !this.post;
  }

  ngOnInit() {
    if (this.login.user_id == 0) {
      this.router.navigate(['/login']);
    }
  }

  createPost() {
    this.http
      .post(
        apiAddress + '/posts/?user_id=' +
          this.login.user_id +
          '&content=' +
          this.postContent,
        {
          user_id: this.login.user_id,
          content: this.postContent,
        }
      )
      .subscribe(
        (response) => {
          console.log(response);
          const newPost = new post(this.login.user_id, this.login.user_name, this.postContent);
          this.posts.push(newPost);
          alert('Post created successfully');
          this.postContent = '';
        },
        (error) => {
          console.log(error);
        }
      );
  }

  homeBtn() {
    console.log('Home button clicked');
  }
}
