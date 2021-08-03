import { Component, Input } from '@angular/core';

@Component({
  selector: 'novo-collapsable-column',
  template: `
    <h1><i [class]="icon"></i>{{header}}</h1>
    <div class="mini-check-all-container">
      <div class="check-all-checkbox">
        <i class="bhi-checkbox-empty"></i>
      </div>
      <div class="check-all-header">
       {{ entity === 'Candidate' ? 'Job Order' : 'Candidate' }}
      </div>
    </div>
    <div [dragula]="dragulaName" [dragulaModel]="dragulaModelData" class="card-container">
      <div *ngFor="let card of dragulaModelData" class="info-card">
          <span id="info-card-checkbox">
            <i class="bhi-checkbox-empty"></i>
          </span>
          <span id="info-card-menu">
            <i class="bhi-more"></i>
          </span>
          <span id="info-card-status-dot">
            <i class="bhi-circle"></i>
          </span>
          {{ entity === 'Candidate' ? card?.jobOrder?.title : card?.candidate?.firstName + ' ' + card?.candidate?.lastName }}
      </div>
    </div>
  `,
  styleUrls: ['./CollapsableColumn.component.scss']
})
export class NovoCollapsableColumnElement {
  @Input()
  header: string;
  @Input()
  set icon(icon: string) {
    if (icon) {
      this._icon = `bhi-${icon}`;
    }
  }
  get icon(): string {
    return this._icon;
  }

  private _icon: string;
  @Input()
  dragulaName: string;
  @Input()
  dragulaModelData: any;
  @Input()
  entity: 'Candidate' | 'JobOrder';
}
