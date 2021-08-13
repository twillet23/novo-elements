import {
  AfterViewInit,
  ChangeDetectorRef,
  Directive,
  ElementRef,
  EventEmitter,
  forwardRef,
  Inject,
  Input,
  Optional,
  Renderer2,
} from '@angular/core';
import { COMPOSITION_BUFFER_MODE, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IMaskDirective, IMaskFactory } from 'angular-imask';
import { format, isValid, parse } from 'date-fns';
import * as IMask from 'imask';
import { NovoLabelService } from '../../../services/novo-label-service';
import { NovoInputFormat, NOVO_INPUT_FORMAT } from './base-format';

export const TIMEFORMAT_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => NovoTimeFormatDirective),
  multi: true,
};

export enum TIME_FORMATS {
  DATE = 'date',
  ISO8601 = 'iso8601',
  STRING = 'string',
}

@Directive({
  selector: 'input[timeFormat]',
  host: {
    class: 'novo-time-format',
    '(input)': '_checkInput($event)',
  },
  providers: [TIMEFORMAT_VALUE_ACCESSOR, { provide: NOVO_INPUT_FORMAT, useExisting: NovoTimeFormatDirective }],
})
export class NovoTimeFormatDirective extends IMaskDirective<any> implements NovoInputFormat, AfterViewInit {
  valueChange: EventEmitter<any> = new EventEmitter();

  @Input() military: boolean = false;
  @Input() timeFormat: TIME_FORMATS = TIME_FORMATS.DATE;

  constructor(
    private _element: ElementRef,
    _renderer: Renderer2,
    _factory: IMaskFactory,
    @Optional() @Inject(COMPOSITION_BUFFER_MODE) _compositionMode: boolean,
    private labels: NovoLabelService,
    private cdr: ChangeDetectorRef,
  ) {
    super(_element, _renderer, _factory, _compositionMode);
    const pattern = this.military ? 'HH:mm' : 'hh:mm A';
    const amFormat = this.labels.timeFormatAM.toUpperCase();
    const pmFormat = this.labels.timeFormatPM.toUpperCase();

    this.unmask = 'typed';
    this.imask = {
      mask: Date,
      pattern: this.military ? 'HH:mm' : 'hh:mm aa',
      overwrite: true,
      autofix: true,
      lazy: false,
      min: new Date(1970, 0, 1),
      max: new Date(2030, 0, 1),
      prepare: (str) => str.toUpperCase(),
      format: (value) => this.formatValue(value),
      parse: (str) => {
        const time = this.convertTime12to24(str);
        return parse(`${format(Date.now(), 'YYYY-MM-DD')}T${time}`);
      },
      blocks: {
        HH: {
          mask: IMask.MaskedRange,
          placeholderChar: '-',
          maxLength: 2,
          from: 0,
          to: 23,
        },
        hh: {
          mask: IMask.MaskedRange,
          placeholderChar: '-',
          maxLength: 2,
          from: 1,
          to: 12,
        },
        mm: {
          mask: IMask.MaskedRange,
          placeholderChar: '-',
          maxLength: 2,
          from: 0,
          to: 59,
        },
        aa: {
          mask: IMask.MaskedEnum,
          placeholderChar: '-',
          enum: ['AM', 'PM', 'am', 'pm', amFormat, pmFormat],
        },
      },
    };
  }

  _checkInput(event: InputEvent): void {
    if (document.activeElement === event.target && isFinite(Number(event.data))) {
      const text = (event.target as HTMLInputElement).value;
      if ((this.military && Number(text[0]) > 2) || (!this.military && Number(text[0]) > 1)) {
        event.preventDefault();
        const value = `0${text}`;
        (event.target as HTMLInputElement).value = value;
        // this.onChange(value);
      }
    }
  }

  normalize(value: string) {
    if (this.military) {
      return this.convertTime12to24(value);
    }
    return this.convertTime24to12(value);
  }

  formatValue(value: any): string {
    const date = parse(value);
    if (isValid(date)) {
      const pattern = this.military ? 'HH:mm' : 'hh:mm A';
      return format(date, pattern);
    }
    return this.normalize(value);
  }

  formatAsIso(date: Date): string {
    if (date && isValid(date)) {
      return format(date, 'HH:mm');
    }
    return null;
  }

  convertTime12to24(time12h: string) {
    const pmFormat = this.labels.timeFormatPM.toUpperCase();
    const [time, meridian] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') {
      hours = '00';
    }
    if (['PM', pmFormat].includes(meridian)) {
      hours = `${parseInt(hours, 10) + 12}`.padStart(2, '0');
    }
    return `${hours}:${minutes}`;
  }

  convertTime24to12(time24h: string) {
    if (time24h.length === 5) {
      const date = parse(`2020-01-01T${time24h}`);
      return format(date, 'hh:mm A');
    }
    return time24h;
  }

  writeValue(value: any) {
    super.writeValue(this.formatValue(value));
  }

  registerOnChange(fn: (date: any) => void): void {
    this.onChange = (date: any) => {
      let formatted = date;
      switch (this.timeFormat) {
        case TIME_FORMATS.ISO8601:
          formatted = this.formatAsIso(date);
          break;
        case TIME_FORMATS.STRING:
          formatted = this.formatValue(date);
          break;
        default:
          formatted = date;
          break;
      }
      this.valueChange.emit(date);
      fn(formatted);
    };
  }
}