// @ts-nocheck
import AddressPlace from "../model/AddressPlace";

export default class AddressPlaceParser {
    /**
     * Function to parse GML response sent from INSPIRE AD endpoint with GetFeatureByPoint request.
     * @param gml response data
     * @param isAlreadyParsed true when address xml objects are already parsed; default false
     * @param traceOn true if detailed logging is wanted; default false
     */
    static parseINSPIREAddressPlace(gml: string, isAlreadyParsed = false, traceOn = false): AddressPlace | null {
        let text: any = gml;

        if (!isAlreadyParsed) {
            const parser = new DOMParser();
            text = parser.parseFromString(gml, "text/xml");
        }

        const featureCollection = text.getElementsByTagName("FeatureCollection")[0];
        if (featureCollection && featureCollection.getAttribute("numberReturned") === "0") {
            console.warn("No address place found!");
            return null;
        }

        const coordsString = text.getElementsByTagName("gml:pos")[0].textContent;
        if (!coordsString)
            throw new Error("Coordinates could not be parsed from INSPIRE AD GML response.")
        let coords: string[] = coordsString.split(" ");

        const addressComponentsArray = [...text.getElementsByTagName("ad:component")];
        const addressTitleComponent = addressComponentsArray.find(component => {
            if (component.getAttribute("xlink:href")?.includes("Id=TF."))
                return component;
        });
        if (!addressTitleComponent && traceOn)
            console.warn("Address title could not be parsed from INSPIRE AD GML response.")

        let addressCode = text.getElementsByTagName("base:localId")[0].textContent;
        if (!addressCode)
            throw new Error("Address code could not be parsed from INSPIRE AD GML response.")
        addressCode = addressCode.substring(3);

        const cityComponent = addressComponentsArray.find(component => {
            if (component.getAttribute("xlink:href")?.includes("Id=AU.4."))
                return component;
        });
        if (!cityComponent)
            throw new Error("City could not be parsed from INSPIRE AD GML response.");


        const postalCodeComponent = addressComponentsArray.find(component => {
            if (component.getAttribute("xlink:href")?.includes("Id=PD."))
                return component;
        });
        if (!postalCodeComponent)
            throw new Error("Postal code could not be parsed from INSPIRE AD GML response.");


        const locatorDesignatorArray = [...text.getElementsByTagName("ad:LocatorDesignator")];
        const buildingIdentifierComponent = locatorDesignatorArray.find(component => {
            const typeComponent = component.getElementsByTagName("ad:type")[0];
            if (typeComponent && typeComponent.getAttribute("xlink:title") === "buildingIdentifier") {
                return component.getElementsByTagName("ad:designator")[0];
            }
        });
        if (!buildingIdentifierComponent)
            throw new Error("Building identifier could not be parsed from INSPIRE AD GML response.");

        const buildingIdentifierPrefixComponent = locatorDesignatorArray.find(component => {
            const typeComponent = component.getElementsByTagName("ad:type")[0];
            if (typeComponent && typeComponent.getAttribute("xlink:title") === "buildingIdentifierPrefix") {
                return component.getElementsByTagName("ad:designator")[0];
            }
        });
        if (!buildingIdentifierPrefixComponent)
            throw new Error("Building identifier prefix could not be parsed from INSPIRE AD GML response.");


        const addressNumberComponent = locatorDesignatorArray.find(component => {
            const typeComponent = component.getElementsByTagName("ad:type")[0];
            if (typeComponent && typeComponent.getAttribute("xlink:title") === "addressNumber") {
                return component.getElementsByTagName("ad:designator")[0];
            }
        });

        let addressNumber: number | null = null;
        if (!addressNumberComponent && traceOn) {
            console.warn("Address number could not be parsed from INSPIRE AD GML response.");
        }

        if (addressNumberComponent) {
            addressNumber = parseInt(addressNumberComponent.textContent);
        }

        const addressNumberExtensionComponent = locatorDesignatorArray.find(component => {
            const typeComponent = component.getElementsByTagName("ad:type")[0];
            if (typeComponent && typeComponent.getAttribute("xlink:title") === "addressNumberExtension") {
                return component.getElementsByTagName("ad:designator")[0];
            }
        });

        if (!addressNumberExtensionComponent && traceOn) {
            console.warn("Address number extension number could not be parsed from INSPIRE AD GML response.");
        }

        return new AddressPlace(parseInt(addressCode), parseFloat(coords[1]), parseFloat(coords[0]), addressTitleComponent?.getAttribute("xlink:title"),
            cityComponent.getAttribute("xlink:title"), parseInt(buildingIdentifierComponent.textContent), buildingIdentifierPrefixComponent.textContent, addressNumber, addressNumberExtensionComponent?.textContent, parseInt(postalCodeComponent.getAttribute("xlink:title")));
    }

    static parseAddressesFromBBOXRequest(gml: string): AddressPlace[] {
        const addressPlaces: AddressPlace[] = [];
        const parser = new DOMParser();
        let text = parser.parseFromString(gml, "text/xml");

        const addressPlacesGML = [...text.getElementsByTagName("ad:Address")];
        addressPlacesGML.map(addressPlaceGML => addressPlaces.push(this.parseINSPIREAddressPlace(addressPlaceGML, true)));

        return addressPlaces;
    }

    static parseAddressFromSpringBackend(addressPlace: object): AddressPlace {
        const addressText = addressPlace.addressText;
        const code = addressPlace.admCode;
        const buildingIdentifierPrefix = addressPlace.buildingType;
        const cityName = addressPlace.cityName;
        const lat = addressPlace.coordinatesLatLon.x;
        const lng = addressPlace.coordinatesLatLon.y;
        const districtName = addressPlace.districtName;
        const buildingIdentifier = addressPlace.houseNumber;
        const orientationNumber = addressPlace.orientationalNumber;
        const orientationNumberExtension = addressPlace.orientationalNumberLetter;
        const postalCode = addressPlace.postalCode;
        const streetName = addressPlace.streetName;

        return new AddressPlace(code, lat, lng, streetName, cityName, buildingIdentifier, buildingIdentifierPrefix, orientationNumber, orientationNumberExtension, postalCode);
    }
}