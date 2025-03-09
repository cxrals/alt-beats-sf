public with sharing class CheckoutController {
    public class OrderDetails {
        @AuraEnabled public String firstName { get; set; }
        @AuraEnabled public String lastName { get; set; }
        @AuraEnabled public String email { get; set; }
        @AuraEnabled public String phone { get; set; }
        @AuraEnabled public String street { get; set; }
        @AuraEnabled public String city { get; set; }
        @AuraEnabled public String state { get; set; }
        @AuraEnabled public String postalCode { get; set; }
        @AuraEnabled public String country { get; set; }
        @AuraEnabled public List<CartItem> items { get; set; }
        @AuraEnabled public String paymentMethod { get; set; }
    }

    public class CartItem {
        @AuraEnabled public String productId { get; set; }
        @AuraEnabled public Integer quantity { get; set; }
        @AuraEnabled public Decimal price { get; set; }
    }

    @AuraEnabled
    public static String createOrder(OrderDetails orderDetails) {
        try {
            // Create or get Account/Contact
            Account customerAccount = getOrCreateAccount(orderDetails);
            Contact customerContact = getOrCreateContact(orderDetails, customerAccount.Id);
            
            // Create Order
            Order ord = new Order(
                AccountId = customerAccount.Id,
                EffectiveDate = Date.today(),
                Status = 'Draft',
                Type = 'Vinyl Purchase',
                BillToContactId = customerContact.Id,
                ShipToContactId = customerContact.Id,
                Pricebook2Id = [SELECT Id FROM Pricebook2 WHERE IsStandard = true LIMIT 1].Id
            );
            
            // Add shipping address
            ord.ShippingStreet = orderDetails.street;
            ord.ShippingCity = orderDetails.city;
            ord.ShippingState = orderDetails.state;
            ord.ShippingPostalCode = orderDetails.postalCode;
            ord.ShippingCountry = orderDetails.country;
            
            // Copy shipping address to billing address
            ord.BillingStreet = orderDetails.street;
            ord.BillingCity = orderDetails.city;
            ord.BillingState = orderDetails.state;
            ord.BillingPostalCode = orderDetails.postalCode;
            ord.BillingCountry = orderDetails.country;
            
            insert ord;
            
            // Create Order Items
            List<OrderItem> orderItems = new List<OrderItem>();
            
            for (CartItem item : orderDetails.items) {
                OrderItem oi = new OrderItem(
                    OrderId = ord.Id,
                    Product2Id = item.productId,
                    Quantity = item.quantity,
                    UnitPrice = item.price,
                    PricebookEntryId = getPricebookEntryId(item.productId)
                );
                orderItems.add(oi);
            }
            
            insert orderItems;
            
            // Activate the order
            ord.Status = 'Activated';
            update ord;
            
            return ord.Id;
            
        } catch (Exception e) {
            throw new AuraHandledException('Error creating order: ' + e.getMessage());
        }
    }
    
    private static Account getOrCreateAccount(OrderDetails details) {
        String accountName = details.firstName + ' ' + details.lastName;
        
        List<Account> existingAccounts = [
            SELECT Id 
            FROM Account 
            WHERE Name = :accountName 
            AND BillingPostalCode = :details.postalCode
            LIMIT 1
        ];
        
        if (!existingAccounts.isEmpty()) {
            return existingAccounts[0];
        }
        
        Account newAccount = new Account(
            Name = accountName,
            BillingStreet = details.street,
            BillingCity = details.city,
            BillingState = details.state,
            BillingPostalCode = details.postalCode,
            BillingCountry = details.country,
            Phone = details.phone
        );
        
        insert newAccount;
        return newAccount;
    }
    
    private static Contact getOrCreateContact(OrderDetails details, Id accountId) {
        List<Contact> existingContacts = [
            SELECT Id 
            FROM Contact 
            WHERE AccountId = :accountId 
            AND Email = :details.email
            LIMIT 1
        ];
        
        if (!existingContacts.isEmpty()) {
            return existingContacts[0];
        }
        
        Contact newContact = new Contact(
            AccountId = accountId,
            FirstName = details.firstName,
            LastName = details.lastName,
            Email = details.email,
            Phone = details.phone,
            MailingStreet = details.street,
            MailingCity = details.city,
            MailingState = details.state,
            MailingPostalCode = details.postalCode,
            MailingCountry = details.country
        );
        
        insert newContact;
        return newContact;
    }
    
    private static Id getPricebookEntryId(Id productId) {
        PricebookEntry pbe = [
            SELECT Id 
            FROM PricebookEntry 
            WHERE Product2Id = :productId 
            AND Pricebook2.IsStandard = true 
            AND IsActive = true 
            LIMIT 1
        ];
        return pbe.Id;
    }
} 