import { LightningElement, wire } from 'lwc';

import { publish, MessageContext } from 'lightning/messageService';
import FILTERSCHANGEMC from '@salesforce/messageChannel/FiltersChange__c';

import { getObjectInfo, getPicklistValues } from 'lightning/uiObjectInfoApi';
import ALBUM_OBJECT from '@salesforce/schema/Album__c';
import GENRE_FIELD from '@salesforce/schema/Album__c.Genre__c';

export default class AlbumFilter extends LightningElement {
    searchKey = '';
    albumGenre = '';

    @wire(MessageContext)
    messageContext;

    @wire(getObjectInfo, { objectApiName: ALBUM_OBJECT })objectInfo;

    @wire(getPicklistValues, {
        recordTypeId: '$objectInfo.data.defaultRecordTypeId',
        fieldApiName: GENRE_FIELD
    })genrePicklistValues;

    handleReset() {
        this.searchKey = '';
        this.albumGenre = '';
        this.fireChangeEvent();
    }

    handleSearchKeyChange(event) {
        this.searchKey = event.detail.value;
        this.fireChangeEvent();
    }

    handleGenreChange(event) {
        this.albumGenre = event.detail.value;
        this.fireChangeEvent();
    }

    fireChangeEvent() {
        // Debouncing this method: Do not actually fire the event as long as this function is
        // being called within a delay of DELAY. This is to avoid a very large number of Apex
        // method calls in components listening to this event.
        window.clearTimeout(this.delayTimeout);
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.delayTimeout = setTimeout(() => {
            const filters = {
                searchKey: this.searchKey,
                albumGenre: this.albumGenre
            };
            publish(this.messageContext, FILTERSCHANGEMC, filters);
        }, DELAY);
    }

}