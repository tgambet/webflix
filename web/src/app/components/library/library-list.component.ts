import {ChangeDetectionStrategy, Component, ElementRef, EventEmitter, OnInit, ViewChild} from '@angular/core';
import {Observable} from 'rxjs';
import {Library} from '@app/models';
import {AnimatableComponent} from '@app/components/library/library.component';
import {LibrariesService} from '@app/services/libraries.service';
import {MatDialog} from '@angular/material';
import {LibraryCreationDialogComponent} from '@app/components/dialogs/library-creation-dialog/library-creation-dialog.component';
import {FilesService} from '@app/services/files.service';

@Component({
  selector: 'app-libraries-view',
  template: `
    <mat-action-list dense #matList>
      <ng-template ngFor let-library [ngForOf]="libraries$ | async">
        <mat-list-item tabindex="0"
                       (click)="openLibrary.emit(library)"
                       (keyup.space)="openLibrary.emit(library)"
                       (keyup.enter)="openLibrary.emit(library)"
                       (keyup.arrowright)="openLibrary.emit(library)"
                       (keyup.arrowdown)="focusNext($event)"
                       (keyup.arrowup)="focusPrev($event)">
          <mat-icon matListIcon>
            video_library
          </mat-icon>
          <h3 matLine>{{ library.name }}</h3>
          <p matLine class="subtext">
            {getLibraryVideoCount(library) | async, plural,
              =0 {No video}
              =1 {1 video}
              other {{{getLibraryVideoCount(library) | async}} videos}
            }
          </p>
          <mat-icon>chevron_right</mat-icon>
          <mat-divider></mat-divider>
        </mat-list-item>
      </ng-template>
      <mat-list-item tabindex="0"
                     (keyup.arrowdown)="focusNext($event)"
                     (keyup.arrowup)="focusPrev($event)"
                     (click)="openLibraryCreationDialog()">
        <mat-icon matListIcon>
          library_add
        </mat-icon>
        <h3 matLine>Add a library</h3>
        <p matLine></p>
        <mat-divider></mat-divider>
      </mat-list-item>
    </mat-action-list>
  `,
  styles: [`
    :host {
      flex-grow: 1;
      min-width: 50%;
      display: flex;
      flex-direction: column;
    }
    mat-action-list {
      padding: 0 !important;
      flex-grow: 1;
      overflow-y: auto
    }
    mat-list-item {
      cursor: pointer;
    }
    .subtext {
      margin-top: 0.25rem !important;
      font-size: 11px !important;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LibraryListComponent implements OnInit, AnimatableComponent {

  libraries$: Observable<Library[]>;

  openLibrary: EventEmitter<Library> = new EventEmitter();

  @ViewChild('matList', { read: ElementRef })
  matList: ElementRef;

  constructor(
    private libraries: LibrariesService,
    private files: FilesService,
    private dialog: MatDialog
  ) {
    this.libraries$ = this.libraries.getAll();
  }

  ngOnInit() {
    // setTimeout(() => this.openLibraryCreationDialog());
  }

  beforeAnimation() {}

  afterAnimation() {
    // setTimeout(() => this.matList.nativeElement.children[0].focus(), 0);
  }

  focusNext(event: KeyboardEvent) {
    const target = event.target as HTMLElement;
    const next = target.nextElementSibling as HTMLElement;
    if (next) {
      next.focus();
    } else {
      const first = target.parentElement.children[0] as HTMLElement;
      first.focus();
    }
  }

  focusPrev(event: KeyboardEvent) {
    const target = event.target as HTMLElement;
    const prev = target.previousElementSibling as HTMLElement;
    if (prev) {
      prev.focus();
    } else {
      const last = target.parentElement.children[target.parentElement.children.length - 1] as HTMLElement;
      last.focus();
    }
  }

  openLibraryCreationDialog() {
    const dialogRef =
      this.dialog.open(
        LibraryCreationDialogComponent,
        { minWidth: '500px', width: '80%', maxWidth: '1000px', disableClose: true }
      );

    // dialogRef.afterClosed().subscribe(() => {});
  }

  getLibraryVideoCount(library: Library): Observable<number> {
    return this.files.getLibraryCount(library);
  }

}
