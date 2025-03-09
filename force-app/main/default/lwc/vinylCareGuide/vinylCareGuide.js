import { LightningElement, wire, track } from 'lwc';
import getVinylCareGuide from '@salesforce/apex/VinylCareGuideController.getVinylCareGuide';

export default class VinylCareGuide extends LightningElement {
    @track sections = [];
    @track selectedSection;
    @track isLoading = true;
    @track error;

    @wire(getVinylCareGuide)
    wiredCareGuide({ error, data }) {
        this.isLoading = true;
        if (data) {
            this.sections = data;
            this.selectedSection = this.sections[0];
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.sections = [];
            this.selectedSection = undefined;
        }
        this.isLoading = false;
    }

    handleSectionClick(event) {
        const sectionTitle = event.currentTarget.dataset.title;
        this.selectedSection = this.sections.find(section => section.title === sectionTitle);
        
        // Update selected class
        this.template.querySelectorAll('.slds-nav-vertical li').forEach(item => {
            if (item.dataset.title === sectionTitle) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        });
    }

    get hasSections() {
        return this.sections && this.sections.length > 0;
    }

    isSectionActive(title) {
        return this.selectedSection && this.selectedSection.title === title ? 'slds-is-active' : '';
    }

    get selectedSectionItems() {
        return this.selectedSection ? this.selectedSection.items : [];
    }
} 