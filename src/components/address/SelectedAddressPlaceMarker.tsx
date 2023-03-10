import React from "react";
import L, {LatLng} from 'leaflet';
import AddressPlace from "../../model/AddressPlace";
import {Marker} from "react-leaflet";

const iconPickedAddressPlace = L.icon({
    iconUrl: require("../../img/geo-fill-selected.svg"),
    iconSize: [36, 48],
    iconAnchor: [20, 48],
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
                        eventHandlers={{click: () => this.props.recenterMap(addressPlace)}} />
        );
    }
}