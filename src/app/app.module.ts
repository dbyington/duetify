import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CookieModule } from 'ngx-cookie';
import { Router } from '@angular/router';
import { LocalStorageModule } from 'angular-2-local-storage';

import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { SideBarComponent } from './components/side-bar/side-bar.component';
import { MainDisplayComponent } from './components/main-display/main-display.component';
import { SearchComponent } from './components/search/search.component';
import { YourMusicComponent } from './components/your-music/your-music.component';
import { HeaderComponent } from './components/header/header.component';
import { PlayerControlComponent } from './components/player-control/player-control.component';
import { ResultsComponent } from './components/results/results.component';
import { AuthComponent } from './components/auth/auth.component';
import { DisplayComponent } from './components/display/display.component';

import { SpotifyApiService } from './spotify-api.service';
import { AuthService } from './auth.service';
import { RoutingModule } from './routing/routing.module';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SideBarComponent,
    MainDisplayComponent,
    SearchComponent,
    YourMusicComponent,
    HeaderComponent,
    PlayerControlComponent,
    ResultsComponent,
    AuthComponent,
    DisplayComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    NgbModule.forRoot(),
    CookieModule.forRoot(),
    FlexLayoutModule,
    RoutingModule,
    LocalStorageModule.withConfig({
      prefix: 'duetify',
      storageType: 'localStorage',
      notifyOptions: {
        setItem: true,
        removeItem: true
      }
    })
  ],
  providers: [AuthService, SpotifyApiService],
  bootstrap: [AppComponent]
})
export class AppModule { }
