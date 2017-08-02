import { Injectable, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs/Subject';

import 'rxjs/add/operator/toPromise';
import { Cookie } from 'ng2-cookies';
import * as moment from 'moment';
import * as qs from 'qs';
import { LocalStorageService } from 'angular-2-local-storage';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Rx';

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

  public authed = new Subject<boolean>();
  private authenticated: boolean = false;
  private oauth = {};
  private state: string;
  private stateKey ='spotify_auth_state';
  private duetify_uri = 'http://localhost:8080/';
  private spotifyAuthUrl = 'https://accounts.spotify.com/authorize?';
  private client_id = 'c165fd4b3c454bd5b1c726c172ea2faf';
  private scope = 'user-read-email user-read-currently-playing user-modify-playback-state user-read-playback-state playlist-modify-private playlist-read-private';

  constructor(
    private http: HttpClient,
    private spotify: SpotifyApiService,
    private localStorage: LocalStorageService,
    private router: Router
  ) {
    if (this.localStorage.keys().includes('access_token')) {
      this.oauth = this._loadFromLocalStorage();
      this.spotify.checkToken(this.oauth['access_token'])
      .subscribe(
        data => {
          if (data['type'] === 'user') {
            this.authenticated = true;
          }
        }
      );
    }
  }

  ngOnInit () {
    this.spotify.getUser();

  }

  public isAuthenticated = () => this.authenticated;
  public testAuth = (): Observable<boolean> => {
    if (this.notExpired(this.oauth['expires'])) {
      this._setAuthenticated();
      this.spotify._setAuthToken(this.oauth['access_token']);
      this.authed.next(true);
    } else if (!this.oauth['access_token']) {
      console.log('isAuthenticated; no access_token');
      this.authed.next(false);
    } else {
      this.checkAuthData(this.oauth)
        .subscribe(
          data => {
            this.authed.next(data);
          },
          err => {
            console.log('there was an error with checkAuthData',err);
          }
        );
    }
    return Observable.from(this.authed);
  }

  public getAccessToken = () => this.oauth['access_token'];

  public checkAuthData = (d: {}): Observable<boolean> => {
    let checkResult = new Subject<boolean>();
    let data = Object.assign({}, d);

    if (!data['access_token']) {
      if (this.oauth['access_token']) {
        data = Object.assign({}, this.oauth);
      } else {
        if (this.localStorage.length() > 0) {
          data = Object.assign({}, this._loadFromLocalStorage());
        } else {
          checkResult.next(false);
        }
      }
    }
    if (!data['access_token']) {
      checkResult.next(false);
    }
    else {
      this.spotify.checkToken(data['access_token'])
        .subscribe(
          result => {
            if (result) {
              this.setOauthToken(data);
              checkResult.next(true);
              return true;
            }
            checkResult.next(true);
          },
          err => {
            console.log('checkAuthData got an error from checkToken:',err)
            checkResult.next(false);
          });
        }
    return Observable.from(checkResult);
  }

  private setOauthToken = (data: {}) => {
    if (!data) return undefined;
    this._setAccessToken(data['access_token']);
    // when refreshing the access_token Spotify may not send a new refresh_token
    this._setRefreshToken(data['refresh_token'] || this.oauth['refresh_token']);
    this._setExpire_in(data['expires_in']);
    this._setExpires(data['expires']);
    this._setTokenType(data['token_type']);
    this.spotify._setAuthToken(data['access_token']);
    this._setAuthenticated();
    console.log('Authenticated until:',this.oauth['expires']);
    return this.oauth;
  }

  private notExpired = (expires: Date = this.oauth['expires']) => {
    if (new Date(moment(expires).format()) < new Date()) {
      const newExpire = this._refreshToken();
      if (newExpire['expires'] > new Date()) {
        return true;
      } else {
        return false;
      }
    }
    return true;
  }
  public refreshToken = () => {
    const result = this._refreshToken();
    if (result['access_token']) {
      return true;
    } else {
      return false;
    }
  }
  private _refreshToken = () => {
    let newToken = {};
    const url = `${this.duetify_uri}refresh_token?refresh_token=${this.oauth['refresh_token']}`
    this.http.get(url)
    .subscribe(
      data => {
        newToken = this.setOauthToken(data);
      },
      err => {
        console.log('error refreshing token:',err);
        throw(err);
      });
    return newToken;
  }

  public getLoginUrl = () => {
    this.state = getRandomString(16);
    if (Cookie.get(this.stateKey) !== this.state) Cookie.delete(this.stateKey);
    Cookie.set(this.stateKey, this.state, new Date(moment().add(5, 'm').format()));

    const queryString = qs.stringify({
      response_type: 'code',
      client_id: this.client_id,
      scope: this.scope,
      redirect_uri: this.duetify_uri,
      state: this.state
    });
    const spotifyAuthUri = this.spotifyAuthUrl + queryString;
    return spotifyAuthUri;
  };

  public logout = () => {
    this.authenticated = false;
    this.localStorage.remove('access_token', 'refresh_token');
    this.localStorage.set('expires', new Date());
    return true;
  }

  private _loadFromLocalStorage = () => {
    if (this.localStorage.length() === 0) return false;
    const fields = ['access_token','refresh_token','expires_in','token_type', 'expires'];
    fields.forEach( field => {
      this.oauth[field] = this.localStorage.get(field);
    });
    return this.oauth;
  }

  private _setAuthenticated = () => this.authenticated = true;
  private _setUnAuthenticatd = () => {
    this.authenticated = false;
  }
  private _setAccessToken = (token: string) => {
    if (!token) return undefined;
    this.spotify._setAuthToken(token);
    this.oauth['access_token'] = token;
    this.localStorage.set('access_token', token);
  }
  private _setRefreshToken = (token: string) => {
    if (!token) return undefined;
    this.oauth['refresh_token'] = token;
    this.localStorage.set('refresh_token', token);
  }
  private _setExpire_in = (expire: number) => {
    if (!expire) return undefined;
    this.oauth['expires_in'] = expire;
    this.localStorage.set('expires_in', expire);
  }

  private _setExpires = (expires: Date) => {
    if (!expires) return undefined;
    this.oauth['expires'] = expires;
    this.localStorage.set('expires', expires);
  }

  private _setTokenType = (type: string) => {
    if (!type) return undefined;
    this.oauth['token_type'] = type;
    this.localStorage.set('token_type', type);
  }

}
