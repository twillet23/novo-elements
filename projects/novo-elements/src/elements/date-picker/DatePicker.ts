// NG2
import { animate, state, style, transition, trigger } from '@angular/animations';
import { ChangeDetectorRef, Component, ElementRef, EventEmitter, forwardRef, HostBinding, Input, OnInit, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
// Vendor
import { isDate, isValid, parse, startOfDay } from 'date-fns';
import { NovoLabelService } from '../../services/novo-label-service';
import { BooleanInput } from '../../utils';
// APP
import { Helpers } from '../../utils/Helpers';
import { DatePickerSelectModes, modelTypes, RangeModel, rangeSelectModes } from './date-picker.types';

// Value accessor for the component (supports ngModel)
const DATE_PICKER_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => NovoDatePickerElement),
  multi: true,
};

@Component({
  selector: 'novo-date-picker',
  providers: [DATE_PICKER_VALUE_ACCESSOR],
  animations: [
    trigger('startDateTextState', [
      state(
        'startDate',
        style({
          opacity: '1.0',
        }),
      ),
      state(
        'endDate',
        style({
          opacity: '0.6',
        }),
      ),
      transition('startDate <=> endDate', animate('200ms ease-in')),
    ]),
    trigger('endDateTextState', [
      state(
        'startDate',
        style({
          opacity: '0.6',
        }),
      ),
      state(
        'endDate',
        style({
          opacity: '1.0',
        }),
      ),
      transition('startDate <=> endDate', animate('200ms ease-in')),
    ]),
    trigger('indicatorState', [
      state(
        'startDate',
        style({
          transform: 'translateX(0%)',
        }),
      ),
      state(
        'endDate',
        style({
          transform: 'translateX(100%)',
        }),
      ),
      transition('startDate <=> endDate', animate('200ms ease-in')),
    ]),
  ],
  template: `
    <div class="calendar">
      <div class="date-range-tabs" *ngIf="range" [class.week-select-mode]="weekRangeSelect">
        <span
          class="range-tab"
          (click)="toggleRangeSelect('startDate')"
          [@startDateTextState]="rangeSelectMode"
          data-automation-id="calendar-start-date"
          >{{ startDateLabel }}</span
        >
        <span
          class="range-tab"
          (click)="toggleRangeSelect('endDate')"
          [@endDateTextState]="rangeSelectMode"
          data-automation-id="calendar-end-date"
          >{{ endDateLabel }}</span
        >
        <i class="indicator" [@indicatorState]="rangeSelectMode"></i>
      </div>

      <novo-calendar
        [activeDate]="activeDate"
        [(selected)]="selection"
        (selectedChange)="updateSelection($event)"
        [mode]="mode"
        [numberOfMonths]="numberOfMonths"
        [weekStartsOn]="weekStart"
      ></novo-calendar>

      <div class="calendar-footer" [hidden]="hideFooter">
        <span (click)="setToday()" class="today" data-automation-id="calendar-today">{{ labels.today }}</span>
      </div>
    </div>
  `,
})
export class NovoDatePickerElement implements ControlValueAccessor, OnInit {
  @Input()
  minYear: string | number;
  @Input()
  maxYear: string | number;
  @Input()
  start: Date;
  @Input()
  end: Date;
  @Input()
  @BooleanInput()
  inline: boolean;
  @Input()
  weekStart: number = 0;
  @Input()
  preselected: Date[] = [];

  @Input()
  @BooleanInput()
  @HostBinding('class.hide-overflow-days')
  public hideOverflowDays: boolean = false;

  @Input()
  @BooleanInput()
  public hideFooter: boolean = false;

  // Select callback for output
  @Output()
  onSelect: EventEmitter<any> = new EventEmitter(false);

  _mode: DatePickerSelectModes = 'single';
  _range: boolean;
  _weekRangeSelect: boolean;
  _numberOfMonths: number[] = [0];

  @Input()
  get numberOfMonths(): number {
    return this._numberOfMonths.length;
  }
  set numberOfMonths(value) {
    this._numberOfMonths = Array.from(Array(Number(value)).keys());
  }

  @Input()
  get mode(): DatePickerSelectModes {
    return this._mode;
  }
  set mode(value) {
    if (this._mode !== value) {
      this._mode = value;
    }
  }
  @Input()
  get range(): boolean {
    return ['range', 'week'].includes(this.mode) || this._range;
  }
  set range(value) {
    console.warn(`'range' property is deprecated, please use 'mode="range"'.`);
    if (this._range !== value) {
      this._range = value;
      this.mode = 'range';
    }
  }
  @Input()
  get weekRangeSelect(): boolean {
    return this._mode === 'week' || this._weekRangeSelect;
  }
  set weekRangeSelect(value) {
    console.warn(`'weekRangeSelect' property is deprecated, please use 'mode="week"'.`);
    if (this._weekRangeSelect !== value) {
      this._weekRangeSelect = value;
      this.mode = 'week';
    }
  }

