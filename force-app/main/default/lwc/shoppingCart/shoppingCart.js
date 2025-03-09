import { LightningElement, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
import {
    subscribe,
    unsubscribe,
    APPLICATION_SCOPE,
    MessageContext
} from 'lightning/messageService';
import SHOPPING_CART_CHANNEL from '@salesforce/messageChannel/ShoppingCart__c';
import { getRecord } from 'lightning/uiRecordApi';

export default class ShoppingCart extends NavigationMixin(LightningElement) {
    @track cartItems = [];
    @track isCartOpen = false;
    subscription = null;
    totalAmount = 0;

    @wire(MessageContext)
    messageContext;

    connectedCallback() {
        this.subscribeToMessageChannel();
        // Load cart from localStorage if exists
        const savedCart = localStorage.getItem('vinylShoppingCart');
        if (savedCart) {
            this.cartItems = JSON.parse(savedCart);
            this.calculateTotal();
        }
    }

    disconnectedCallback() {
        this.unsubscribeFromMessageChannel();
    }

    subscribeToMessageChannel() {
        if (!this.subscription) {
            this.subscription = subscribe(
                this.messageContext,
                SHOPPING_CART_CHANNEL,
                (message) => this.handleMessage(message),
                { scope: APPLICATION_SCOPE }
            );
        }
    }

    unsubscribeFromMessageChannel() {
        unsubscribe(this.subscription);
        this.subscription = null;
    }

    handleMessage(message) {
        if (message.cartAction === 'add') {
            this.addToCart(message.productId, message.quantity, message.productDetails);
        } else if (message.cartAction === 'remove') {
            this.removeFromCart(message.productId);
        } else if (message.cartAction === 'update') {
            this.updateQuantity(message.productId, message.quantity);
        }
    }

    addToCart(productId, quantity, productDetails) {
        const existingItem = this.cartItems.find(item => item.productId === productId);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.cartItems.push({
                productId: productId,
                quantity: quantity,
                title: productDetails.title,
                price: productDetails.price,
                imageUrl: productDetails.imageUrl
            });
        }
        
        this.cartItems = [...this.cartItems];
        this.calculateTotal();
        this.saveCartToLocalStorage();
        this.showToast('Success', 'Item added to cart', 'success');
    }

    removeFromCart(productId) {
        this.cartItems = this.cartItems.filter(item => item.productId !== productId);
        this.calculateTotal();
        this.saveCartToLocalStorage();
        this.showToast('Success', 'Item removed from cart', 'success');
    }

    updateQuantity(productId, newQuantity) {
        const item = this.cartItems.find(item => item.productId === productId);
        if (item) {
            if (newQuantity <= 0) {
                this.removeFromCart(productId);
            } else {
                item.quantity = newQuantity;
                this.cartItems = [...this.cartItems];
                this.calculateTotal();
                this.saveCartToLocalStorage();
            }
        }
    }

    calculateTotal() {
        this.totalAmount = this.cartItems.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    }

    saveCartToLocalStorage() {
        localStorage.setItem('vinylShoppingCart', JSON.stringify(this.cartItems));
    }

    handleQuantityChange(event) {
        const productId = event.target.dataset.productid;
        const newQuantity = parseInt(event.target.value, 10);
        this.updateQuantity(productId, newQuantity);
    }

    handleRemoveItem(event) {
        const productId = event.target.dataset.productid;
        this.removeFromCart(productId);
    }

    toggleCart() {
        this.isCartOpen = !this.isCartOpen;
    }

    get hasItems() {
        return this.cartItems.length > 0;
    }

    get formattedTotal() {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(this.totalAmount);
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

    handleCheckout() {
        this.toggleCart(); // Close the cart modal
        
        // Navigate to the checkout form using URL addressable
        this[NavigationMixin.Navigate]({
            type: 'standard__navItemPage',
            attributes: {
                apiName: 'Checkout'
            }
        });
    }
} 