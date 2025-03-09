public with sharing class AlbumProductManager {
    
    /**
     * Creates a Product2 record for a given Album
     * @param albumId The Id of the Album__c record
     * @return Product2 Id
     */
    public static Id createProductFromAlbum(Id albumId) {
        Album__c album = [SELECT Id, Title__c, Artist__c, Artist__r.Name__c, 
                                Genre__c, Release_Date__c, Record_Label__c 
                         FROM Album__c 
                         WHERE Id = :albumId];
        
        // Create the product
        Product2 prod = new Product2(
            Name = album.Title__c,
            Description = 'Artist: ' + album.Artist__r.Name__c + '\n' +
                         'Genre: ' + album.Genre__c + '\n' +
                         'Label: ' + album.Record_Label__c,
            ProductCode = 'VNL-' + album.Id,
            Family = 'Vinyl Records',
            IsActive = true
        );
        
        insert prod;
        
        // Update the Album with the Product reference
        album.Product__c = prod.Id;
        update album;
        
        return prod.Id;
    }
    
    /**
     * Creates a PricebookEntry for a given Product
     * @param productId The Id of the Product2 record
     * @param price The unit price for the product
     * @return PricebookEntry Id
     */
    public static Id createStandardPriceEntry(Id productId, Decimal price) {
        // Get the standard price book id
        Id standardPriceBookId = [SELECT Id FROM Pricebook2 WHERE IsStandard = true].Id;
        
        // Create the standard price book entry
        PricebookEntry standardPrice = new PricebookEntry(
            Pricebook2Id = standardPriceBookId,
            Product2Id = productId,
            UnitPrice = price,
            IsActive = true,
            UseStandardPrice = false
        );
        
        insert standardPrice;
        return standardPrice.Id;
    }
    
    /**
     * Creates an Order for vinyl purchase
     * @param accountId The Id of the purchasing Account
     * @param productIds List of Product2 Ids to purchase
     * @return Order Id
     */
    public static Id createVinylOrder(Id accountId, List<Id> productIds) {
        // Create the order
        Order ord = new Order(
            AccountId = accountId,
            EffectiveDate = Date.today(),
            Status = 'Draft',
            Pricebook2Id = [SELECT Id FROM Pricebook2 WHERE IsStandard = true].Id
        );
        
        insert ord;
        
        // Query PricebookEntries for the products
        List<PricebookEntry> entries = [SELECT Id, Product2Id, UnitPrice 
                                      FROM PricebookEntry 
                                      WHERE Product2Id IN :productIds 
                                      AND Pricebook2.IsStandard = true];
        
        // Create order items
        List<OrderItem> items = new List<OrderItem>();
        for(PricebookEntry pbe : entries) {
            items.add(new OrderItem(
                OrderId = ord.Id,
                PricebookEntryId = pbe.Id,
                Quantity = 1,
                UnitPrice = pbe.UnitPrice
            ));
        }
        
        insert items;
        return ord.Id;
    }
} 