// NG2
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  Input,
  OnInit,
  Optional,
  Output,
  ViewChild,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { BooleanInput } from '../../utils';

@Component({
  selector: 'novo-nav',
  template: '<ng-content></ng-content>',
})
export class NovoNavElement {
  @Input()
  theme: string = '';
  @Input()
  direction: string = '';
  @Input()
  outlet: any;
  @Input()
  router: string;
  @HostBinding('class.condensed')
  @Input()
  @BooleanInput()
  condensed: boolean = false;

  items: Array<any> = [];

  /** The index of the active tab. */
  @Input()
  get selectedIndex(): number | null {
    return this._selectedIndex;
  }

  private _selectedIndex: number | null = null;

  select(item) {
    // Deactivate all other tabs
    this._deactivateAllItems(this.items);
    item.active = true;
    if (this.outlet) {
      this.outlet.show(this.items.indexOf(item));
    }
  }

  add(item) {
    if (this.items.length === 0) {
      item.active = true;
      // item.selected.next();
    }
    this.items.push(item);
  }

  private _deactivateAllItems(items: Array<any>) {
    items.forEach((t) => {
      if (t.active === true) {
        // t.deselected.next();
      }
      t.active = false;
    });
  }
}

@Component({
  selector: 'novo-tab',
  host: {
    '(click)': 'select()',
    '[class.active]': 'active',
    '[class.disabled]': 'disabled',
    '[attr.role]': 'tab',
  },
  template: `
    <div #tablink class="novo-tab-link">
      <ng-content></ng-content>
    </div>
    <span class="indicator"></span>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NovoTabElement {
  @HostBinding('attr.role')
  public role = 'tab';

  @Input()
  active: boolean = false;

  @Input()
  color: string;

  @Input()
  @BooleanInput()
  disabled: boolean = false;

  @Output()
  activeChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  onlyText = true;
  @HostBinding('class.text-only')
  get hb_textOnly() {
    return this.onlyText;
  }

  @ViewChild('tablink')
  tablink;

  nav: any;

  constructor(nav: NovoNavElement, private el: ElementRef, private cdr: ChangeDetectorRef) {
    this.nav = nav;
    this.nav.add(this);
    const tablink = el.nativeElement.querySelector('.novo-tab-link');
    if (tablink) {
      for (let i = 0; i < tablink.childNodes.length; i++) {
        if (tablink.childNodes[i].nodeType !== Node.TEXT_NODE) this.onlyText = false;
      }
    }
  }

  select() {
    if (!this.disabled) {
      this.activeChange.emit(true);
      this.nav.select(this);
    }
    this.cdr.detectChanges();
  }
}

@Component({
  selector: 'novo-tab-button',
  host: {
    '(click)': 'select()',
    '[class.active]': 'active',
    '[class.disabled]': 'disabled',
  },
  template: '<ng-content></ng-content>',
})
export class NovoTabButtonElement {
  @HostBinding('attr.role')
  public role = 'tab';
  @Input()
  active: boolean = false;
  @Input()
  disabled: boolean = false;

  nav: any;

  constructor(nav: NovoNavElement) {
    this.nav = nav;
    this.nav.add(this);
  }

  select() {
    if (!this.disabled) {
      this.nav.select(this);
    }
  }
}

@Component({
  selector: 'novo-tab-link',
  host: {
    '(click)': 'select()',
    '[class.active]': 'active',
    '[class.disabled]': 'disabled',
  },
  template: `
    <div class="novo-tab-link">
      <ng-content></ng-content>
    </div>
    <span class="indicator"></span>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NovoTabLinkElement implements OnInit {
  @HostBinding('attr.role')
  public role = 'tab';
  @Input()
  active: boolean = false;
  @Input()
  disabled: boolean = false;
  @Input()
  spy: string;

  nav: any;

  constructor(nav: NovoNavElement, private router: Router, private cdr: ChangeDetectorRef, @Optional() private link?: RouterLink) {
    this.nav = nav;
    this.nav.add(this);
  }

  ngOnInit(): void {
    if (this.isLinkActive(this.link)) {
      this.nav.select(this);
    }
  }

  select() {
    if (!this.disabled) {
      this.nav.select(this);
      if (this.spy) {
        const el = document.querySelector(`#${this.spy}`);
        el?.scrollIntoView(true);
      }
    }
  }

  private isLinkActive(link: RouterLink) {
    return link && link.urlTree ? this.router.isActive(link.urlTree, false) : false;
  }
}

@Component({
  selector: 'novo-nav-outlet',
  template: '<ng-content></ng-content>',
})
export class NovoNavOutletElement {
  items: Array<any> = [];

  show(index) {
    const item = this.items[index];

    /**
     * Deactivates other tab items
     * @param items - deactivated items
     */
    function _deactivateAllItems(items) {
      items.forEach((t) => {
        if (t.active === true) {
          // t.deselected.next();
        }
        t.active = false;
      });
    }

    _deactivateAllItems(this.items);
    item.active = true;
  }

  /**
   * This method is called by NovoNavContentElement.
   * If any tabs have the active property set. set other tabs' active property to false.
   * This also handles if multiple are set to active and goes with the last option.
   */
  add(item) {
    if (this.items.length === 0) {
      item.active = true;
    }
    if (item.active) {
      this.items = this.items.map(savedItem => ({...savedItem, active: false}));
    }
    this.items.push(item);
  }
}

@Component({
  selector: 'novo-nav-content',
  host: {
    '[class.active]': 'active',
  },
  template: '<ng-content></ng-content>',
})
export class NovoNavContentElement {
  @Input()
  active: boolean = false;

  constructor(outlet: NovoNavOutletElement) {
    outlet.add(this);
  }
}

@Component({
  selector: 'novo-nav-header',
  host: {
    '[class.active]': 'active',
    '(click)': 'show($event)',
  },
  template: '<ng-content></ng-content>',
})
export class NovoNavHeaderElement {
  @HostBinding('attr.role')
  public role = 'tabpanel';
  @Input()
  active: boolean = false;
  @Input('for')
  forElement: any;
  outlet: any;

  constructor(outlet: NovoNavOutletElement) {
    this.active = this.active || false;
    this.outlet = outlet;
  }

  show(event?: any) {
    try {
      const INDEX = this.outlet.items.indexOf(this.forElement);
      if (INDEX > -1) {
        this.outlet.show(INDEX);
      }
    } catch (err) {
      // do nothing
    }
  }
}
