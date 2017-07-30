import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Rx';

import { SpotifyApiService } from '../../spotify-api.service';
import { Artist } from '../../artist';
import { Track } from '../../track';

@Component({
  selector: 'duetify-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css']
})
export class ResultsComponent implements OnInit, OnDestroy {
  private subscription;
  private artist: string;
  private trackList: Array<Track>;

  constructor(private spotify: SpotifyApiService) {
    this.subscription = this.spotify.searchArtistTracks(this.artist).subscribe( tracks => {
      this.trackList = tracks;
    });
  }

  ngOnInit() {
  }

  ngOnDestroy() {}

}
``
