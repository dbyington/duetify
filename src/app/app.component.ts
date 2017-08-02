import { Component, OnInit } from '@angular/core';
import { AuthService } from './auth.service';

@Component({
  selector: 'duetify-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  private title = 'duetify';

  constructor (private auth: AuthService) {
  }

  ngOnInit () {
    this.auth.testAuth();
  }

}
