// NG2
import { async, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NovoLabelService } from '../../services/novo-label-service';
import { ComponentUtils } from '../../utils/component-utils/ComponentUtils';
import { NovoChipsModule } from './Chips.module';
// App
import { NovoRowChipElement, NovoRowChipsElement } from './RowChips';

describe('Elements: NovoRowChipElement', () => {
  let fixture;
  let component;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, NovoChipsModule],
    }).compileComponents();
    fixture = TestBed.createComponent(NovoRowChipElement);
    component = fixture.debugElement.componentInstance;
  }));

  describe('Method: onSelect(event)', () => {
    it('should not emit select event', () => {
      spyOn(component.select, 'emit');
      component.onSelect();
      expect(component.select.emit).not.toHaveBeenCalled();
    });
  });
});

describe('Elements: NovoRowChipsElement', () => {
  let fixture;
  let component;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, NovoChipsModule],
      providers: [
        { provide: ComponentUtils, useClass: ComponentUtils },
        { provide: NovoLabelService, useClass: NovoLabelService },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(NovoRowChipsElement);
    component = fixture.debugElement.componentInstance;
  }));

  describe('Method: onKeyDown(event)', () => {
    it('should not call select or remove.', () => {
      spyOn(component, 'select');
      spyOn(component, 'remove');
      component.onKeyDown();
      expect(component.select).not.toHaveBeenCalled();
      expect(component.remove).not.toHaveBeenCalled();
    });
  });
});
