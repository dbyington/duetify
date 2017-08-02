import { Component, OnInit } from '@angular/core';

import { SpotifyApiService } from '../../spotify-api.service';
import { Artist } from '../../artist';

@Component({
  selector: 'duetify-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  private currentArtist: Artist;

  constructor(private spotify: SpotifyApiService) { }

  ngOnInit() {
    this.spotify.currentArtist.subscribe(artist => this.currentArtist = artist);
  }

}
