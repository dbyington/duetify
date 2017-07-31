import { Injectable, NgModule } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable()
export class SpotifyApiService {

  private apiUrl = 'https://api.spotify.com';
  private access_token: string;

  constructor(private http: HttpClient) { }

  public checkToken = async (token) => {
    const result = await this.http.get(this.apiUrl + '/v1/me', {
      headers: new HttpHeaders().append('Authorization', 'Bearer ' + token),
    })
    .subscribe(
      data => {
        return data;
      },
      err => {
        console.log('got an error:', err);
      }
    );
    if (result) this.access_token = token;
  }

  

}
