// Query all Album__c records that have an Artist_ID__c but no related Artist__c
List<Album__c> albumsToUpdate = [SELECT Id, Artist_ID__c, Artist__c FROM Album__c WHERE Artist_ID__c != NULL AND Artist__c = NULL];

// Create a set of Artist_ID__c values from the Album__c records
Set<String> artistIds = new Set<String>();
for (Album__c album : albumsToUpdate) {
    artistIds.add(album.Artist_ID__c);
}

// Query the Artist__c records that match the Artist_ID__c values
Map<String, Id> artistIdToArtistRecordId = new Map<String, Id>();
for (Artist__c artist : [SELECT Id, External_ID__c FROM Artist__c WHERE External_ID__c IN :artistIds]) {
    artistIdToArtistRecordId.put(artist.External_ID__c, artist.Id);
}

// Update the Album__c records with the corresponding Artist__c lookup
List<Album__c> albumsToUpdateFinal = new List<Album__c>();
for (Album__c album : albumsToUpdate) {
    if (artistIdToArtistRecordId.containsKey(album.Artist_ID__c)) {
        album.Artist__c = artistIdToArtistRecordId.get(album.Artist_ID__c);
        albumsToUpdateFinal.add(album);
    }
}

// Perform the update
if (!albumsToUpdateFinal.isEmpty()) {
    update albumsToUpdateFinal;
}