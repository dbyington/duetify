import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from '../components/login/login.component';
import { AuthComponent } from '../components/auth/auth.component';
import { MainDisplayComponent } from '../components/main-display/main-display.component';
import { DisplayComponent } from '../components/display/display.component';
import { AppComponent } from '../app.component';

const appRoutes: Routes = [
  // { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'app', component: DisplayComponent },
  { path: 'login', component: LoginComponent },
  { path: 'auth', component: AuthComponent },
  { path: '', component: DisplayComponent }
]
@NgModule({
  imports: [
    CommonModule,
    RouterModule.forRoot(appRoutes)
  ],
  declarations: [],
  exports: [RouterModule]
})
export class RoutingModule { }
