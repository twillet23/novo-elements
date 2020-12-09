// NG2
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
// Vendor
import { TextMaskModule } from 'angular2-text-mask';
// APP
import { NovoPipesModule } from '../../pipes/Pipes.module';
import { NovoChipsModule } from '../chips/Chips.module';
import { NovoFieldModule } from '../field/field.module';
import { NovoIconModule } from '../icon/Icon.module';
import { NovoOverlayModule } from '../overlay/Overlay.module';
import { NovoColorInputElement } from './color-input.component';
import { NovoColorPickerComponent } from './color-picker.component';
import { NovoColorSwatchComponent } from './color-swatch.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NovoPipesModule,
    NovoFieldModule,
    NovoOverlayModule,
    TextMaskModule,
    NovoIconModule,
    NovoChipsModule,
  ],
  declarations: [NovoColorPickerComponent, NovoColorInputElement, NovoColorSwatchComponent],
  exports: [NovoColorPickerComponent, NovoColorInputElement, NovoColorSwatchComponent],
})
export class NovoColorPickerModule {}
