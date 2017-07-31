import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subscribable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import {map} from 'rxjs/operator/map';
import {debounceTime} from 'rxjs/operator/debounceTime';
import {distinctUntilChanged} from 'rxjs/operator/distinctUntilChanged';
import { FormControl } from '@angular/forms';

import { SpotifyApiService } from '../../spotify-api.service';
import { AuthService } from '../../auth.service';
import { Artist } from '../../artist';
import { Track } from '../../track';

const artists = []
@Component({
  selector: 'duetify-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
  public artists: Observable<Artist[]>;
  public tracks: Observable<Track[]>;
  @Input() private artist = 'Steve Jones';
  private artistsearch = new Subject<string>();
  private artistComplete: object;
  @Input() private state;

  constructor(
    private auth: AuthService,
    private spotify: SpotifyApiService,
    private router: Router
  ) {
    this.state = this.formatArtists(this.artists).subscribe(obj => {
      console.log('artist list:',obj);
      this.artistComplete = obj;
    });

  }

  searchArtist (artist: string): void {
    console.log('searchArtist:',artist);
    this.artistsearch.next(artist);
  }

  ngOnInit() {
    this.artists = this.artistsearch
      .debounceTime(500)
      .distinctUntilChanged()
      .switchMap(search => {
        console.log('searching;',search);
        if (!this.auth.isAuthenticated()) {
          this.router.navigate(['/login']);
        }
        if (search) {
          const result = this.spotify.searchArtists(search);
          if (result[0] && result[0].error_code && result[0].error_code === 401) {
            // something went wrong with auth try refreshing
            this.auth.refreshToken();
            console.warn('got 401 in search',result[0]);
          }
          console.log('search component stuff:',result);
          return result;
        } else {
          return Observable.of<Artist[]>([]);
        }
      })
      .catch(err => {
        console.log('Error in switchMap:',err);
        return Observable.of<Artist[]>([]);
      });

    this.artistComplete = this.formatArtists(this.artists);
  }

  public sendArtistTrackSearch = async (artist: string) => {
    console.log('search for tracks');
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/login']);
    }
    if (artist) {
      const tracks = await this.spotify.searchArtistTracks(artist);
      console.log('sendArtistTrackSearch stuff:',tracks);
      return tracks;
    }
  }

  private formatArtists = (artists: Observable<Artist[]>): Observable<object> => {
    let formatted = new Subject<object>();
    if (artists) {
      artists
      .subscribe(
        data => data &&
        data.forEach(artist => formatted[artist.name] = artist.smallPicUrl),
        err => {
          console.log('There was an error converting artists');
          return {};
        }
      );
    }
    return formatted.asObservable();
  }

}
