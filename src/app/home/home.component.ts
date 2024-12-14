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
  postdiv: boolean = true;
  displayFriends: boolean = false;
  createPosts: boolean = false;
  allUsersDiv: boolean = false;
  mutualFriendsDiv: boolean = false;
  posts: post[] = [];
  friends: user[] = [];
  allUsers: user[] = [];
  mutualFriends: user[] = [];

  constructor(
    private login: LoginDetailService,
    private http: HttpClient,
    private router: Router
  ) {
    if (this.login.user_id == 0 || this.login.user_name == '') {
      this.router.navigate(['/login']);
    }
    this.name = login.user_name;
    this.http
      .get<user[]>(apiAddress + '/friends/' + this.login.user_id)
      .subscribe(
        (response) => {
          for (let i = 0; i < response.length; i++) {
            this.friends.push(response[i]);
            this.http
              .get<post[]>(apiAddress + '/posts/?user_id=' + response[i].id)
              .subscribe(
                (response) => {
                  for (let j = 0; j < response.length; j++) {
                    this.posts.push(response[j]);
                  }
                },
                (error) => {
                  console.log(error);
                }
              );
          }
        },
        (error) => {
          console.log(error);
        }
      );

    this.http
      .get<post[]>(apiAddress + '/posts/?user_id=' + this.login.user_id)
      .subscribe(
        (response) => {
          // console.log(response);
          for (let i = 0; i < response.length; i++) {
            this.posts.push(response[i]);
          }
        },
        (error) => {
          console.log(error);
        }
      );

    for (const i of this.friends) {
    }
    this.http
      .get<user[]>(apiAddress + '/users/?id=' + this.login.user_id)
      .subscribe(
        (response) => {
          console.log(response);
          for (let i = 0; i < response.length; i++) {
            this.allUsers.push(response[i]);
          }
        },
        (error) => {
          console.log(error);
        }
      );

    // console.log(this.posts);
  }

  getMutalFriendsCount(id: number): number {
    this.http.get(apiAddress + '/mutual-count/' + this.login.user_id + '/' + id).subscribe(
      (response) => {
        return response;
      },
      (error) => {
        console.log(error);
      }
    );
    return 0;
  }

  ngOnInit() {
    if (this.login.user_id == 0) {
      this.router.navigate(['/login']);
    }
  }

  createPost() {
    this.http
      .post(
        apiAddress +
          '/posts/?user_id=' +
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
          const newPost = new post(
            this.login.user_id,
            this.login.user_name,
            this.postContent
          );
          this.posts.push(newPost);
          alert('Post created successfully');
          this.postContent = '';
        },
        (error) => {
          console.log(error);
        }
      );
  }

  removeFriend(id: number) {
    this.http
      .delete(apiAddress + '/friend/' + this.login.user_id + '/' + id)
      .subscribe(
        (response) => {
          console.log(response);
          alert('Friend removed successfully');
          this.friends = this.friends.filter((friend) => friend.id != id);
        },
        (error) => {
          console.log(error);
        }
      );
  }

  addFriend(id: number) {
    this.http
      .post(apiAddress + '/friend/' + this.login.user_id + '/' + id, {})
      .subscribe(
        (response) => {
          console.log(response);
          alert('Friend added successfully');
          this.friends.push(this.allUsers.find((user) => user.id == id)!);
        },
        (error) => {
          console.log(error);
        }
      );
  }

  isFriend(id: number) {
    return this.friends.some((friend) => friend.id == id);
  }

  seeMutuals(id: number) {
    this.mutualFriendsDiv = true;
    this.postdiv = false;
    this.displayFriends = false;
    this.createPosts = false;
    this.allUsersDiv = false;
    this.http
      .get<user[]>(apiAddress + '/mutual-friends/' + this.login.user_id + '/' + id)
      .subscribe(
        (response) => {
          console.log(response);
          this.mutualFriends = response;
        },
        (error) => {
          console.log(error);
        }
      );
  }

  Post() {
    this.postdiv = false;
    this.displayFriends = false;
    this.createPosts = true;
    this.allUsersDiv = false;
    this.mutualFriendsDiv = false;
  }

  friendsBtn() {
    this.postdiv = false;
    this.displayFriends = true;
    this.createPosts = false;
    this.allUsersDiv = false;
    this.mutualFriendsDiv = false;
  }

  homeBtn() {
    this.postdiv = true;
    this.displayFriends = false;
    this.createPosts = false;
    this.allUsersDiv = false;
    this.mutualFriendsDiv = false;
  }

  allUsersBtn() {
    this.postdiv = false;
    this.displayFriends = false;
    this.createPosts = false;
    this.allUsersDiv = true;
    this.mutualFriendsDiv = false;
  }
}
