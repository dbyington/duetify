import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../auth.service';
import { RoutingModule } from '../../routing/routing.module';


@Component({
  selector: 'duetify-main-display',
  templateUrl: './main-display.component.html',
  styleUrls: ['./main-display.component.css']
})
export class MainDisplayComponent implements OnInit {

  constructor() {
    console.log('In main-display');
  }

  ngOnInit() {
  }

}
