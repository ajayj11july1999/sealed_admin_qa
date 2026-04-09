import { Injectable } from '@angular/core';

import { CanLoad, CanActivate, Route, Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class AuthGuardServiceService  implements CanActivate{

  constructor(private auth: AuthService, private router: Router) {

   }

   canActivate(): boolean {
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['login']);
      return false;
    }
    return true;
  }
 }





