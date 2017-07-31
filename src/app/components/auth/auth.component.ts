import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Cookie } from 'ng2-cookies';

import { RoutingModule } from '../../routing/routing.module';
import { AuthService } from '../../auth.service';
import { SpotifyApiService } from '../../spotify-api.service';

@Component({
  selector: 'duetify-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {
  constructor(private router: Router, private route: ActivatedRoute, private auth: AuthService, private spotify: SpotifyApiService) {
    this.route.queryParams.subscribe((params: Params) => {
      this.auth.checkAuthData(params)
        .subscribe(
          data => {
            if (data === true) {
              this.router.navigateByUrl('/');
            } else {
              this.router.navigateByUrl('/login');
            }
          },
          err => {
          }
        );
    });
  }

  ngOnInit() {
  }

}
