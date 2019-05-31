import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {DEFAULT_TIMING, mainAnimations} from '../animations';
import {RouterOutlet} from '@angular/router';
import {Observable} from 'rxjs';
import {CoreService} from '@app/services/core.service';
import {map} from 'rxjs/operators';
import {animate, query, style, transition, trigger} from '@angular/animations';

const detailsTransitions = [
  // transition(debugAnimation('details'), []),
  transition('detailsOn => detailsOff', [
    query('.details', style({ background: 'none' })),
    query(
      ':leave router-outlet + *',
      [
        style({ opacity: 1 }),
        animate(DEFAULT_TIMING, style({ opacity: 0 }))
      ]
    ),
  ]),
  transition('detailsOff => detailsOn', [
    query('.details', style({ background: 'none' })),
    query(
      ':enter router-outlet + *',
      [
        style({ opacity: 0 }),
        animate(DEFAULT_TIMING, style({ opacity: 1 }))
      ],
      { optional: true }
    ),
  ])
];

@Component({
  selector: 'app-main',
  template: `
    <header>
      <button mat-icon-button class="menu" *ngIf="showMenuButton$ | async" (click)="openSidenav()">
        <mat-icon>menu</mat-icon>
      </button>
      <svg width="120" height="30" version="1.1" viewBox="0 0 31.75 7.9375" xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(-69.463 -203.24)">
          <g transform="matrix(.12908 0 0 .19844 44.981 152.85)" style="fill:#fff;" aria-label="WEBFLIX">
            <path d="m210.2 254.36c4.9199 0.12122 9.8588 0.25137 14.748 0.38297 0.54119 4.5603 2.1869 16.18 2.9988 21.329 1.2313-6.9429 2.7935-16.505 3.6997-21.148-6.3246-0.17208 19.635 0.53139 13.311 0.35931-1.5019 5.0527-2.8389 11.98-4.2359 18.606-1.7295 8.2031-2.6524 11.911-4.237 18.592-2.5318 0.0826-12.183 0.40588-14.714 0.48851-1.5104-5.6967-3.1168-14.83-3.919-20.444-0.51638 4.6e-4 -0.64927 0.0139-1.1656 0.0144 0 0-0.48987 3.7746-1.1101 8.273-0.71904 5.2153-1.2362 8.8834-1.5822 12.412-5.2973 0.17182-10.641 0.33805-15.937 0.48462-1.5066-5.494-3.2241-14.504-4.4461-20.344-1.2874-6.1526-3.1101-14.147-3.9388-19.448 4.8088 0.084 8.216 0.17888 13.025 0.26284 0.3859 3.231 1.0994 7.9402 1.4727 10.436 0.40647 2.7176 1.0491 7.0007 1.585 10.509 1.7075-8.0062 2.8792-15.209 4.447-20.768v7e-5z"/>
            <path d="m247.18 255.34c9.4663 0.24831 29.439 0.68019 29.439 0.68019-0.0935 2.5616-0.0922 5.5397-0.10316 8.1721-5.0416-0.0341-10.345 0.0157-15.387-0.0184-8e-3 1.8823 0.0889 3.579 0.11357 5.4481 4.9609 0.0113 9.1666-0.19499 13.326-0.0993-5.6e-4 2.0578 0.1 5.2803 0.0994 7.3381-20.505 0.055 7.2581-0.0184-13.247 0.0365-1e-3 1.8508-3e-3 4.045-3.4e-4 5.8224 0 0 10.044-0.2824 14.953-0.31582 4e-3 2.6881 0.0469 6.1754 0.13744 8.9883-9.8867 0.192-19.55 0.44987-29.433 0.75182-0.21443-4.7166-0.12393-13.21-0.11167-19.887 0.0146-7.9457-8.1e-4 -12.667 0.21395-16.917l-4e-5 1e-4z"/>
            <path d="m279.2 256.07c6.2676 0.11274 12.498 0.20324 18.766 0.26729 6.9631 0.0712 7.5344 0.75512 9.3921 1.6028 2.5778 1.1762 4.0231 3.4137 4.0749 6.6777 0.063 3.9756-1.1081 6.7644-4.409 8.5279 3.5689 0.86243 4.9396 5.913 4.9401 9.3617 4.3e-4 3.2829-1.0649 4.8378-3.008 6.254-2.1407 1.5604-5.1993 2.2844-11.885 2.3421-5.995 0.0517-11.954 0.13326-17.949 0.24206-0.16891-5.5434-0.068-31.084 0.0776-35.275h-4e-5zm19.379 26.764c1.4754-1.5794 1.7765-4.9684-0.26713-6.6832-1.2318-1.0336-3.0058-0.89276-5.763-0.8915-5.3e-4 2.0599-0.0172 6.6129-0.012 8.7426 3.3758-0.0157 4.9398 0.0121 6.0421-1.1679zm-0.1331-13.267c1.1804-1.4343 1.4196-5.2911-0.21262-6.5523-1.5958-1.233-3.1578-0.94333-5.809-0.96035-0.0137 2.3012 0.0487 6.3388 0.048 8.5982 1.9552 3e-3 4.9709 0.13284 5.9736-1.0856z"/>
            <path d="m342.81 264.66c-4.9504 0.0183-9.9044 0.0304-14.917 0.036 0.0219 1.3716 0.0248 4.7246 0.0244 6.19 0.0467 2e-5 13.309-0.13432 13.262-0.13434-5.1e-4 1.6598 0.0991 6.0785 0.0986 7.7383-2.8898 0.0598-9.9992 0.0978-13.484 0.0892-4e-4 1.9721 0.0257 4.7897 0.0459 7.2586 0.0209 2.5522 0.0315 4.3834 0.0219 5.2674-4.221-0.0104-9.5289-0.091-13.75-0.0687-8e-3 -4.9229-0.037-10.789-0.0647-17.744-0.0265-6.6373-0.045-12.729-4e-3 -16.854 9.9928 0.025 19.701-0.0115 28.686-0.1361 0.0201 0.85037 0.0443 2.0754 0.0609 3.9339 0.0152 1.7017 0.0194 3.4859 0.019 4.424 0 0 4.2e-4 -5e-5 4.2e-4 -5e-5z"/>
            <path d="m374.35 282.24c0.0203 2.9047 6e-3 6.5457-0.148 9.7999-8.1784-0.24013-22.005-0.51669-28.671-0.69507 0.09-3.4792 0.0653-7.9622 0.0339-15.98-0.0285-7.2947-0.0291-14.65-0.14485-19.097 6.6898-0.11931 9.766-0.11142 13.872-0.22896 0.14501 2.735 0.17369 6.3956 0.16555 11.78-2e-3 1.5946-0.0367 13.873-0.0382 14.271 3.5237 0.0295 10.695 0.0777 14.93 0.15037v-2e-5z"/>
            <path d="m377 255.63c5.0868-0.0917 10.693-0.25082 15.157-0.4285 0.26861 4.8653 0.17705 13.141 0.17769 19.105 6.6e-4 6.2654 0.082 13.615-0.15421 18.297-3.2123-0.0808-11.424-0.37146-15.152-0.47881 0.18458-4.6163 0.10983-12.668 0.11501-19.636 6e-3 -8.0899 0.0462-12.714-0.14401-16.859l6e-5 1e-5z"/>
            <path d="m435.65 293.92c-5.2321-0.12404-10.273-0.25811-15.35-0.4088-1.8286-3.6721-3.8288-7.9747-5.5164-11.444-1.787 3.8142-3.601 7.8148-5.7935 11.092-4.8123-0.0807-9.9579-0.31436-14.697-0.48181 4.2068-5.4435 9.1054-13.547 12.638-19.202-3.7736-6.1682-8.5344-13.123-12.639-18.333 6.4612-0.24798 10.102-0.30287 14.935-0.46086 1.944 2.6442 4.0814 6.1818 6.4576 10.264 1.5402-3.3619 3.3978-7.3167 4.7866-10.605 2.7038-0.0319 12.274-0.30472 15.169-0.41003-3.0035 5.1755-9.4339 15.135-12.564 19.836 2.6952 3.7905 8.864 13.327 12.573 20.154v1e-5z"/>
          </g>
        </g>
      </svg>
      <nav>
        <a [routerLink]="['/home']" routerLinkActive="active" queryParamsHandling="preserve">
          <mat-icon>home</mat-icon>
          Home
        </a>
        <a [routerLink]="['/movies']" routerLinkActive="active" queryParamsHandling="preserve">
          <mat-icon>local_movies</mat-icon>
          Movies
        </a>
        <a routerLink="/shows" routerLinkActive="active" queryParamsHandling="preserve">
          <mat-icon>live_tv</mat-icon>
          TV Shows
        </a>
        <!--<a routerLink="/others" routerLinkActive="active" queryParamsHandling="preserve">Others</a>-->
      </nav>
    </header>
    <main [@mainAnimation]="getAnimationData(main)">
      <router-outlet #main="outlet"></router-outlet>
    </main>
    <div [@detailsTransitions]="getDetailsAnimation(details)" class="details-animation">
      <router-outlet name="details" #details="outlet"></router-outlet>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
    }
    .menu {
      position: absolute;
      top: 10px;
      left: 10px;
    }
    header {
      height: 60px;
      display: flex;
      flex-direction: row;
      align-items: center;
      padding: 0 60px;
      position: fixed;
      width: 100%;
      z-index: 10;
      box-sizing: border-box;
    }
    header > nav {
      display: flex;
      flex-direction: row;
      align-items: center;
    }
    svg {
      margin: 0 0.5rem;
    }
    a {
      text-decoration: none;
      display: flex;
      align-items: center;
      padding: 0 1rem;
      box-sizing: border-box;
      text-align: center;
      white-space: nowrap;
    }
    a mat-icon {
      margin-right: .5rem;
      font-size: 18px;
      height: 18px;
      width: 18px;
    }
    a:not(:first-child) {
      border-left: 1px solid;
    }
    main {
      flex-grow: 1;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      position: relative;
      padding-top: 60px;
    }
    .details-animation {
      z-index: 20;
    }
  `],
  animations: [
    mainAnimations,
    trigger('detailsTransitions', detailsTransitions)
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainComponent implements OnInit {

  showMenuButton$: Observable<boolean>;

  constructor(
    private core: CoreService
  ) {
    this.showMenuButton$ = core.getShowSidenav().pipe(map(b => !b));
  }

  ngOnInit() {}

  openSidenav() {
    this.core.openSidenav();
  }

  getAnimationData(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData.animation || 'void';
  }

  getDetailsAnimation(outlet: RouterOutlet) {
    return outlet && outlet.isActivated && outlet.activatedRoute && outlet.activatedRoute.firstChild && 'detailsOn' || 'detailsOff';
  }

/*  getDetailsAnimationData(outlet: RouterOutlet) {
    const primary =
      history.state.transition && history.state.id ?
        history.state.transition + '-' + history.state.id : '';

    const fallback = outlet
      && outlet.isActivated
      && outlet.activatedRoute
      && outlet.activatedRoute.firstChild
      && outlet.activatedRoute.firstChild.firstChild
      && outlet.activatedRoute.firstChild.firstChild.snapshot.data.animation || 'empty';

    return primary || fallback;
  }*/

}
