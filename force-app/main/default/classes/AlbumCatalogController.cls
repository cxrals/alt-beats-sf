public with sharing class AlbumCatalogController {
    public class AlbumCatalogWrapper {
        @AuraEnabled public String productId { get; set; }
        @AuraEnabled public String albumId { get; set; }
        @AuraEnabled public String title { get; set; }
        @AuraEnabled public String artist { get; set; }
        @AuraEnabled public String genre { get; set; }
        @AuraEnabled public Decimal price { get; set; }
        @AuraEnabled public Date releaseDate { get; set; }
        @AuraEnabled public String imageUrl { get; set; }
        @AuraEnabled public Boolean isAvailable { get; set; }
    }

    @AuraEnabled(cacheable=true)
    public static List<AlbumCatalogWrapper> getAlbumCatalog(String searchTerm, String genre, String artist, Decimal minPrice, Decimal maxPrice) {
        // First, get the albums that match our criteria
        String albumQuery = 'SELECT Id, Title__c, Artist__r.Name__c, Genre__c, Release_Date__c, Picture__c, Product__c ' +
                          'FROM Album__c ' +
                          'WHERE Product__c != null';

        // Add filters
        List<String> conditions = new List<String>();
        
        if (String.isNotBlank(searchTerm)) {
            conditions.add('(Title__c LIKE \'%' + String.escapeSingleQuotes(searchTerm) + '%\')');
        }
        
        if (String.isNotBlank(genre)) {
            conditions.add('Genre__c = \'' + String.escapeSingleQuotes(genre) + '\'');
        }
        
        if (String.isNotBlank(artist)) {
            conditions.add('Artist__r.Name__c LIKE \'%' + String.escapeSingleQuotes(artist) + '%\'');
        }
        
        if (!conditions.isEmpty()) {
            albumQuery += ' AND ' + String.join(conditions, ' AND ');
        }
        
        albumQuery += ' ORDER BY Release_Date__c DESC NULLS LAST';
        
        // Query albums
        List<Album__c> albums = Database.query(albumQuery);
        
        // Get all Product Ids
        Set<Id> productIds = new Set<Id>();
        for(Album__c album : albums) {
            productIds.add(album.Product__c);
        }
        
        // Query PricebookEntries for all products
        Map<Id, Decimal> productPrices = new Map<Id, Decimal>();
        for(PricebookEntry pbe : [SELECT Product2Id, UnitPrice 
                                FROM PricebookEntry 
                                WHERE Product2Id IN :productIds 
                                AND Pricebook2.IsStandard = true 
                                AND IsActive = true]) {
            productPrices.put(pbe.Product2Id, pbe.UnitPrice);
        }
        
        List<AlbumCatalogWrapper> wrappers = new List<AlbumCatalogWrapper>();
        
        for (Album__c album : albums) {
            Decimal price = productPrices.get(album.Product__c);
            
            // Apply price filters
            if ((minPrice == null || (price != null && price >= minPrice)) && 
                (maxPrice == null || (price != null && price <= maxPrice))) {
                    
                AlbumCatalogWrapper wrapper = new AlbumCatalogWrapper();
                wrapper.productId = album.Product__c;
                wrapper.albumId = album.Id;
                wrapper.title = album.Title__c;
                wrapper.artist = album.Artist__r.Name__c;
                wrapper.genre = album.Genre__c;
                wrapper.releaseDate = album.Release_Date__c;
                wrapper.imageUrl = album.Picture__c;
                wrapper.isAvailable = true;
                wrapper.price = price;
                
                wrappers.add(wrapper);
            }
        }
        
        return wrappers;
    }

    @AuraEnabled(cacheable=true)
    public static List<String> getGenres() {
        List<String> genres = new List<String>();
        for (AggregateResult ar : [
            SELECT Genre__c genre
            FROM Album__c
            WHERE Genre__c != null
            GROUP BY Genre__c
            ORDER BY Genre__c
        ]) {
            genres.add((String)ar.get('genre'));
        }
        return genres;
    }

    @AuraEnabled(cacheable=true)
    public static List<String> getArtists() {
        List<String> artists = new List<String>();
        for (Artist__c artist : [
            SELECT Name__c
            FROM Artist__c
            ORDER BY Name__c
        ]) {
            artists.add(artist.Name__c);
        }
        return artists;
    }
} 