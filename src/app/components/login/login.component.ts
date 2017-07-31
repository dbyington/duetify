import { Component, OnInit, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../../auth.service';
import { RoutingModule } from '../../routing/routing.module';

@Component({
  selector: 'duetify-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  @Input()
  spotifyLogin: string;

  constructor(private auth: AuthService, private router: Router) {
    if (this.auth.isAuthenticated()) {
      this.router.navigateByUrl('/');
    } else {
      this.spotifyLogin = this.auth.getLoginUrl();
    }
  }

  ngOnInit() {
  }

}
