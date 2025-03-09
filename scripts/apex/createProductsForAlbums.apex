// First, ensure standard pricebook is active
Pricebook2 standardPb = [SELECT Id, IsActive FROM Pricebook2 WHERE IsStandard = true LIMIT 1];
if (!standardPb.IsActive) {
    standardPb.IsActive = true;
    update standardPb;
    System.debug('Standard Pricebook has been activated');
}

// Query all Albums
List<Album__c> albums = [
    SELECT Id, Title__c, Artist__c, Artist__r.Name__c, 
           Genre__c, Release_Date__c, Record_Label__c
    FROM Album__c
];

System.debug('Found ' + albums.size() + ' albums to process');

// Create products for each album
List<Id> createdProductIds = new List<Id>();
Integer successCount = 0;
Integer errorCount = 0;

// Process albums in batches to avoid governor limits
for(Album__c album : albums) {
    try {
        // Create the product and price book entry
        Id productId = AlbumProductManager.createProductFromAlbum(album.Id);
        
        // Create a standard price book entry with a default price of $29.99
        AlbumProductManager.createStandardPriceEntry(productId, 29.99);
        
        createdProductIds.add(productId);
        successCount++;
        
        System.debug('Created Product2 and PricebookEntry for Album: ' + album.Title__c);
    } catch(Exception e) {
        errorCount++;
        System.debug('Error processing Album ' + album.Title__c + ': ' + e.getMessage());
    }
}

// Final summary
System.debug('Process completed:');
System.debug('Successfully created ' + successCount + ' products');
System.debug('Failed to create ' + errorCount + ' products');

// Query and display the created products for verification
if(!createdProductIds.isEmpty()) {
    List<Product2> createdProducts = [
        SELECT Id, Name, ProductCode, Description, Family
        FROM Product2
        WHERE Id IN :createdProductIds
    ];
    
    System.debug('Created Products:');
    for(Product2 prod : createdProducts) {
        System.debug('Product Name: ' + prod.Name + ', Code: ' + prod.ProductCode);
    }
} 