import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../auth.service';
import { RoutingModule } from '../../routing/routing.module';

@Component({
  selector: 'duetify-display',
  templateUrl: './display.component.html',
  styleUrls: ['./display.component.css']
})
export class DisplayComponent implements OnInit {

  constructor(private auth: AuthService, private router: Router) {

    if (!this.auth.isAuthenticated()) this.router.navigate(['/login']);

  }
  ngOnInit() {
  }

}
