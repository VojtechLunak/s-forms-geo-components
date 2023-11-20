// @ts-nocheck
import React from "react";
import {MapContainer, TileLayer} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L, {LatLng, LatLngExpression, Map as LeafletMap} from "leaflet";
// @ts-ignore
import icon from "leaflet/dist/images/marker-icon.png";
// @ts-ignore
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import Constants from "../../Constants.js";
import Control from "react-leaflet-custom-control";
import LocateIcon from "./LocateIcon";
import CircleLayer from "./CircleLayer";
import AddressPlaceMarkersList from "../address/AddressPlaceMarkersList";
import AddressPlace from "../../model/AddressPlace";
import {Button} from "react-bootstrap";
import SelectedAddressPlaceMarker from "../address/SelectedAddressPlaceMarker";
import GeneralLocationMarker, {getMarkerPopupHTML} from "./GeneralLocationMarker";
import SelectedGeneralLocationMarker from "./SelectedGeneralLocationMarker";
import ResetFormButton from "../ResetFormButton";

/**
 * Default icon loaded from Leaflet. Must be here in order to render default leaflet marker icon.
 */
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [32, 44],
    iconAnchor: [16, 44],
    popupAnchor: [0, -45]
});

L.Marker.prototype.options.icon = DefaultIcon;

const defaultPosition = Constants.DEFAULT_COORDINATES;

interface Props {
    onAddressPlacePicked: (addressPlace: AddressPlace) => void,
    onMarkerLocationPicked: (latitude: number, longitude: number) => void,
    onAddressPlaceReset: (event: any) => void,
    userInputCoords: number[]
}

interface MapState {
    coords: number[] | null,
    showUserLocationCircle: boolean,
    showLocationMarker: boolean,
    pickedAddressPlace: AddressPlace | null,
    userLocation: GeolocationPosition | null,
    canRenderClosestAddressPlace: boolean,
    pickedLocationCoords: LatLngExpression | null
}

export default class MapComponent extends React.Component<Props, MapState> {
    private readonly mapRef: React.MutableRefObject<LeafletMap | null>;

    constructor(props: Props) {
        super(props);
        this.state = {
            coords: [],
            showLocationMarker: true,
            showUserLocationCircle: false,
            pickedAddressPlace: null,
            pickedLocationCoords: null,
            userLocation: null,
            canRenderClosestAddressPlace: false
        }

        this.mapRef = React.createRef();
    }

    componentDidMount() {
        setTimeout(
            () => {
                if (this.mapRef.current) {
                    this.mapRef.current.invalidateSize();
                    this.mapRef.current.setView(new LatLng(Constants.DEFAULT_COORDINATES[0], Constants.DEFAULT_COORDINATES[1]));
                    this.mapRef.current.addEventListener("zoomend", this.handleMapInteractionEnd);
                    this.mapRef.current.addEventListener("moveend", this.handleMapInteractionEnd);
                }
            }, 20
        );
    }

    onLocateIconClicked = () => {
        navigator.geolocation.getCurrentPosition(geolocation => {
            this.setState({
                coords: [geolocation.coords.latitude, geolocation.coords.longitude]
            });
            this.setState({showUserLocationCircle: true, userLocation: geolocation});

            let zoomValue;
            geolocation.coords.accuracy <= 1000 ? zoomValue = 17 : zoomValue = 15;

            this.mapRef.current?.setView(new LatLng(geolocation.coords.latitude, geolocation.coords.longitude), zoomValue);
        }, error => console.warn(error.message));
    }

    relocateBasedOnUserInput = (latitude: number, longitude: number) => {
        this.updateMapCenterWhenCoordsInput(latitude, longitude);
    }

    onAddressPlacePicked = (addressPlace: AddressPlace) => {
        this.setState({
            pickedAddressPlace: addressPlace,
            pickedLocationCoords: null
        });

        this.mapRef.current?.closePopup();
        this.updateMapCenter(addressPlace.lat, addressPlace.lng, 17)
    } 

    onAddressPlaceReset() {
        if (this.state.pickedAddressPlace)
            this.setState({
                pickedAddressPlace: null
            });

        if (this.state.pickedLocationCoords)
            this.setState({
                pickedLocationCoords: null
            });

        this.handleMapInteractionEnd();
        //this.updateMapCenter(defaultPosition[0], defaultPosition[1]);
    }

    onlyDigits(num: number) {
        if (!num.toString().match("^[+-]?([0-9]*[.])?[0-9]+$")) {
            throw Error("Not valid number.");
        } else return true;
    }

    updateMapCenterWhenCoordsInput = (latitude: number, longitude: number, zoom: number = this.mapRef.current?.getZoom()) => {
        try {
            this.onlyDigits(latitude);
            this.onlyDigits(longitude);
            const newLocation = new LatLng(latitude, longitude);
            this.mapRef.current?.setView(newLocation, zoom);
            this.setState({
                coords: [latitude, longitude],
                pickedLocationCoords: newLocation
            });
        } catch (e) {
            this.setState({
                pickedLocationCoords: null,
                coords: []
            });
        }
    }

