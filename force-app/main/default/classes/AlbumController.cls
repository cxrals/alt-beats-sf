public with sharing class AlbumController {
    private static final Integer DEFAULT_PAGE_SIZE = 9;
    private static final Integer MAX_PAGE_SIZE = 50;

    @AuraEnabled(cacheable=true)
    public static PagedResult getPagedAlbumList(String searchKey, Integer pageSize, Integer pageNumber) {
        Integer safePageSize = (pageSize == null || pageSize <= 0) ? DEFAULT_PAGE_SIZE 
                              : Math.min(pageSize, MAX_PAGE_SIZE);
        Integer safePageNumber = (pageNumber == null || pageNumber <= 0) ? 1 : pageNumber;
        Integer offset = (safePageNumber - 1) * safePageSize;

        // Prevent SOQL injection by enforcing strict bind variables
        String searchPattern = (String.isNotBlank(searchKey)) ? '%' + searchKey + '%' : '%';

        PagedResult result = new PagedResult();
        result.pageSize = safePageSize;
        result.pageNumber = safePageNumber;

        // Count total items securely
        result.totalItemCount = [
            SELECT COUNT() 
            FROM Album__c 
            WHERE Title__c LIKE :searchPattern 
            OR Artist__r.Name__c LIKE :searchPattern
            WITH SECURITY_ENFORCED
        ];

        // Fetch paginated records with security enforced
        result.records = [
            SELECT Id, Title__c, Artist__r.Name__c, Genre__c, Picture__c
            FROM Album__c
            WHERE Title__c LIKE :searchPattern
            OR Artist__r.Name__c LIKE :searchPattern
            WITH SECURITY_ENFORCED
            ORDER BY Title__c DESC
            LIMIT :safePageSize
            OFFSET :offset
        ];

        return result;
    }
}
