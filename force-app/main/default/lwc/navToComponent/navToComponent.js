import { LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class NavToComponent extends NavigationMixin(LightningElement) {
    navigateToAlbumExplorer() {
        this[NavigationMixin.Navigate]({
          // Pass in pageReference
          type: 'standard__component',
          attributes: {
            componentName: 'c__albumExplorer',
          },
          state: {
            c__displayType: 'tile',
          },
        });
    }

}