    updateMapCenter = (latitude: number, longitude: number, zoom: number = this.mapRef.current?.getZoom()) => {
        const newLocation = new LatLng(latitude, longitude);
        this.mapRef.current?.setView(newLocation, zoom);
        this.setState({
            coords: [latitude, longitude]
        });
    }

    handleMapInteractionEnd = () => {
        if (!this.mapRef.current)
            return;

        const zoom = this.mapRef.current.getZoom();
        if (zoom && zoom >= 19) {
            this.setState({
                canRenderClosestAddressPlace: true
            });
        } else {
            this.setState({
                canRenderClosestAddressPlace: false
            })
            this.mapRef.current?.closePopup();
        }
    }

    flyToPoint = (addressPlace: AddressPlace) => {
        this.mapRef.current?.setView(new LatLng(addressPlace.lat, addressPlace.lng), 18);
    }


    /**
     * Manual creation of Leaflet popup by DOM manipulation, because when Popup component was used to show address place info, it was not smooth. Might create custom popup for this specific situation.
     * @param addressPlace
     */
    handleAddressPlaceMarkerClick = (addressPlace: AddressPlace) => {
        /*this.mapRef.current?.flyTo(new LatLng(addressPlace.lat, addressPlace.lng), this.mapRef.current?.getZoom(), {
            animate: true,
            duration: 0.375
        });*/
        document.querySelector(".leaflet-popup")?.remove();
        this.mapRef.current?.openPopup(addressPlace.toHTMLString(), new LatLng(addressPlace.lat + 0.000065, addressPlace.lng), {closeButton: false});
        document.getElementById(Constants.ADDRESS_PLACE_PICK_BUTTON)?.addEventListener('click', () => this.props.onAddressPlacePicked(addressPlace));
        document.getElementById(Constants.ADDRESS_PLACE_CLOSE_BUTTON)?.addEventListener('click', () => document.querySelector(".leaflet-popup")?.remove());
    }

    handleGeneralLocationMarkerClick = (coords: LatLng) => {
        document.querySelector(".leaflet-popup")?.remove();
        this.mapRef.current?.openPopup(getMarkerPopupHTML(coords), new LatLng(coords.lat + 0.000065, coords.lng), {closeButton: false});
        document.getElementById(Constants.LOCATION_PICK_BUTTON)?.addEventListener('click', () => this.props.onMarkerLocationPicked(coords.lat, coords.lng));
        document.getElementById(Constants.LOCATION_CLOSE_BUTTON)?.addEventListener('click', () => document.querySelector(".leaflet-popup")?.remove());
    }

    onMarkerLocationPicked = (latitude: number, longitude: number) => {
        this.mapRef.current?.closePopup();
        this.setState({
            pickedAddressPlace: null,
            pickedLocationCoords: new LatLng(latitude, longitude)
        })
    }

    render() {
        return (
            <div>
                <MapContainer id={"map"}
                              center={new LatLng(Constants.DEFAULT_COORDINATES[0], Constants.DEFAULT_COORDINATES[1])}
                              zoom={7}
                              scrollWheelZoom={true}
                              ref={this.mapRef}
                >

                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        maxNativeZoom={19}
                        maxZoom={21}
                    />

                    {
                        //Try to render address place near the center of the map only when zoomed 19 and more
                        this.state.canRenderClosestAddressPlace && this.mapRef.current &&
                        <AddressPlaceMarkersList coords={this.mapRef.current.getCenter()}
                                                 onPick={this.props.onAddressPlacePicked}
                                                 handleMarkerClick={this.handleAddressPlaceMarkerClick}
                                                 pickedAddressPlace={this.state.pickedAddressPlace}/>

                    }

                    {
                        this.state.pickedAddressPlace && !this.state.canRenderClosestAddressPlace &&
                        <SelectedAddressPlaceMarker addressPlace={this.state.pickedAddressPlace}
                                                    recenterMap={this.flyToPoint}/>
                    }

                    {
                        this.state.showLocationMarker &&
                        <GeneralLocationMarker coords={this.state.coords}
                                               pickedLocationCoords={this.state.pickedLocationCoords}
                                               pickedAddressPlace={this.state.pickedAddressPlace}
                                               handleMarkerClick={this.handleGeneralLocationMarkerClick}
                                               onChange={this.updateMapCenter}/>
                    }

                    {
                        this.state.pickedLocationCoords &&
                        <SelectedGeneralLocationMarker coords={this.props.userInputCoords} onRender={this.onMarkerLocationPicked}/>
                    }

                    {
                        this.state.showUserLocationCircle && this.state.userLocation && <CircleLayer
                            coords={[this.state.userLocation.coords.latitude, this.state.userLocation.coords.longitude]}
                            radius={this.state.userLocation.coords.accuracy} color={"blue"}/>
                    }

                    <Control position='topright'>
                        <LocateIcon onClick={this.onLocateIconClicked}/>
                    </Control>

                    {
                        this.state.pickedLocationCoords &&
                        <ResetFormButton test={this.props.onAddressPlaceReset} text={"Vynulovat zeměpisné souřadnice"}/>
                    }

                    {
                        this.state.pickedAddressPlace &&
                        <ResetFormButton test={this.props.onAddressPlaceReset} text={"Vynulovat adresní místo"}/>
                    }

                </MapContainer>
            </div>
        )
    }
}