import { Component, OnInit, Input, EventEmitter } from '@angular/core';
import { Subject  } from 'rxjs/Subject';

import { SpotifyApiService } from '../../spotify-api.service';
import { AuthService } from '../../auth.service';
import { Artist } from '../../artist';

const artists = []
@Component({
  selector: 'duetify-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {

  private artistsearch = new Subject<string>();

  constructor(
    private auth: AuthService,
    private spotify: SpotifyApiService
  ) { }

  searchArtist (artist: string): void {
    console.log('searchArtist:',artist);
    this.artistsearch.next(artist);
  }

  ngOnInit() {
    this.artistsearch
      .debounceTime(400)
      .distinctUntilChanged()
      .subscribe(artist => this.spotify.searchArtists(artist));

  }

}
