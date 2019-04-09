import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {mainAnimations} from '../animations';
import {RouterOutlet} from '@angular/router';
import {Observable} from 'rxjs';
import {CoreService} from '@app/services/core.service';
import {map} from 'rxjs/operators';

@Component({
  selector: 'app-main',
  template: `
    <button mat-icon-button class="menu" *ngIf="showMenuButton$ | async" (click)="openSidenav()">
      <mat-icon>menu</mat-icon>
    </button>
    <header>
      <h1>Webflix</h1>
      <nav>
        <a [routerLink]="['/home']" routerLinkActive="active" queryParamsHandling="preserve">Home</a> |
        <a routerLink="/movies" routerLinkActive="active" queryParamsHandling="preserve">Movies</a> |
        <a routerLink="/shows" routerLinkActive="active" queryParamsHandling="preserve">TV Shows</a>
      </nav>
      <mat-icon (click)="searchInput.focus()">search</mat-icon>
      <input #searchInput
             placeholder="Titles, people, genres"
             value="" type="search" autocomplete="off"
             [class.active]="searchFocused"
             (focus)="searchFocused = true"
             (blur)="searchFocused = false">
    </header>
    <main [@mainAnimation]="getAnimationData(main)">
      <router-outlet #main="outlet"></router-outlet>
    </main>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    .menu {
      position: absolute;
      top: 10px;
      left: 10px;
    }
    header {
      min-height: 60px;
      display: flex;
      flex-direction: row;
      align-items: center;
      padding: 0 60px;
    }
    h1 {
      margin: 0 1rem 0 0;
    }
    nav a {
      color: white; /* TODO theme it */
    }
    mat-icon {
      margin-left: auto;
      cursor: pointer;
    }
    input {
      width: 0;
      padding: 0.5rem 0;
      margin: 0 0 0 0.25rem;
      border: none;
      border-bottom: 1px solid black;
      outline: none;
      background: transparent;
      transition: width 300ms ease;
    }
    input:focus {
      width: 250px;
      padding: 0.5rem 0.25rem;
    }
    main {
      flex-grow: 1;
      overflow-y: auto;
      overflow-x: hidden;
      position: relative;
    }
  `],
  animations: [mainAnimations],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainComponent implements OnInit {

  searchFocused = false;
  showMenuButton$: Observable<boolean>;

  constructor(private core: CoreService) {
    this.showMenuButton$ = core.getShowSidenav().pipe(map(b => !b));
  }

  ngOnInit() {
  }

  openSidenav() {
    this.core.openSidenav();
  }

  getAnimationData(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData.animation || 'void';
  }

}
