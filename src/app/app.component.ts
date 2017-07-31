import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'duetify-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  private title = 'duetify';

  constructor () {}

  ngOnInit () { }

}
