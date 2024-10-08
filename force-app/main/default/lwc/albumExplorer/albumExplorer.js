import { LightningElement, api, wire } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';

// statically analyzable dynamic import
const COMPONENT_MAP = {
    tile: () => import('c/albumTileList'),
    table: () => import('c/albumListDataTable')
}

export default class AlbumExplorer extends LightningElement {
    componentConstructor;
    @api displayType = "tile";

    @wire(CurrentPageReference)
    currentPageRef;

    async connectedCallback() {
        const ctor = await COMPONENT_MAP[this.displayType]();
        this.componentConstructor = ctor.default;
    }

    get options() {
        return [
            {label: "Tile", value: "tile"},
            {label: "Table", value: "table"}
        ]
    }

    async handleChange(event) {
        this.displayType = event.detail.value;
        const ctor = await COMPONENT_MAP[this.displayType]();
        this.componentConstructor = ctor.default;
    }

    get displayType() {
        return this.currentPageRef.state.c__displayType;
    }
}