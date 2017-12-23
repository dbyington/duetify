import { Injectable, NgModule, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { Subject, BehaviorSubject, Observable, Subscription } from 'rxjs/Rx';
import { LocalStorageService } from 'angular-2-local-storage';

import { Artist } from './artist';
import { Track } from './track';
import qs from 'qs';
import { Status } from './status';

@Injectable()
export class SpotifyApiService {

  public artistSearchResults: Subject<Artist[]> = new Subject<Artist[]>();
  public trackSearchResults: BehaviorSubject<Track[]> = new BehaviorSubject([new Track()]);
  public currentArtist: BehaviorSubject<Artist> = new BehaviorSubject(new Artist());
  public recentArtists: BehaviorSubject<Artist[]> = new BehaviorSubject([new Artist()]);
  public user: BehaviorSubject<{}> = new BehaviorSubject({});
  public playlist: BehaviorSubject<{}> = new BehaviorSubject({});
  // public busy: Observable<any>;

  private _artistString: string;
  public status: Status;

  private recentSize = 5; // number of recent artists to show
  public playlistName = 'Duetify';
  private playlistDescription = 'Duetify managed playlist of the last search artist';

  private apiUrl = 'https://api.spotify.com/v1/';
  private access_token: string;

  constructor(private http: HttpClient,
    private sanitizer: DomSanitizer,
    private localStorage: LocalStorageService
  ) {
    // this.getUser();
    // this.getPlaylist();
    this.user.subscribe(data => data['id'] && this.getPlaylist());

    this.trackSearchResults.subscribe(tracks => (tracks && tracks.length > 0) ? this.reloadPlaylist() : undefined);
    // Observable
    //   .zip(
    //     this.user,
    //     this.playlist,
    //     this.trackSearchResults,
    //     (user: {}, playlist: {}, tracks: Track[]) => ({ user, playlist, tracks}))
    //   .subscribe(x => this.reloadPlaylist());
  }

  public checkToken = (token): Observable<{}> => {
    const checkResult = {};
    return this.http.get(this.apiUrl + 'me', {
      headers: new HttpHeaders().append('Authorization', 'Bearer ' + token),
      observe: 'response'
    })
      .map(
        data => {
          if (data.status !== 200) {
            this.access_token = token;
            this.user.next(data);
            console.log(data);
            return false;
          } else {
            return true;
          }
        }
      )
      .first();
  }

  ngOnInit () {
    // this.trackSearchResults.subscribe(tracks => this.reloadPlaylist());
  }
  public _setAuthToken = (token) => {
    this.access_token = token;
  }

  public clearArtistSearch = () => {
    this.artistSearchResults.next(null);
  }

  public clearTrackSearch = () => {
    this.trackSearchResults.next(null);
  }

  public searchArtists = (artist: string): Observable<Artist[]> => {
    this.clearTrackSearch();
    if (!artist) {
      this.setStatus({status: 'error', error: 'Artist not supplied', code: 400});
      return new Observable();
    }
    console.log('searchArtists searching:', artist);
    const query = `q=${artist}&type=artist`;
    this.search(query, this._searchArtistsCallback);
    if (this.status['status'] !== 'ok') {
      return new Observable();
    } else {
      return this.artistSearchResults;
    }
  }

  public searchArtistTracks = (artist: Artist): Observable<Track[]> => {
    if (!artist['name']) {
      this.setStatus({status: 'error', error: 'Artist not supplied', code: 400});
      return new Observable();
    }
    console.log('searchArtistTracks searching:', artist);
    this.currentArtist.next(artist);
    this.addRecentArtist(artist);
    const query = `q=artist:"${artist.name}"&type=track`;
    this.search(query, this._searchArtistTracksCallback);
    if (this.status['status'] !== 'ok') {
      return new Observable();
    } else {
      return this.trackSearchResults;
    }
  }

  public search = (query: string, callback) => {
    if (query.length < 2) {
      this.setStatus({status: 'error', error: 'query too short', code: 400});
    }
    console.log('search query:', query);
    this.setStatus({status: 'ok', error: '', code: 200});
    const authHeader = new HttpHeaders().append('Authorization', 'Bearer ' + this.access_token);
    const apiEndpoint = 'search';
    const url = `${this.apiUrl}${apiEndpoint}?${query}&limit=50`;
    this.http.get(url, {headers: authHeader})
    .subscribe(
      callback,
      err => {
        console.log('Error searching artists:', err);
        this.setStatus({status: 'error', error: err.statusText, code: err.status});
      }
    );

  }

  private _searchArtistsCallback =
  data => {
    const artistsResults = [];
    data['artists'].items.forEach( obj => {
      const artist = new Artist();
      artist.name = obj.name;
      artist.id = obj.id;
      artist.popularity = obj.popularity;
      if (obj.images.length > 0) {
        const picId = obj.images.length - 1;
        artist.smallPicUrl = obj.images[picId].url;
        artist.bigPicUrl = obj.images[0].url;
      } else {
        artist.smallPicUrl = artist.bigPicUrl = '';
      }
      artistsResults.push(artist);
    })
    console.log('ArtistsCallback got:', artistsResults);
    this.artistSearchResults.next(artistsResults);
  };

  private getPlaylist = () => {
    this.setStatus({status: 'ok', error: '', code: 200});
    if (this.localStorage.keys().includes('playlist')) {
      this.playlist.next(this.localStorage.get('playlist'));
      console.log('found playlist in localStorage', this.localStorage.get('playlist'));
      return;
    }
    const authHeader = new HttpHeaders().append('Authorization', 'Bearer ' + this.access_token);
    const userId = this.user.getValue()['id'];
    const apiEndpoint = `users/${userId}/playlists`;
    const url = `${this.apiUrl}${apiEndpoint}?limit=50`;
    console.log('getting playlist:', url);
    this.http.get(url, {headers: authHeader})
    .subscribe(
      pls => {
        console.log('playlists:', pls);
        const pl = pls['items'].find( el => pl['name'] === this.playlistName);
        if (!pl) {
          console.log('playlist not found creating:', pl);
          this.createPlaylist();
        } else {
          console.log('got playlist:', pl);
          this.localStorage.set('playlist', pl);
          this.playlist.next(pl);
        }
      },
      err => {
        this.createPlaylist();
        if (this.status['status'] !== 'ok') {
          console.log('Error searching artists:', err);
          this.setStatus({status: 'error', error: err.statusText, code: err.status});
        }
      }
    );
  }

  private createPlaylist = () => {
    this.setStatus({status: 'ok', error: '', code: 200});
    console.log('user info:', this.user.getValue());
    const userId = this.user.getValue()['id'];
    const authHeader = new HttpHeaders().append('Authorization', 'Bearer ' + this.access_token);
    const apiEndpoint = `users/${userId}/playlists`;
    const body = {name: this.playlistName, public: false, description: this.playlistDescription};
    const url = `${this.apiUrl}${apiEndpoint}`;
    this.http.post(url, body, {headers: authHeader})
    .subscribe(
      pls => {
        console.log('created playlist:', pls);
        this.localStorage.set('playlist', pls);
        this.playlist.next(pls);
        this.reloadPlaylist();
      },
      err => {
        console.log('Error searching artists:', err);
        this.setStatus({status: 'error', error: err.statusText, code: err.status});
      }
    );

    // const trackList = this.trackSearchResults.getValue().map(tk => )
  }

  private reloadPlaylist = () => {
    this.setStatus({status: 'ok', error: '', code: 200});
    console.log('reloadPlaylist called');
    if (this.trackSearchResults.getValue()) {
      const userId = this.user.getValue()['id'];
      const playlistId = this.playlist.getValue()['id'];
      if (!playlistId) return;
      const authHeader = new HttpHeaders().append('Authorization', 'Bearer ' + this.access_token);
      const apiEndpoint = `users/${userId}/playlists/${playlistId}/tracks`;
      const tracks = this.trackSearchResults.getValue().map(el => el.uri);
      if (tracks.length < 1) return;
      const body = {uris: tracks};
      const url = `${this.apiUrl}${apiEndpoint}`;
      console.log('reloadPlaylist with:', url, body);
      this.http.put(url, body, {headers: authHeader})
      .subscribe(
        pls => {
          console.log('playlist refreshed:', this.playlist.getValue());
          this.playlist.next(this.playlist.getValue());
        },
        err => {
          console.log('Error searching artists:', err);
          this.setStatus({status: 'error', error: err.statusText, code: err.status});
        }
      );
    }
  }

  private _searchArtistTracksCallback =
    data => {
      const reg = '&|and|(feat|with).*' + this.currentArtist['name'];
      const artistRegexp = new RegExp(reg);
      const tracks = [];
      // console.log('tracks callback:',data.tracks.items);
      data.tracks.items.forEach( tk => {
        // console.log('track:',tk);
        const track =  new Track();
        if (tk.name) {
          if ((tk.artists.length > 1 && tk.artists.some(a => a.name === this.currentArtist.getValue().name)
            || tk.artists.some(a => a.name.match(artistRegexp)))) {
            track.name = tk.name;
            track.id = tk.id;
            track.album_cover = tk.album.images.length > 0 ? tk.album.images[0].url : '';
            track.pupularity = tk.popularity;
            track.artists = [];
            tk.artists.forEach(tkart => track.artists.push(tkart.name));
            track.spotify_open_url = tk.external_urls.spotify;
            track.uri = tk.uri;
            // track.album; // TODO: as mentioned in track.js
            tracks.push(track);
            // console.log('got track:',track);
          }
        }
      });
      this.trackSearchResults.next(tracks);
    }

  public getUser = () => {
    this.http.get(this.apiUrl + 'me', {
      headers: new HttpHeaders().append('Authorization', 'Bearer ' + this.access_token),
    })
    .subscribe( user => {
      console.log('setting next user:', user);
      this.user.next(user);
    },
      err => this.setStatus({status: 'error', error: err.statusText, code: err.status}));
  }

  private setStatus = (status) => {
    this.status = status;
    return this.status;
  }

  private addRecentArtist = (artist: Artist) => {
    const recent = this.recentArtists.getValue();
    console.log(`adding ${artist.name} to recent list:`, recent);
    if (recent.every( el => el.name !== artist.name)) (recent.unshift(artist);
    if (recent.length > this.recentSize) recent.pop();
    console.log('recent', recent);
  }


}
