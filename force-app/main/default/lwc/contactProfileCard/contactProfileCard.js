import { LightningElement, api, wire } from "lwc";
import { getRecord, getFieldValue } from "lightning/uiRecordApi";

import NAME_FIELD from "@salesforce/schema/Contact.Name";
import TITLE_FIELD from "@salesforce/schema/Contact.Title";
import PHONE_FIELD from "@salesforce/schema/Contact.MobilePhone";
import EMAIL_FIELD from "@salesforce/schema/Contact.Email";
import MAILING_CITY_FIELD from "@salesforce/schema/Contact.MailingCity";
import MAILING_STATE_FIELD from "@salesforce/schema/Contact.MailingState";
import PHOTO_URL_FIELD from "@salesforce/schema/Contact.Photo_URL__c";
import INTEREST_1 from "@salesforce/schema/Contact.Interest1__c";
import INTEREST_2 from "@salesforce/schema/Contact.Interest2__c";
import INTEREST_3 from "@salesforce/schema/Contact.Interest3__c";

const fields = [
  NAME_FIELD,
  TITLE_FIELD,
  PHONE_FIELD,
  EMAIL_FIELD,
  MAILING_CITY_FIELD,
  MAILING_STATE_FIELD,
  PHOTO_URL_FIELD,
  INTEREST_1,
  INTEREST_2,
  INTEREST_3
];

export default class ContactProfileCard extends LightningElement {
  @api recordId;

  @wire(getRecord, { recordId: "$recordId", fields })
  contact;

  get isLoaded() {
    return this.contact?.data;
  }

  get error() {
    if (this.contact?.error) console.error(JSON.stringify(this.contact?.error));
    return this.contact?.error?.body?.message;
  }

  get name() {
    return getFieldValue(this.contact.data, NAME_FIELD);
  }

  get title() {
    return getFieldValue(this.contact.data, TITLE_FIELD);
  }

  get phone() {
    return getFieldValue(this.contact.data, PHONE_FIELD);
  }

  get email() {
    return getFieldValue(this.contact.data, EMAIL_FIELD);
  }

  get mailingCity() {
    return getFieldValue(this.contact.data, MAILING_CITY_FIELD);
  }

  get mailingState() {
    return getFieldValue(this.contact.data, MAILING_STATE_FIELD);
  }

  get photoURL() {
    const photoURL = getFieldValue(this.contact.data, PHOTO_URL_FIELD);
    return photoURL ? photoURL : "https://res.cloudinary.com/btahub/image/upload/v1708357811/ntbg5p1mwixury672dxy.png";
  }

  get interest1() {
    return getFieldValue(this.contact.data, INTEREST_1);
  }

  get interest2() {
    return getFieldValue(this.contact.data, INTEREST_2);
  }

  get interest3() {
    return getFieldValue(this.contact.data, INTEREST_3);
  }
}