import { CommonModule } from '@angular/common';
import { Component, ChangeDetectorRef } from '@angular/core';
import { MatCard, MatCardModule } from '@angular/material/card';
import { LoginDetailService } from '../login-detail.service';
import { MatFormField} from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Observable, lastValueFrom } from 'rxjs';
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
  id: number = 0;
  name: string = '';
  email: string = '';
  password: string = '';
  mutualCount: number = 0;
}
@Component({
  selector: 'app-home',
  imports: [
    MatCardModule,
    CommonModule,
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
  suggested: boolean = false;
  posts: post[] = [];
  friends: user[] = [];
  allUsers: user[] = [];
  mutualFriends: user[] = [];
  selectedUserName: string = "";
  suggestedFriends: user[] = [];

  constructor(
    private login: LoginDetailService,
    private http: HttpClient,
    private router: Router, 
  ) {
    if (this.login.user_id == 0 || this.login.user_name == '') {
      this.router.navigate(['/login']);
    }
    this.name = login.user_name;

    this.loadFriendsAndPosts();
    this.loadUserDetails();
    
  }

  async loadFriendsAndPosts() {
    try {
      const friendsResponse = await lastValueFrom(this.http.get<user[]>(`${apiAddress}/friends/${this.login.user_id}`));
      for (const friend of friendsResponse) {
        this.friends.push(friend);
        try {
          const postsResponse = await lastValueFrom(this.http.get<post[]>(`${apiAddress}/posts/?user_id=${friend.id}`));
          this.posts.push(...postsResponse);
        } catch (error) {
          console.log(error);
        }
      }
    } catch (error) {
      console.log(error);
    }

    try {
      const userPostsResponse = await lastValueFrom(this.http.get<post[]>(`${apiAddress}/posts/?user_id=${this.login.user_id}`));
      this.posts.push(...userPostsResponse);
    } catch (error) {
      console.log(error);
    }

    try {
      const suggestedFriendsResponse = await lastValueFrom(this.http.get<user[]>(`${apiAddress}/suggested-friends/${this.login.user_id}`));
      this.suggestedFriends = suggestedFriendsResponse;
      console.log(this.suggestedFriends);
    } catch (error) {
      console.log(error);
    }
  }

  async loadUserDetails() {
    try {
      const usersResponse = await lastValueFrom(this.http.get<user[]>(`${apiAddress}/users/?id=${this.login.user_id}`));
      this.allUsers = usersResponse;
    } catch (error) {
      console.log(error);
    }
  }

  async getMutalFriendsCount(id: number): Promise<number> {
    try {
      const response = await lastValueFrom(this.http.get<number>(`${apiAddress}/mutual-count/${this.login.user_id}/${id}`));
      console.log(response);
      return response;
    } catch (error) {
      console.log(error);
      return 0;
    }
  }

  ngOnInit() {
    if (this.login.user_id == 0 || this.login.user_name == '') {
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
    this.loadMutualFriends(id);
    this.postdiv = false;
    this.displayFriends = false;
    this.createPosts = false;
    this.allUsersDiv = false;
    this.mutualFriendsDiv = true;
    this.selectedUserName = this.allUsers.find(user => user.id === id)?.name || '';
  }

  async loadMutualFriends(id: number) {
    try {
      const response = await lastValueFrom(this.http.get<user[]>(`${apiAddress}/mutual-friends/${this.login.user_id}/${id}`));
      this.mutualFriends = response;
      console.log(this.mutualFriends);
      
    } catch (error) {
      console.log(error);
    }
  }

  
  logout() {
    this.login.user_id = 0;
    this.login.user_name = '';
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_name');
    this.router.navigate(['/login']);
  } 

  Post() {
    this.postdiv = false;
    this.displayFriends = false;
    this.createPosts = true;
    this.allUsersDiv = false;
    this.mutualFriendsDiv = false;  
    this.suggested = false;
  }

  friendsBtn() {
    this.postdiv = false;
    this.displayFriends = true;
    this.createPosts = false;
    this.allUsersDiv = false;
    this.mutualFriendsDiv = false;
    this.suggested = false;
  }

  homeBtn() {
    this.postdiv = true;
    this.displayFriends = false;
    this.createPosts = false;
    this.allUsersDiv = false;
    this.mutualFriendsDiv = false;
    this.suggested = false;
  }

  allUsersBtn() {
    this.postdiv = false;
    this.displayFriends = false;
    this.createPosts = false;
    this.allUsersDiv = true;
    this.mutualFriendsDiv = false;  
    this.suggested = false;
    this.allUsers = [];
    this.loadUserDetails();
  }

  suggestFriendsBtn() {
    this.postdiv = false;
    this.displayFriends = false;
    this.createPosts = false;
    this.allUsersDiv = false;
    this.mutualFriendsDiv = false;
    this.suggested = true;
    this.loadSuggestedFriends();
  }

  async loadSuggestedFriends() {
    try {
      const suggestedFriendsResponse = await lastValueFrom(this.http.get<user[]>(`${apiAddress}/suggested-friends/${this.login.user_id}`));
      this.suggestedFriends = suggestedFriendsResponse;
      console.log(this.suggestedFriends);
    } catch (error) {
      console.log(error);
    }
  }
}
