import { Injectable } from '@angular/core';
import 'rxjs/add/operator/toPromise';
import { Cookie } from 'ng2-cookies';
import * as moment from 'moment';
import * as qs from 'qs';
import { LocalStorageService } from 'angular-2-local-storage';

import { SpotifyApiService } from './spotify-api.service';

/**
* Simple random alphanumeric string generator.
* @param {number} length of string, to a maximum of 36
* @return {string} The generated string
*/
const getRandomString = len => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz'
.split('')
.sort(() => 0.5 - Math.random())
.slice(0,len)
.join('');

@Injectable()
export class AuthService {

  private authenticated: boolean = false;
  private access_token: string;
  private refresh_token: string;
  private token_type: string;
  private expires_in: number;
  private state: string;
  private stateKey ='spotify_auth_state';
  private scope = 'user-read-email user-read-currently-playing user-modify-playback-state user-read-playback-state';
  private redirect_uri = 'http://localhost:8080/';
  private spotifyAuthUrl = 'https://accounts.spotify.com/authorize?';
  private client_id = 'c165fd4b3c454bd5b1c726c172ea2faf';

  constructor(
    private spotify: SpotifyApiService,
    private localStorage: LocalStorageService
  ) { }

  public isAuthenticated = () => {
    return this.authenticated ? this.authenticated : this.checkAuthData();
  }
  public getAccessToken = () => this.access_token;

  public checkAuthData = (data: any = false) => {
    if (!data) {
      data = this._loadFromLocalStorage();
    }
    console.log('does access_token exist:',data.access_token);
    if (data.access_token) {
      console.log('got access_token',data.access_token);
      let test = this._testAccessToken(data.access_token);
      if (test) {
        this._setAccessToken(data.access_token);
        this._setRefreshToken(data.refresh_token);
        this._setExpire(data.expires_in);
        this._setTokenType(data.token_type);
        this._setAuthenticated();
        console.log('Authenticated');
        return true;
      } else {
        this._setUnAuthenticatd();
        return false;
      }
    }
    this._setUnAuthenticatd();
    return false;
  }

  public getLoginUrl = () => {
    this.state = getRandomString(16);
    if (Cookie.get(this.stateKey) !== this.state) Cookie.delete(this.stateKey);
    Cookie.set(this.stateKey, this.state, new Date(moment().add(5, 'm').format()));

    const queryString = qs.stringify({
      response_type: 'code',
      client_id: this.client_id,
      scope: this.scope,
      redirect_uri: this.redirect_uri,
      state: this.state
    });
    const spotifyAuthUri = this.spotifyAuthUrl + queryString;
    return spotifyAuthUri;
  };

  private _loadFromLocalStorage = () => {
    console.log('checking localStorage:',this.localStorage.length());
    if (this.localStorage.length() === 0) return false;
    const data = {};
    const fields = ['access_token','refresh_token','expires_in','token_type'];
    fields.forEach( field => {
      console.log('getting',field, this.localStorage.get(field));
      data[field] = this.localStorage.get(field);
    });
    console.log('loaded from localStorage',data);
    return data;
  }

  private _testAccessToken = async (accessToken: string) => {
    return await this.spotify.checkToken(accessToken);
  }

  private _setAuthenticated = () => this.authenticated = true;
  private _setUnAuthenticatd = () => {
    this.authenticated = false;
    this.localStorage.clearAll();
  }
  private _setAccessToken = (token: string) => {
    this.access_token = token;
    this.localStorage.set('access_token', token);
  }
  private _setRefreshToken = (token: string) => {
    this.refresh_token = token;
    this.localStorage.set('refresh_token', token);
  }
  private _setExpire = (expire: number) => {
    this.expires_in = expire;
    this.localStorage.set('expires_in', expire);
  }
  private _setTokenType = (type: string) => {
    this.token_type = type;
    this.localStorage.set('token_type', type);
  }

}
