import {Injectable} from '@angular/core';
import {Store} from '@ngrx/store';
import * as fromStore from '../reducers';
import {Observable} from 'rxjs';
import {CloseSidenav, OpenSidenav} from '../actions/core.actions';

@Injectable(/*{
  providedIn: 'root'
}*/)
export class CoreService {

  private readonly showSidenav$: Observable<boolean>;

  constructor(private store: Store<fromStore.State>) {
    this.showSidenav$ = this.store.select(fromStore.getShowSidenav);
  }

  getShowSidenav() {
    return this.showSidenav$;
  }

  openSidenav() {
    this.store.dispatch(new OpenSidenav());
  }

  closeSidenav() {
    this.store.dispatch(new CloseSidenav());
  }

}
