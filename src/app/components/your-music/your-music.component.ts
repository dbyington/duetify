import { Component, OnInit } from '@angular/core';

import { SpotifyApiService } from '../../spotify-api.service';
import { Artist } from '../../artist';

@Component({
  selector: 'duetify-your-music',
  templateUrl: './your-music.component.html',
  styleUrls: ['./your-music.component.css']
})
export class YourMusicComponent implements OnInit {

  private recent: Artist[];

  constructor(private spotify: SpotifyApiService) { }

  ngOnInit() {
    this.spotify.recentArtists.subscribe(recent => this.recent = recent);

  }

}
