import { LightningElement , wire } from 'lwc';
import { publish, subscribe, unsubscribe, MessageContext } from 'lightning/messageService';
import FILTERSCHANGEMC from '@salesforce/messageChannel/FiltersChange__c';
import ALBUMSELECTEDMC from '@salesforce/messageChannel/AlbumSelected__c';
import getPagedAlbumList from '@salesforce/apex/AlbumController.getPagedAlbumList';

const PAGE_SIZE = 9;

export default class AlbumTileList extends LightningElement {
    pageNumber = 1;
    pageSize = PAGE_SIZE;

    searchKey = '';
    albumGenre = '';

    @wire(MessageContext)
    messageContext;

    @wire(getPagedAlbumList, {
        searchKey: '$searchKey',
        albumGenre: '$albumGenre',
        pageSize: '$pageSize',
        pageNumber: '$pageNumber'
    })
    albums;

    connectedCallback() {
        this.subscription = subscribe(
            this.messageContext,
            FILTERSCHANGEMC,
            (message) => {
                this.handleFilterChange(message);
            }
        );
    }

    disconnectedCallback() {
        unsubscribe(this.subscription);
        this.subscription = null;
    }

    handleFilterChange(filters) {
        this.searchKey = filters.searchKey;
        this.albumGenre = filters.albumGenre;
    }

    handlePreviousPage() {
        this.pageNumber = this.pageNumber - 1;
    }

    handleNextPage() {
        this.pageNumber = this.pageNumber + 1;
    }

    handleAlbumSelected(event) {
        const message = { albumId: event.detail };
        publish(this.messageContext, ALBUMSELECTEDMC, message);
    }
}