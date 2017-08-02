import { Component, OnInit } from '@angular/core';

import { SpotifyApiService } from '../../spotify-api.service';

@Component({
  selector: 'duetify-player-control',
  templateUrl: './player-control.component.html',
  styleUrls: ['./player-control.component.css']
})
export class PlayerControlComponent implements OnInit {

  private user: {};

  constructor(private spotify: SpotifyApiService) { }

  ngOnInit() {
    this.spotify.user.subscribe(user => this.user = user);
    this.spotify.getUser();
  }

}
