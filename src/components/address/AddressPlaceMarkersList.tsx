// @ts-nocheck
import React from "react";
import L, {LatLng} from 'leaflet';
import {CircleMarker, Marker, Popup} from "react-leaflet";
import inspire_address_api from "../../api/inspire_address_api";
import AddressPlace from "../../model/AddressPlace";
import AddressPlaceParser from "../../utils/AddressPlaceParser";
import {Button} from "react-bootstrap";
import geoFill from "../../img/geo-fill.svg";
import geoFillSelected from "../../img/geo-fill-selected.svg";


const iconAddressPlace = L.icon({
    iconUrl: "../../img/geo-fill.svg",
    iconSize: [32, 44],
    iconAnchor: [16, 44],
    popupAnchor: [0,-40]
});

const iconPickedAddressPlace = L.icon({
    iconUrl: "../../img/geo-fill-selected.svg",
    iconSize: [40, 52],
    iconAnchor: [24, 52],
    popupAnchor: [0,-40]
});


interface Props {
    coords: LatLng,
    onPick: (addressPlace: AddressPlace) => void,
    handleMarkerClick: (addressPlace: AddressPlace) => void,
    pickedAddressPlace: AddressPlace | null
}

interface State {
    inputCoords: LatLng | null
    addressPlace: AddressPlace | null
    addressPlaces: AddressPlace[] | null
}

export default class AddressPlaceMarkersList extends React.Component<Props, State> {
    private axiosAbortController = new AbortController();

    constructor(props: Props) {
        super(props);

        this.state = {
            inputCoords: null,
            addressPlace: null,
            addressPlaces: null
        };
    }

    getFeatureByPoint() {
        if (this.state.inputCoords?.lng !== this.props.coords.lng || this.state.inputCoords?.lat !== this.props.coords.lat) {
            inspire_address_api.getFeatureByPoint(this.props.coords.lat, this.props.coords.lng)
                .then(response => {
                    const addressPlace = AddressPlaceParser.parseINSPIREAddressPlace(response.data);

                    if (this.state.addressPlace == null || addressPlace?.addressCode !== this.state.addressPlace.addressCode) {
                        this.setState({
                            inputCoords: new LatLng(this.props.coords.lat, this.props.coords.lng),
                            addressPlace: addressPlace
                        });
                    }
                })
                .catch(error => {
                    console.error(error);
                });
        }
    }

    /**
     * Returns address places located in square area around the zoomed map.
     */
    getAddressesByBBOX() {
        if (this.state.inputCoords?.lng !== this.props.coords.lng || this.state.inputCoords?.lat !== this.props.coords.lat) {
            inspire_address_api.getAddressesByBBOX(this.props.coords.lng + 0.001612, this.props.coords.lat + 0.000416, this.props.coords.lng - 0.00168, this.props.coords.lat - 0.000447, {signal: this.axiosAbortController.signal})
                .then(response => {
                    const addressPlaces1 = AddressPlaceParser.parseAddressesFromBBOXRequest(response.data);

                    this.setState({
                        inputCoords: new LatLng(this.props.coords.lat, this.props.coords.lng),
                        addressPlaces: addressPlaces1
                    });

                })
                .catch(error => {
                    console.error(error);
                });
        }
    }

    componentDidMount() {
        //Try to initially render address places, when user is zoomed in accordingly.
        this.getAddressesByBBOX();
    }

    componentDidUpdate() {
        if (!this.props.pickedAddressPlace && this.state.addressPlace) {
            this.setState({
                addressPlace: null
            });
        }

        if (this.props.pickedAddressPlace && !this.state.addressPlace) {
            this.setState({
                addressPlace: this.props.pickedAddressPlace
            });
        }

        if (this.props.pickedAddressPlace && this.state.addressPlace && this.state.addressPlace?.addressCode !== this.props.pickedAddressPlace.addressCode) {
            this.setState({
                addressPlace: this.props.pickedAddressPlace
            });
        }

        //Try to request addresses in nearby area when component updates - props change => user interacts with map
        if (this.props.coords.lng != this.state.inputCoords?.lng || this.props.coords.lat != this.state.inputCoords?.lat) {
            this.getAddressesByBBOX()
        }
    }

    componentWillUnmount() {
        this.axiosAbortController.abort();
    }

    render() {
        if (!this.state.addressPlaces)
            return null;

        const addressPlacesMarkers = this.state.addressPlaces.map((addressPlace, index) => {
            return (
                <Marker key={index} position={new LatLng(addressPlace.lat, addressPlace.lng)} icon={this.state.addressPlace?.addressCode == addressPlace.addressCode ? iconPickedAddressPlace : iconAddressPlace} eventHandlers={{
                        click: () => this.props.handleMarkerClick(addressPlace),
                    }}>
                    {
                        /**
                         * Popup gets added in MapComponent due to better modifiability and control. Might create custom popup component later for needed behaviour.
                         */
                    }
                </Marker>
            )
        });

        return addressPlacesMarkers;
    }
}