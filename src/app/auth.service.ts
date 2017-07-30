import { Injectable } from '@angular/core';
import 'rxjs/add/operator/toPromise';
import { Cookie } from 'ng2-cookies';
import * as moment from 'moment';
import * as qs from 'qs';
import { LocalStorageService } from 'angular-2-local-storage';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subject, Observable } from 'rxjs/Rx';



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
  private oauth = {};
  private state: string;
  private stateKey ='spotify_auth_state';
  private scope = 'user-read-email user-read-currently-playing user-modify-playback-state user-read-playback-state';
  private duetify_uri = 'http://localhost:8080/';
  private spotifyAuthUrl = 'https://accounts.spotify.com/authorize?';
  private client_id = 'c165fd4b3c454bd5b1c726c172ea2faf';

  constructor(
    private http: HttpClient,
    private spotify: SpotifyApiService,
    private localStorage: LocalStorageService
  ) { }

  public isAuthenticated = () => {
    return this.authenticated && this.oauth['expires'] > new Date() ? this.authenticated : this.checkAuthData(this.oauth || {});
  }
  public getAccessToken = () => this.oauth['access_token'];

  public checkAuthData = (data = {}) => {
    // we have an 'expires' that suggests the token has expired, try to refresh.
    // otherwise we should be good.
    if (this.oauth['expires'] && this.oauth['expires'] < (new Date())) {
      data = this._refreshToken();
    } else {
      return true;
    }

    // if we do not have a token try to load from local storage
    if (!data['access_token']) {
      data = this._loadFromLocalStorage();
    }

    // if our data is good we'll have expires and created
    // if the calculated expire date OR the set 'expires'
    // date are less than now the token has expired, try refreshing.
    if ( data['expires_in'] && data['created']
      && ((new Date(moment(data['created']).add(data['expires_in'], 's').format()) < new Date())
        || (data['expires'] < new Date())
      )
    ) {
      data = this._refreshToken();
    }

    // we should have an access_token by now, if not return false, i.e. try again
    if (data['access_token']) {
      let test = this._testAccessToken(data['access_token']);
      console.log('result of token test',test);
      if (test) {
        console.log('created:',data['created']);
        if (data['created']) this._setCreated(data['created']);
        this._setAccessToken(data['access_token']);
        // if passed a refresh_token set it, else set it to the current one
        this._setRefreshToken(data['refresh_token'] || this.oauth['refresh_token']);
        this._setExpire(data['expires_in']);
        this._setTokenType(data['token_type']);
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

  private _refreshToken = () => {
    let newToken = {};
    const url = `${this.duetify_uri}refresh_token?refresh_token=${this.oauth['refresh_token']}`
    this.http.get(url)
    .subscribe(
      data => {
        newToken = data;
      },
      err => {
        console.log('error refreshing token:',err);
      });
    // return the whole body since it may have a new refresh_token.
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
    this.localStorage.clearAll();
    return true;
  }

  private _loadFromLocalStorage = () => {
    if (this.localStorage.length() === 0) return false;
    const data = {};
    const fields = ['access_token','refresh_token','expires_in','token_type', 'expires'];
    fields.forEach( field => {
      data[field] = this.localStorage.get(field);
    });
    return data;
  }

  private _testAccessToken = (accessToken: string) => {
    const test = this.spotify.checkToken(accessToken)
      .subscribe(
        data => {
          console.log('testAccessToken:',accessToken,data);
          return data['type'] === 'user' ? true : false;
        },
        err => {
          console.log('error in testAccessToken:',err);
          return err
        }
      );
    return test;
  }

  private _setAuthenticated = () => this.authenticated = true;
  private _setUnAuthenticatd = () => {
    this.authenticated = false;
    // this.localStorage.clearAll();
  }
  private _setAccessToken = (token: string) => {
    this.oauth['access_token'] = token;
    this.localStorage.set('access_token', token);
  }
  private _setRefreshToken = (token: string) => {
    this.oauth['refresh_token'] = token;
    this.localStorage.set('refresh_token', token);
  }
  private _setExpire = (expire: number) => {
    this.oauth['expires_in'] = expire;
    this.oauth['expires'] = new Date(moment().add(expire, 's').format());
    console.log('token expires at:',this.oauth['expires']);
    this.localStorage.set('expires', this.oauth['expires']);
    this.localStorage.set('expires_in', expire);
  }

  private _setCreated = (created: Date) => {
    console.log('setting created:',created);
    this.localStorage.set('created', created);
  }

  private _setTokenType = (type: string) => {
    this.oauth['token_type'] = type;
    this.localStorage.set('token_type', type);
  }

}
