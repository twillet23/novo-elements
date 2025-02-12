import { PropertyNameUpgradeData, TargetVersion, VersionChanges } from '@angular/cdk/schematics';

export const propertyNames: VersionChanges<PropertyNameUpgradeData> = {
  [TargetVersion.V6]: [
    {
      pr: 'https://github.com/bullhorn/novo-elements/pull/1241',
      changes: [
        {
          replace: '_onClosed',
          replaceWith: 'onClosed',
          limitedTo: { classes: ['NovoModalRef'] },
        },
      ],
    },
  ],
};
