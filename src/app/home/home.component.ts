import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { LoginDetailService } from '../login-detail.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule,HttpHeaders,HttpParams } from '@angular/common/http';
import { Observable, lastValueFrom } from 'rxjs';
class post {
  user_id: number = 0;
  user_name: string = '';
  content: string = '';
  time: string = '';
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
  bio: string = '';
}
@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  name: string = '';
  email: string = '';
  password: string = '';
  bio: string = '';
  postContent: string = '';
  postdiv: boolean = true;
  displayFriends: boolean = false;
  createPosts: boolean = false;
  allUsersDiv: boolean = false;
  mutualFriendsDiv: boolean = false;
  suggested: boolean = false;
  searchDiv: boolean = false;
  bioEdit: boolean = false;
  searchQuery: string = '';
  posts: post[] = [];
  friends: user[] = [];
  allUsers: user[] = [];
  mutualFriends: user[] = [];
  selectedUserName: string = "";
  suggestedFriends: user[] = [];
  friendsIds: number[] = [];
  searchResults: user[] = [];

  constructor(
    public login: LoginDetailService,
    private http: HttpClient,
    private router: Router, 
  ) {
    if (this.login.user_id == 0 || this.login.user_name == '') {
      this.router.navigate(['/login']);
    }
    this.name = login.user_name;
    this.email = login.email;
    this.bio = login.bio;

    this.loadFriendsAndPosts();
    this.loadUserDetails();
    
  }

  async loadFriendsAndPosts() {
    try {
      const friendsResponse = await lastValueFrom(this.http.get<user[]>(`${apiAddress}/friends/${this.login.user_id}`));
      for (const friend of friendsResponse) {
        this.friends.push(friend);
      }
    } catch (error) {
      console.log(error);
    }
    this.friendsIds.push(this.login.user_id);
    for (const friend of this.friends) {
      this.friendsIds.push(friend.id);
    }
    let params = new HttpParams();
    this.friendsIds.forEach(id => {
      params = params.append('user_ids', id.toString());
    });
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    try {
      console.log('Fetching posts for user IDs:', this.friendsIds);
      const friendsPostsResponse = await lastValueFrom(this.http.post<post[]>(`${apiAddress}/post/`,this.friendsIds, { headers}));
      this.posts.push(...friendsPostsResponse);
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
    this.searchResults = this.allUsers;
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
    this.suggested = false;
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

  search() {
    this.searchResults = this.allUsers.filter(user => user.name.toLowerCase().includes(this.searchQuery.toLowerCase()));
  }


  edit() {
    this.bioEdit = true;
  }

  submitBio() {
    this.bioEdit = false;
    this.http.post(apiAddress + '/bio/?user_id=' + this.login.user_id + '&bio=' + this.bio, {}).subscribe(
      (response) => {
        console.log(response);
        alert('Bio updated successfully');
      },
      (error) => {
        console.log(error);
      }
    );
    localStorage.setItem('bio', this.bio);
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
