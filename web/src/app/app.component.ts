import {Component, OnInit, ViewChild} from '@angular/core';
import {MatSidenav} from '@angular/material';
import {VideoService} from './services/video.service';
import {Observable, zip} from 'rxjs';
import {take} from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent implements OnInit {

  sideNavOpened = true;
  sideNavOpening = false;

  playing$: Observable<boolean>;
  currentTime$: Observable<number>;
  duration$: Observable<number>;
  loading$: Observable<boolean>;


  @ViewChild('sidenav')
  sidenav: MatSidenav;

  constructor(private video: VideoService) {

  }

  ngOnInit() {
    this.playing$ = this.video.getPlaying();
    this.currentTime$ = this.video.getCurrentTime();
    this.duration$ = this.video.getDuration();
    this.loading$ = this.video.getLoading();
  }

  play() {
    this.video.play();
  }

  pause() {
    this.video.pause();
  }

  seekTo(time: number) {
    this.video.seekTo(time);
  }

  seekForward() {
    zip(this.currentTime$, this.duration$).pipe(take(1)).subscribe(
      arr => {
        const currentTime = arr[0];
        const duration = arr[1];
        this.video.seekTo(Math.min(currentTime + 30, duration));
      }
    );
  }

  seekBackward() {
    this.currentTime$.pipe(take(1)).subscribe(
      currentTime => this.video.seekTo(Math.max(currentTime - 10, 0))
    );
  }

}
