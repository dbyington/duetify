import { Injectable, NgModule } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subject, Observable } from 'rxjs/Rx';
import { Artist } from './artist';
import { Track } from './track';
import qs from 'qs';

@Injectable()
export class SpotifyApiService {

  public artistSearchResults: Array<Artist>;
  public trackSearchResults: Array<Track>;

  private apiUrl = 'https://api.spotify.com/v1/';
  private access_token: string;

  constructor(private http: HttpClient) { }

  public checkToken = (token): Observable<{}> => {
    let checkResult = {};
    return this.http.get(this.apiUrl + 'me', {
      headers: new HttpHeaders().append('Authorization', 'Bearer ' + token),
      observe: 'response'
    })
      .map(
        data => {
          if (data.status !== 200) {
            this.access_token = token;
            return false;
          } else {
            return true;
          }
        }
      )
      .first();
  }

  public _setAuthToken = (token) => {
    this.access_token = token;
  }

  public searchArtists = (artistString: string): Observable<Artist[]> => {
    console.log('searchArtists searching:',artistString);
    const authHeader = new HttpHeaders().append('Authorization', 'Bearer ' + this.access_token);
    let artistsObservable = [];
    if (artistString && artistString !== '') {
      const apiEndpoint = 'search';
      const query = `q=${artistString}&type=artist&limit=50`;
      const url = `${this.apiUrl}${apiEndpoint}?${query}`;
      this.http.get(url, {headers: authHeader})
      .subscribe(
        data => {
          data['artists'].items.forEach( obj => {
            let artist = new Artist();
            artist.name = obj.name;
            artist.id = obj.id;
            artist.popularity = obj.popularity;
            if (obj.images.length > 0) {
              const picId = obj.images.length - 1;
              artist.smallPicUrl = obj.images[picId].url;
              artist.bigPicUrl = obj.images[0].url;
            }
            artistsObservable.push(artist);
          })
          return Observable.of(artistsObservable);
        },
        err => {
          console.log('Error searching artists:', err);
          artistsObservable.push({error: err.statusText, error_code: err.status})
        }
      );
      return Observable.of(artistsObservable);
    }
  }

  public searchArtistTracks = (artistString: string): Observable<Track[]> => {
    const authHeader = new HttpHeaders().append('Authorization', 'Bearer ' + this.access_token);
    let tracks = [];
    if (artistString && artistString !== '') {
      const apiEndpoint = 'search';
      const query = `q=artist:"${artistString}"&type=track&limit=50`;
      const reg = '&|and|(feat|with).*'+artistString;
      const artistRegexp = new RegExp(reg);
      const url = `${this.apiUrl}${apiEndpoint}?${query}`;
      this.http.get(url, {headers: authHeader})
      .subscribe(
        data => {
          let track =  new Track();
          data['tracks'].items.forEach( tk => {
            if (tk.name) {
              if (tk.artists.length > 1 || tk.artists.some(a => a.name.match(artistRegexp))) {
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
              }
            }
          });
          return Observable.of(tracks);
        },
        err => {
          console.log('Error searching artist tracks:', err);
          tracks.push({error: err.statusText, error_code: err.status})
        }
      );
    }
    return Observable.of(tracks);
  }

}
