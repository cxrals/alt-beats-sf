import { LightningElement, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
import { CurrentPageReference } from 'lightning/navigation';
import createOrder from '@salesforce/apex/CheckoutController.createOrder';

const PAYMENT_METHODS = [
    { label: 'Credit Card', value: 'credit_card' },
    { label: 'PayPal', value: 'paypal' },
    { label: 'Bank Transfer', value: 'bank_transfer' }
];

export default class CheckoutForm extends NavigationMixin(LightningElement) {
    @track currentStep = '1';
    @track orderDetails = {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        paymentMethod: '',
        items: []
    };
    
    @track showSpinner = false;
    paymentMethods = PAYMENT_METHODS;

    @wire(CurrentPageReference)
    pageRef;
    
    connectedCallback() {
        // Load cart items from localStorage
        const savedCart = localStorage.getItem('vinylShoppingCart');
        if (savedCart) {
            const cartItems = JSON.parse(savedCart);
            this.orderDetails.items = cartItems.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.price
            }));
        } else {
            // If no items in cart, navigate back to catalog
            this[NavigationMixin.Navigate]({
                type: 'standard__navItemPage',
                attributes: {
                    apiName: 'Album_Catalog'
                }
            });
        }
    }
    
    get steps() {
        return [
            { label: 'Shipping Details', value: '1' },
            { label: 'Payment Method', value: '2' },
            { label: 'Order Summary', value: '3' }
        ];
    }
    
    get isStep1() {
        return this.currentStep === '1';
    }
    
    get isStep2() {
        return this.currentStep === '2';
    }
    
    get isStep3() {
        return this.currentStep === '3';
    }
    
    get cartTotal() {
        return this.orderDetails.items.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    }
    
    get formattedTotal() {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(this.cartTotal);
    }
    
    handleInputChange(event) {
        const field = event.target.name;
        this.orderDetails[field] = event.target.value;
    }
    
    validateShippingDetails() {
        const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'street', 'city', 'state', 'postalCode', 'country'];
        let isValid = true;
        
        // Get all lightning-input fields
        const inputFields = this.template.querySelectorAll('lightning-input');
        inputFields.forEach(field => {
            if (requiredFields.includes(field.name)) {
                // Check validity and report
                const fieldValid = field.reportValidity();
                isValid = isValid && fieldValid;
            }
        });
        
        return isValid;
    }
    
    validatePaymentMethod() {
        if (!this.orderDetails.paymentMethod) {
            this.showToast('Error', 'Please select a payment method', 'error');
            return false;
        }
        return true;
    }
    
    handleNext() {
        if (this.currentStep === '1') {
            if (this.validateShippingDetails()) {
                this.currentStep = '2';
            }
        } else if (this.currentStep === '2') {
            if (this.validatePaymentMethod()) {
                this.currentStep = '3';
            }
        }
    }
    
    handlePrevious() {
        if (this.currentStep === '2') {
            this.currentStep = '1';
        } else if (this.currentStep === '3') {
            this.currentStep = '2';
        }
    }
    
    async handlePlaceOrder() {
        try {
            this.showSpinner = true;
            
            const orderId = await createOrder({ orderDetails: this.orderDetails });
            
            // Clear the cart
            localStorage.removeItem('vinylShoppingCart');
            
            // Show success message
            this.showToast('Success', 'Order placed successfully!', 'success');
            
            // Navigate to order detail page
            this[NavigationMixin.Navigate]({
                type: 'standard__recordPage',
                attributes: {
                    recordId: orderId,
                    objectApiName: 'Order',
                    actionName: 'view'
                }
            });
            
        } catch (error) {
            this.showToast('Error', error.body.message, 'error');
        } finally {
            this.showSpinner = false;
        }
    }
    
    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: title,
                message: message,
                variant: variant
            })
        );
    }

    handleCancelCheckout() {
        // Navigate back to catalog
        this[NavigationMixin.Navigate]({
            type: 'standard__navItemPage',
            attributes: {
                apiName: 'Album_Catalog'
            }
        });
    }
} 