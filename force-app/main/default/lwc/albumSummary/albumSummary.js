import { LightningElement, api, wire } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import { NavigationMixin } from 'lightning/navigation';
import { subscribe, unsubscribe, MessageContext } from 'lightning/messageService';
import ALBUMSELECTEDMC from '@salesforce/messageChannel/AlbumSelected__c';

import NAME_FIELD from '@salesforce/schema/Album__c.Title__c';
import PICTURE_FIELD from '@salesforce/schema/Album__c.Picture__c';
import GENRE_FIELD from '@salesforce/schema/Album__c.Genre__c';
import RELEASE_DATE_FIELD from '@salesforce/schema/Album__c.Release_Date__c';
import RECORD_LABEL_FIELD from '@salesforce/schema/Album__c.Record_Label__c';
import TOTAL_TRACKS_FIELD from '@salesforce/schema/Album__c.Total_Tracks__c';

export default class AlbumSummary extends LightningElement {
    albumId;
    albumFields = [GENRE_FIELD, RELEASE_DATE_FIELD, RECORD_LABEL_FIELD, TOTAL_TRACKS_FIELD];
    subscription = null;

    @wire(MessageContext)
    messageContext;

    @wire(getRecord, {
        recordId: '$albumId',
        fields: [NAME_FIELD, PICTURE_FIELD]
    })
    album;

    @api
    get recordId() {
        return this.albumId;
    }

    set recordId(albumId) {
        this.albumId = albumId;
    }

    get hasNoAlbumId() {
        return this.albumId === undefined;
    }

    get albumName() {
        return getFieldValue(this.album.data, NAME_FIELD);
    }

    get pictureURL() {
        return getFieldValue(this.album.data, PICTURE_FIELD);
    }

    connectedCallback() {
        this.subscription = subscribe(
            this.messageContext,
            ALBUMSELECTEDMC,
            (message) => {
                this.handleAlbumSelected(message);
            }
        );
    }

    disconnectedCallback() {
        unsubscribe(this.subscription);
        this.subscription = null;
    }

    handleAlbumSelected(message) {
        this.albumId = message.albumId;
    }

    handleNavigateToRecord() {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.albumId,
                objectApiName: 'Album__c',
                actionName: 'view'
            }
        });
    }
}