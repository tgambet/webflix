import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {filter, map, switchMap, take} from 'rxjs/operators';
import {CoreService} from '@app/services/core.service';
import {MoviesService} from '@app/services/movies.service';
import {FormControl} from '@angular/forms';
import {FilterService, MovieFilters} from '@app/services/filter.service';
import {Movie} from '@app/models';

@Component({
  selector: 'app-filters',
  template: `
<!--    <mat-form-field floatLabel="never">
      <mat-label>Genre</mat-label>
      <mat-select multiple>
        <mat-option value="test">
          Test
        </mat-option>
      </mat-select>
    </mat-form-field>-->
    <ng-container *ngIf="showMovieFilters$ | async">
      <mat-form-field floatLabel="never">
        <mat-label>Rating</mat-label>
        <mat-select [formControl]="rating">
          <mat-option>All</mat-option>
          <mat-option value="90">90% and above</mat-option>
          <mat-option value="80">80% and above</mat-option>
          <mat-option value="70">70% and above</mat-option>
          <mat-option value="60">60% and above</mat-option>
        </mat-select>
      </mat-form-field>
      <mat-form-field floatLabel="never">
        <mat-label>Year</mat-label>
        <mat-select multiple [formControl]="years">
          <mat-option *ngFor="let year of years$ | async" [value]="year">
            {{ year }}
          </mat-option>
        </mat-select>
      </mat-form-field>
      <mat-form-field floatLabel="never">
        <mat-label>Language</mat-label>
        <mat-select multiple [formControl]="languages">
          <mat-option *ngFor="let language of languages$ | async" [value]="language.code">
            {{ language.name }}
          </mat-option>
        </mat-select>
      </mat-form-field>
      <mat-form-field floatLabel="never">
        <mat-label>Tags</mat-label>
        <mat-select multiple [formControl]="tags">
          <mat-option *ngFor="let tag of tags$ | async" [value]="tag">
            {{ tag }}
          </mat-option>
        </mat-select>
      </mat-form-field>
    </ng-container>
  `,
  styles: [`
    mat-form-field {
      margin: 0 0 0 1rem;
      height: 60px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FiltersComponent implements OnInit {

  showMovieFilters$: Observable<boolean>;

  rating = new FormControl('');
  years = new FormControl('');
  languages = new FormControl('');
  tags = new FormControl('');

  years$: Observable<string[]>;
  languages$: Observable<{ code: string; name: string }[]>;
  tags$: Observable<string[]>;

  static isWithinRating(movie: Movie, filters: MovieFilters): boolean {
    return movie.vote_average * 10 >= (filters.rating || 0);
  }

  static isWithinYears(movie: Movie, filters: MovieFilters): boolean {
    return filters.years.length === 0 || filters.years.includes(movie.release_date.substring(0, 4));
  }

  static isWithinLanguages(movie: Movie, filters: MovieFilters): boolean {
    return filters.languages.length === 0 || filters.languages.includes(movie.original_language);
  }

  static isWithinTags(movie: Movie, filters: MovieFilters): boolean {
    return filters.tags.length === 0 ||
      filters.tags.every(tag => movie.tags.indexOf(tag) > -1);
  }

  constructor(
    private core: CoreService,
    private movies: MoviesService,
    private filters: FilterService
  ) {
    this.showMovieFilters$ = this.filters.getShowFilters();
  }

  ngOnInit(): void {
    this.years$ = this.filters.getFilters().pipe(
      switchMap(filters => this.movies.getAll().pipe(
        map(movies => movies.filter(movie =>
          FiltersComponent.isWithinRating(movie, filters) &&
          FiltersComponent.isWithinLanguages(movie, filters) &&
          FiltersComponent.isWithinTags(movie, filters)
        )),
        map(movies => movies.map(movie => movie.release_date.substr(0, 4))),
        map(years => Array.from(new Set(years)).sort().reverse())
      ))
    );
    this.tags$ = this.filters.getFilters().pipe(
      switchMap(filters => this.movies.getAll().pipe(
        map(movies => movies.filter(movie =>
          FiltersComponent.isWithinRating(movie, filters) &&
          FiltersComponent.isWithinLanguages(movie, filters) &&
          FiltersComponent.isWithinYears(movie, filters) &&
          FiltersComponent.isWithinTags(movie, filters)
        )),
        map(movies => movies.map(movie => movie.tags).reduce((previous, current) => [...previous, ...current], [])),
        map(tags => Array.from(new Set(tags)).sort())
      ))
    );
    this.languages$ = this.core.getConfig().pipe(
      filter(c => !!c),
      take(1),
      switchMap(config => this.filters.getFilters().pipe(
        switchMap(filters => this.movies.getAll().pipe(
          map(movies => movies.filter(movie =>
            FiltersComponent.isWithinRating(movie, filters) &&
            FiltersComponent.isWithinTags(movie, filters) &&
            FiltersComponent.isWithinYears(movie, filters)
          )),
          map(movies => movies.map(movie => movie.original_language)),
          map(codes => codes.map(code => {
            const language = config.languages.find(l => l.iso_639_1 === code);
            return { code: language.iso_639_1, name: language.english_name };
          })),
          map(languages =>
            Array.from(new Set(languages.map(l => l.code))).map(
              code => ({ code, name: languages.find(l => l.code === code).name })
            ).sort((a, b) => a.name.localeCompare(b.name))
          )
        ))
      ))
    );

    this.rating.valueChanges.subscribe(
      val => this.filters.setRating(val)
    );
    this.years.valueChanges.subscribe(
      val => this.filters.setYears(val)
    );
    this.languages.valueChanges.subscribe(
      val => this.filters.setLanguages(val)
    );
    this.tags.valueChanges.subscribe(
      val => this.filters.setTags(val)
    );

    this.filters.getRating().subscribe(
      val => this.rating.value !== val ?
        this.rating.setValue(val) : {}
    );
    this.filters.getYears().subscribe(
      val => this.years.value !== val ?
        this.years.setValue(val) : {}
    );
    this.filters.getLanguages().subscribe(
      val => this.languages.value !== val ?
        this.languages.setValue(val) : {}
    );
    this.filters.getTags().subscribe(
      val => this.tags.value !== val ?
        this.tags.setValue(val) : {}
    );

  }

}
