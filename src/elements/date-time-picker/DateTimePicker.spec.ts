// NG2
import { TestBed, async } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
// APP
import { NovoDateTimePickerElement } from './DateTimePicker';
import { NovoLabelService } from '../../services/novo-label-service';
import { NovoDatePickerModule } from '../date-picker/DatePicker.module';
import { NovoTimePickerModule } from '../time-picker/TimePicker.module';

describe('Elements: NovoDateTimePickerElement', () => {
    let fixture;
    let component: NovoDateTimePickerElement;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                NovoDateTimePickerElement
            ],
            providers: [
                { provide: NovoLabelService, useClass: NovoLabelService }
            ],
            imports: [
                FormsModule,
                NovoDatePickerModule,
                NovoTimePickerModule
            ]
        }).compileComponents();
        fixture = TestBed.createComponent(NovoDateTimePickerElement);
        component = fixture.debugElement.componentInstance;
    }));

    describe('Method: toggleTimePicker()', () => {
        it('should set the componentTabState', () => {
            component.toggleTimePicker('TEST');
            expect(component.componentTabState).toEqual('TEST');
        });
    });

    describe('Method: setTimeLabels()', () => {
        it('should set the meridian correctly (PM)', () => {
            component.setTimeLabels(new Date('12/04/1987 1:00 PM'));
            expect(component.meridian).toEqual('PM');
        });
        it('should set the meridian correctly (AM)', () => {
            component.setTimeLabels(new Date('12/04/1987 1:00 AM'));
            expect(component.meridian).toEqual('AM');
        });
        it('should set the hours correctly (12hr + single digit)', () => {
            component.setTimeLabels(new Date('12/04/1987 1:00 PM'));
            expect(component.hours).toEqual('01');
        });
        it('should set the hours correctly (24hr)', () => {
            component.military = true;
            component.setTimeLabels(new Date('12/04/1987 1:00 PM'));
            expect(component.hours).toEqual('13');
            component.military = false;
        }); it('should set the hours correctly (12hr + @12PM)', () => {
            component.setTimeLabels(new Date('12/04/1987 12:00 PM'));
            expect(component.hours).toEqual('12');
        });
        it('should set the hours correctly (12hr + @12AM)', () => {
            component.setTimeLabels(new Date('12/04/1987 12:00 AM'));
            expect(component.hours).toEqual('12');
        });
        it('should set the minutes correctly (single digit)', () => {
            component.setTimeLabels(new Date('12/04/1987 1:05 PM'));
            expect(component.minutes).toEqual('05');
        });
        it('should set the minutes correctly (double digit)', () => {
            component.setTimeLabels(new Date('12/04/1987 1:20 PM'));
            expect(component.minutes).toEqual('20');
        });
    });

    describe('Method: setDateLabels()', () => {
        beforeEach(() => {
            spyOn(component.labels, 'formatDateWithFormat').and.returnValue('LABEL');
        });
        it('should set the selectedLabel', () => {
            component.setDateLabels(new Date());
            expect(component.selectedLabel).toEqual('LABEL');
        });
    });

    describe('Method: onDateSelected()', () => {
        beforeEach(() => {
            spyOn(component, 'setDateLabels');
            spyOn(component, 'onModelChange');
            spyOn(component.onSelect, 'emit');
        });
        it('should call and set everything right', () => {
            let now = new Date();
            component.onDateSelected({ date: now });
            expect(component.model).toEqual(now);
            expect(component.setDateLabels).toHaveBeenCalledWith(now);
            expect(component.onModelChange).toHaveBeenCalledWith(now);
            expect(component.onSelect.emit).toHaveBeenCalledWith({ date: now });
        });
    });

    describe('Method: onTimeSelected()', () => {
        beforeEach(() => {
            spyOn(component, 'onModelChange');
            spyOn(component, 'setTimeLabels');
            spyOn(component.onSelect, 'emit');
        });
        it('should call and set everything right', () => {
            let now = new Date();
            component.onTimeSelected({ date: now });
            expect(component.model).toEqual(now);
            expect(component.onModelChange).toHaveBeenCalledWith(now);
            expect(component.setTimeLabels).toHaveBeenCalledWith(now);
            expect(component.onSelect.emit).toHaveBeenCalledWith({ date: now });
        });
    });

    describe('Method: writeValue()', () => {
        beforeEach(() => {
            spyOn(component, 'setDateLabels');
            spyOn(component, 'setTimeLabels');
        });
        it('set the model and labels with correct date', () => {
            let now = new Date();
            component.writeValue(now);
            expect(component.model).toEqual(now);
            expect(component.setDateLabels).toHaveBeenCalled();
            expect(component.setTimeLabels).toHaveBeenCalled();
        });
        it('set the model and labels with nothing passed', () => {
            component.writeValue(undefined);
            expect(component.setDateLabels).toHaveBeenCalled();
            expect(component.setTimeLabels).toHaveBeenCalled();
        });
    });

    describe('Method: registerOnChange()', () => {
        it('should set the fn', () => {
            let test = () => { };
            component.registerOnChange(test);
            expect(component.onModelChange).toEqual(test);
        });
    });

    describe('Method: registerOnTouched()', () => {
        it('should set the fn', () => {
            let test = () => { };
            component.registerOnTouched(test);
            expect(component.onModelTouched).toEqual(test);
        });
    });
});