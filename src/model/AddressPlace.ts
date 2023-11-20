// @ts-nocheck
import Constants from "../Constants";

export default class AddressPlace {
    //kod adresniho mista
    readonly addressCode: number;
    readonly lat: number;
    readonly lng: number;
    //nazev ulice - optional
    readonly streetName: string | null | undefined;
    //cislo popisne
    readonly buildingIdentifier: number;
    readonly buildingIdentifierType: string;
    //cislo orientacni - optional
    readonly orientationNumber: number | null;
    readonly orientationNumberExtension: string | undefined;
    //PSC
    readonly postalCode: number;
    readonly city: string;
    //todo other properties (MOP, MOMC)

    constructor(addressCode: number, lat: number, lng: number, streetName: string | null, city: string, buildingIdentifier: number, buildingIdentifierType: string, orientationNumber: number | null, orientationNumberExtension: string | null, postalCode: number) {
        this.addressCode = addressCode;
        this.lat = lat;
        this.lng = lng;
        streetName && streetName.length != 0 ? this.streetName = streetName : null;
        this.buildingIdentifier = buildingIdentifier;
        this.buildingIdentifierType = buildingIdentifierType.trim();
        orientationNumber ? this.orientationNumber = orientationNumber : null;
        this.orientationNumberExtension = orientationNumberExtension?.trim();
        this.postalCode = postalCode;
        this.city = city.trim();
    }

    getAddressText() {
        let addressText = "";

        this.streetName != null ? addressText += this.streetName : addressText += this.city;

        addressText += " " + this.buildingIdentifier;

        this.orientationNumber != null ? addressText += "/" + this.orientationNumber : null;

        this.orientationNumberExtension != null ? addressText += this.orientationNumberExtension : null;

        addressText += ", " + this.postalCode + " " + this.city;
        return addressText.trim();
    }

    toHTMLString() {
        let html = "";
        html += (this.addressCode + "<br/>\n");

        this.streetName != null ? html += this.streetName : html += this.city;

        html += " " + this.buildingIdentifier;

        this.orientationNumber != null ? html += "/" + this.orientationNumber : null;
        this.orientationNumberExtension != null ? html += this.orientationNumberExtension : null;

        html += "<br/>\n";
        html += this.lat + " z.š.<br/>\n";
        html += this.lng + " z.d.<br/>\n";
        html += this.city + "<br/>\n";
        html += this.postalCode + "<br/>\n";

        html += "<button id=" + Constants.ADDRESS_PLACE_PICK_BUTTON + " type=\"button\" class=\"btn btn-primary popup-btn\">Vybrat adresní místo</button> <br/>";
        html += "<button id=" + Constants.ADDRESS_PLACE_CLOSE_BUTTON + " type=\"button\" class=\"btn btn-secondary popup-btn\">Zavřít</button>";

        return html;
    }
}