  @HostBinding('style.width')
  get hb_width() {
    return this._sanitizer.bypassSecurityTrustStyle(`${this.numberOfMonths * 228}px`);
  }

  model: modelTypes;
  activeDate: Date;

  _selection: Date[] = [];
  preview: Date[] = [];
  startDateLabel: string;
  endDateLabel: string;

  rangeSelectMode: rangeSelectModes = 'startDate';
  _onChange: Function = () => {};
  _onTouched: Function = () => {};

  get selection(): Date[] {
    return this._selection;
  }
  set selection(value) {
    this._selection = value ? value.filter(isDate).map((d) => startOfDay(d)) : [];
  }

  constructor(
    public labels: NovoLabelService,
    private element: ElementRef,
    private cdr: ChangeDetectorRef,
    private _sanitizer: DomSanitizer,
  ) {}

  ngOnInit() {
    // Determine the year array
    const now = new Date();
    // Set labels
    if (this.model) {
      this.modelToSelection(this.model);
    }
    if (this.selection && this.selection.length) {
      this.updateView(this.selection[0]);
    }
  }

  updateView(date) {
    const value: any = date ? new Date(date) : new Date();
    this.activeDate = new Date(value);
  }

  updateSelection(selected: Date[], fireEvents = true) {
    // Helpers.swallowEvent(event);
    this.selection = selected;

    this.startDateLabel = this.labels.formatDateWithFormat(this.selection[0], {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });

    this.endDateLabel = this.labels.formatDateWithFormat(this.selection[1], {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });

    if (fireEvents) {
      switch (this.mode) {
        case 'multiple':
          this.fireSelect();
          // Also, update the ngModel
          this._onChange(this.selection);
          this.model = this.selection;
          break;
        case 'range':
        case 'week':
          if (this.selection.filter(Boolean).length === 2) {
            this.fireRangeSelect();
            // Also, update the ngModel
            let model = {
              startDate: this.selection[0],
              endDate: this.selection[1],
            };
            this._onChange(model);
            this.model = model;
          }
          break;
        case 'single':
        default:
          this.fireSelect();
          // Also, update the ngModel
          this._onChange(this.selection[0]);
          this.model = this.selection[0];
          break;
      }
    }

    this.cdr.markForCheck();
  }

  eventData(date: Date) {
    return {
      year: date.getFullYear(),
      month: this.labels.formatDateWithFormat(date, { month: 'long' }),
      day: this.labels.formatDateWithFormat(date, { weekday: 'long' }),
      date,
    };
  }

  fireSelect() {
    if (this.mode === 'multiple') {
      this.onSelect.next(this.selection);
    } else {
      this.onSelect.next(this.eventData(this.selection[0]));
    }
  }

  fireRangeSelect() {
    // Make sure the start date is before the end date
    if (this.selection.filter(Boolean).length === 2) {
      const [start, end] = this.selection;
      this.onSelect.next({
        startDate: this.eventData(start),
        endDate: this.eventData(end),
      });
    }
  }

  setToday() {
    const tmp = new Date();
    this.updateView(tmp);
  }

  toggleRangeSelect(range: rangeSelectModes): void {
    this.rangeSelectMode = range;
    if (range === 'startDate' && this.selection.length) {
      this.updateView(this.selection[0]);
    }
    if (range === 'endDate' && this.selection.length === 2) {
      this.updateView(this.selection[1]);
    }
  }

  modelToSelection(model: modelTypes) {
    // this.selection = this._strategy.selectionFinished();
    switch (this.mode) {
      case 'multiple':
        this.selection = model as Date[];
        break;
      case 'range':
      case 'week':
        let range = this.model as RangeModel;
        this.selection = [range.startDate, range.endDate].filter(Boolean);
        break;
      case 'single':
      default:
        this.selection = [model as Date];
        break;
    }
  }

  // ValueAccessor Functions
  writeValue(model: modelTypes): void {
    this.model = model;
    if (this.mode === 'multiple') {
      this.selection = this.model as Date[];
    }
    if (Helpers.isDate(model)) {
      this.updateView(model);
      this.modelToSelection(model);
    } else if (Helpers.isString(model)) {
      const date = parse(model as any);
      if (isValid(date)) {
        this.updateView(date);
        this.modelToSelection(date);
      }
    }
  }

  registerOnChange(fn: Function): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: Function): void {
    this._onTouched = fn;
  }
}
