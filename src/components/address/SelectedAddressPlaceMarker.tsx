// @ts-nocheck
import React from "react";
import L, {LatLng} from 'leaflet';
import AddressPlace from "../../model/AddressPlace";
import { Marker, Tooltip } from "react-leaflet";
import geoFillSelected from "../../img/geo-fill-selected.svg";

const iconPickedAddressPlace = L.icon({
    iconUrl: "../../img/geo-fill-selected.svg",
    iconSize: [40, 52],
    iconAnchor: [24, 52],
    popupAnchor: [0,-40]
});

interface Props {
    addressPlace: AddressPlace,
    recenterMap: (addressPlace: AddressPlace) => void
}

interface State {
    addressPlace: AddressPlace
}

export default class SelectedAddressPlaceMarker extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            addressPlace: this.props.addressPlace
        }
    }

    componentDidUpdate() {
        if (this.props.addressPlace && this.state.addressPlace?.addressCode !== this.props.addressPlace.addressCode) {
            this.setState({
                addressPlace: this.props.addressPlace
            })
        }
    }

    render() {
        if (!this.state.addressPlace)
            return null;

        const addressPlace = this.state.addressPlace;

        return (
                <Marker key={addressPlace.addressCode} position={new LatLng(addressPlace.lat, addressPlace.lng)} icon={iconPickedAddressPlace}
                        eventHandlers={{click: () => this.props.recenterMap(addressPlace)}}>
                    <Tooltip className={"cursor-pointer"} direction="bottom" offset={[0, 1]} opacity={1} interactive>
                        {addressPlace.addressCode} <br/>
                        {addressPlace.getAddressText()}
                    </Tooltip>
                </Marker>
        );
    }
}