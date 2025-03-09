import { LightningElement, wire, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getAlbumCatalog from '@salesforce/apex/AlbumCatalogController.getAlbumCatalog';
import getGenres from '@salesforce/apex/AlbumCatalogController.getGenres';
import getArtists from '@salesforce/apex/AlbumCatalogController.getArtists';
import { publish, MessageContext } from 'lightning/messageService';
import SHOPPING_CART_CHANNEL from '@salesforce/messageChannel/ShoppingCart__c';

const COLUMNS = [
    {
        label: 'Album',
        fieldName: 'title',
        type: 'text',
        sortable: true
    },
    {
        label: 'Artist',
        fieldName: 'artist',
        type: 'text',
        sortable: true
    },
    {
        label: 'Genre',
        fieldName: 'genre',
        type: 'text',
        sortable: true
    },
    {
        label: 'Release Date',
        fieldName: 'releaseDate',
        type: 'date',
        sortable: true,
        typeAttributes: {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }
    },
    {
        label: 'Price',
        fieldName: 'price',
        type: 'currency',
        sortable: true,
        typeAttributes: {
            currencyCode: 'USD'
        }
    },
    {
        type: 'button',
        typeAttributes: {
            label: 'Add to Cart',
            name: 'add_to_cart',
            title: 'Add to Cart',
            disabled: { fieldName: 'notAvailable' },
            variant: 'brand'
        }
    }
];

export default class AlbumCatalog extends LightningElement {
    @track albums = [];
    @track genres = [];
    @track artists = [];
    @track searchTerm = '';
    @track selectedGenre = '';
    @track selectedArtist = '';
    @track minPrice;
    @track maxPrice;
    @track sortBy = 'releaseDate';
    @track sortDirection = 'desc';
    
    columns = COLUMNS;
    loading = true;
    error;

    @wire(MessageContext)
    messageContext;

    // Get genres for filter
    @wire(getGenres)
    wiredGenres({ error, data }) {
        if (data) {
            this.genres = data.map(genre => ({
                label: genre,
                value: genre
            }));
        } else if (error) {
            this.error = error;
        }
    }

    // Get artists for filter
    @wire(getArtists)
    wiredArtists({ error, data }) {
        if (data) {
            this.artists = data.map(artist => ({
                label: artist,
                value: artist
            }));
        } else if (error) {
            this.error = error;
        }
    }

    // Get album catalog
    @wire(getAlbumCatalog, {
        searchTerm: '$searchTerm',
        genre: '$selectedGenre',
        artist: '$selectedArtist',
        minPrice: '$minPrice',
        maxPrice: '$maxPrice'
    })
    wiredAlbums({ error, data }) {
        this.loading = true;
        if (data) {
            this.albums = [...data];
            this.error = undefined;
            this.sortData(this.sortBy, this.sortDirection);
        } else if (error) {
            this.error = error;
            this.albums = [];
            this.showToast('Error', 'Error loading albums', 'error');
        }
        this.loading = false;
    }

    // Handle search input
    handleSearch(event) {
        this.searchTerm = event.target.value;
    }

    // Handle genre filter change
    handleGenreChange(event) {
        this.selectedGenre = event.detail.value;
    }

    // Handle artist filter change
    handleArtistChange(event) {
        this.selectedArtist = event.detail.value;
    }

    // Handle price range changes
    handleMinPriceChange(event) {
        this.minPrice = event.target.value ? parseFloat(event.target.value) : null;
    }

    handleMaxPriceChange(event) {
        this.maxPrice = event.target.value ? parseFloat(event.target.value) : null;
    }

    // Handle sorting
    handleSort(event) {
        this.sortBy = event.detail.fieldName;
        this.sortDirection = event.detail.sortDirection;
        this.sortData(this.sortBy, this.sortDirection);
    }

    sortData(fieldName, direction) {
        let parseData = JSON.parse(JSON.stringify(this.albums));
        let keyValue = (a) => {
            return a[fieldName];
        };
        let isReverse = direction === 'asc' ? 1 : -1;
        parseData.sort((x, y) => {
            x = keyValue(x) ? keyValue(x) : '';
            y = keyValue(y) ? keyValue(y) : '';
            return isReverse * ((x > y) - (y > x));
        });
        this.albums = parseData;
    }

    // Handle row action (Add to Cart button)
    handleRowAction(event) {
        const action = event.detail.action;
        const row = event.detail.row;
        if (action.name === 'add_to_cart') {
            this.addToCart(row);
        }
    }

    // Add to cart functionality
    addToCart(album) {
        const message = {
            cartAction: 'add',
            productId: album.productId,
            quantity: 1,
            productDetails: {
                title: album.title,
                price: album.price,
                imageUrl: album.imageUrl
            }
        };
        
        publish(this.messageContext, SHOPPING_CART_CHANNEL, message);
    }

    // Show toast message
    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: title,
                message: message,
                variant: variant
            })
        );
    }
} 