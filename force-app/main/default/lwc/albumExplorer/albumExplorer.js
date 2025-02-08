import { LightningElement, api, wire, track } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';

const COMPONENT_MAP = {
    tile: () => import('c/albumTileList'),
    table: () => import('c/albumListDataTable')
};

export default class AlbumExplorer extends LightningElement {
    componentConstructor;

    @track _displayType = "tile";

    @wire(CurrentPageReference)
    currentPageRef;

    @api
    get displayType() {
        return this._displayType;
    }

    set displayType(value) {
        this._displayType = value;
        this.loadComponent();
    }

    async connectedCallback() {
        this.loadComponent();
    }

    async loadComponent() {
        if (COMPONENT_MAP[this._displayType]) {
            const ctor = await COMPONENT_MAP[this._displayType]();
            this.componentConstructor = ctor.default;
        }
    }

    get options() {
        return [
            { label: "Tile", value: "tile" },
            { label: "Table", value: "table" }
        ];
    }

    async handleChange(event) {
        this.displayType = event.detail.value;
    }
}
