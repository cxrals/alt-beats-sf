import { LightningElement, wire } from 'lwc';
import { publish, subscribe, unsubscribe, MessageContext }from 'lightning/messageService';
import { gql, graphql} from 'lightning/uiGraphQLApi';
import FILTERSCHANGEMC from '@salesforce/messageChannel/FiltersChange__c';
import ALBUMSELECTEDMC from '@salesforce/messageChannel/AlbumSelected__c';

const columns = [
    { label: 'Title', fieldName: 'Title__c' },
    { label: 'Genre', fieldName: 'Genre__c' },
    { label: 'Release Date', fieldName: 'Release_Date__c' },
    { label: 'Record Label', fieldName: 'Record_Label__c' },
    { label: 'Total Tracks', fieldName: 'Total_Tracks__c' },
];
const pageSize = 10;

export default class AlbumListDataTable extends LightningElement {
    pageNumber = 1;
    columns = columns;
    searchKey = '';
    albumGenre = '';
    after;

    @wire(MessageContext)messageContext;

    @wire(graphql, {
        query: gql `
            query paginatedProperties (
                $after: String
                $pageSize: Int!
                $searchKey: String
                $albumGenre: Picklist
            ){
                uiapi {
                    query {
                        Album__c(
                            where: {
                                and: [
                                    
                                        
                                            { Title__c: { like: $searchKey } }
                                        
                                    ,
                                    { Genre__c: {like: $albumGenre } }
                                ]
                            }
                            first: $pageSize
                            after: $after
                            orderBy: { Title__c: { order: DESC } }
                        ) {
                            edges {
                                node {
                                    Id
                                    Title__c {
                                        value
                                    }
                                    Genre__c {
                                        value
                                    }
                                    Release_Date__c {
                                        value
                                    }
                                    Record_Label__c {
                                        value
                                    }
                                    Total_Tracks__c {
                                        value
                                    }
                                }
                            }
                            pageInfo {
                                endCursor
                                hasNextPage
                                hasPreviousPage
                            }
                        }
                    }
                }
            }
        `,
        variables: '$variables'
    })graphqlResponse;


    get variables () {
        return {
            after: this.after || null,
            pageSize,
            searchKey: '%' + this.searchKey + '%',
            albumGenre: '%' + this.albumGenre + '%',
        };
    }

    get data() {
        return this.graphqlResponse.data?.uiapi.query.Album__c.edges.map(
            (edge) => ({
                Id: edge.node. Id,
                Title__c: edge.node.Title__c.value,
                Genre__c: edge.node.Genre__c.value,
                Release_Date__c: edge.node.Release_Date__c.value,
                Record_Label__c: edge.node.Record_Label__c.value,
                Total_Tracks__c: edge.node.Total_Tracks__c.value
            })
        );
    }

    connectedCallback() {
        this.subscription = subscribe(
            this.messageContext,
            FILTERSCHANGEMC,
            (message) => {
                this.handleFilterChange (message);
            }
        );
    }
    disconnectedCallback() {
        unsubscribe(this.subscription);
        this.subscription = null;
    }

    handleFilterChange (filters) {
        console.log(filters);
        this.searchKey = filters.searchkey;
        this.albumGenre = filters.albumGenre;
    }

    handlePropertySelected (event) {
        const message = { albumId: event.detail };
        publish(this.messageContext, ALBUMSELECTEDMC, message);
    }

    get currentPageNumber() {
        return this.totalCount === 0 ? 0: this.pageNumber;
    }
    get isFirstPage() {
        return !this.graphqlResponse.data?.uiapi.query.Album__c.pageInfo.hasPreviousPage;
    }
    get isLastPage() {
        return !this.graphqlResponse.data?.uiapi.query.Album__c.pageInfo.hasNextPage;
    }
    get totalCount() {
        return (
            this.graphqlResponse.data?.uiapi.query.Album__c.totalCount
        );
    }
}