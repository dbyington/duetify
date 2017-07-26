import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { SideBarComponent } from './components/side-bar/side-bar.component';
import { MainDisplayComponent } from './components/main-display/main-display.component';
import { SearchComponent } from './components/search/search.component';
import { YourMusicComponent } from './components/your-music/your-music.component';
import { HeaderComponent } from './components/header/header.component';
import { PlayerControlComponent } from './components/player-control/player-control.component';

import { SpotifyApiService } from './spotify-api.service';
import { DuetifyService } from './duetify.service';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SideBarComponent,
    MainDisplayComponent,
    SearchComponent,
    YourMusicComponent,
    HeaderComponent,
    PlayerControlComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [DuetifyService, SpotifyApiService],
  bootstrap: [AppComponent]
})
export class AppModule { }
