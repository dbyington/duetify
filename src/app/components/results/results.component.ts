import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, BehaviorSubject, Subscription } from 'rxjs/Rx';
import { DomSanitizer } from '@angular/platform-browser';

import { SpotifyApiService } from '../../spotify-api.service';
import { Artist } from '../../artist';
import { Track } from '../../track';

@Component({
  selector: 'duetify-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css']
})
export class ResultsComponent implements OnInit {
  private selectedArtist = new BehaviorSubject(new Artist());
  private artists: Artist[];
  private tracks: Track[];
  private playlist: {};
  // private busy: Subscription;

  constructor(private spotify: SpotifyApiService, private sanitizer: DomSanitizer) {

  }

  ngOnInit() {
    this.spotify.artistSearchResults.subscribe(data => {
      this.artists = data;
      this.playlist = {};
    });
    // this.spotify.trackSearchResults.subscribe(data => this.tracks = data);
    this.spotify.playlist.subscribe(data => this.playlist = this.spotify.playlist.getValue());
    this.selectedArtist.subscribe(this.searchTracks);
    // this.busy = this.spotify.busy.subscribe(busy => this.busy = busy);
  }

  searchTracks = (artist: Artist) => {
    this.spotify.clearArtistSearch();
    this.spotify.searchArtistTracks(this.selectedArtist.getValue());
  }

  getSafeStyleImageUrl = (imageUrl) => this.sanitizer.bypassSecurityTrustStyle(`url(${imageUrl})`);
  getSafeUri = (uri) => this.sanitizer.bypassSecurityTrustResourceUrl('https://open.spotify.com/embed?uri='+uri);
  areTracks = () => this.tracks.length > 0;
}
