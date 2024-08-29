import { LightningElement, api } from 'lwc';
import FORM_FACTOR from '@salesforce/client/formFactor';
import { NavigationMixin } from 'lightning/navigation';

export default class AlbumTile extends LightningElement {
    @api album;
    formFactor = FORM_FACTOR;
    
    handleAlbumSelected() {
        if (FORM_FACTOR === 'Small') {
            // In Phones, navigate to album record page directly
            this[NavigationMixin.Navigate]({
                type: 'standard__recordPage',
                attributes: {
                    recordId: this.album.Id,
                    objectApiName: 'Album__c',
                    actionName: 'view'
                }
            });
        } else {
            // In other devices, send message to other cmps on the page
            const selectedEvent = new CustomEvent('selected', {
                detail: this.album.Id
            });
            this.dispatchEvent(selectedEvent);
        }
    }

    get backgroundImageStyle() {
        console.log('this.album');
        console.log(this.album);
        console.log('this.album.Picture__c');
        console.log(this.album.Picture__c);
        return `background-image:url(${this.album.Picture__c})`;
    }
}