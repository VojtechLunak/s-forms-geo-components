import React, {useState} from "react";
import {LayersControl, MapContainer, Popup, TileLayer, useMapEvents, Marker} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L, {LatLng, LatLngExpression, Map as LeafletMap} from 'leaflet';
// @ts-ignore
import icon from 'leaflet/dist/images/marker-icon.png';
// @ts-ignore
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import Constants from '../../Constants.js';
import Control from "react-leaflet-custom-control";
import LocateIcon from "./LocateIcon";
import CircleLayer from "./CircleLayer";
import AddressPlaceMarkersList from "../address/AddressPlaceMarkersList";
import AddressPlace from "../../model/AddressPlace";
import {Button, OverlayTrigger} from "react-bootstrap";
import SelectedAddressPlaceMarker from "../address/SelectedAddressPlaceMarker";

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [32, 44],
    iconAnchor: [16, 44]
});

L.Marker.prototype.options.icon = DefaultIcon;

const defaultPosition = Constants.DEFAULT_COORDINATES;

interface Props {
    onAddressPlacePicked: (addressPlace: AddressPlace) => void,
    onMarkerLocationPicked: (latitude: number, longitude: number) => void,
    onAddressPlaceReset: () => void
}

interface MarkerProps extends Props {
}

function LocationMarker(props: MarkerProps) {
    const [markerCoords, setMarkerCoords] = useState<LatLng | null>(null);

    const map = useMapEvents({
        click(e) {
            setMarkerCoords(new LatLng(e.latlng.lat, e.latlng.lng));
        }
    });

    return markerCoords === null ? null : (
        <Marker position={markerCoords}>
            <Popup closeButton={false} position={new LatLng(markerCoords.lat+0.000065, markerCoords.lng)}>
                {markerCoords.lat.toFixed(7) + " z. š."} <br/>
                {markerCoords.lng.toFixed(7) + " z. d."} <br/>
                <Button className={"btn-primary popup-btn"} onClick={() => {props.onMarkerLocationPicked(markerCoords.lat, markerCoords.lng)}}>Fill in the form</Button>
                <Button className={"btn-secondary popup-btn"} onClick={() => document.querySelector(".leaflet-popup")?.remove()}>Close</Button>
            </Popup>
        </Marker>
    )
}


interface MapState {
    coords: number[],
    showUserLocationCircle: boolean,
    showLocationMarker: boolean,
    pickedAddressPlace: AddressPlace | null,
    userLocation: GeolocationPosition | null,
    canRenderClosestAddressPlace: boolean
}

export default class MapComponent extends React.Component<Props, MapState> {
    private readonly mapRef: React.MutableRefObject<LeafletMap | null>;

    constructor(props: Props) {
        super(props);
        this.state = {
            coords: defaultPosition,
            showLocationMarker: true,
            showUserLocationCircle: false,
            pickedAddressPlace: null,
            userLocation: null,
            canRenderClosestAddressPlace: false
        }

        this.mapRef = React.createRef();
    }

    componentDidMount() {
        const mapEl =  document.querySelector("#map");
        // Clickable section label (Geometrie)
        let sectionParent;

        if (mapEl) {
            const cardParent = mapEl.closest("div.mb-3.card");
            sectionParent = cardParent ? cardParent.firstChild : null;
        }

        if (sectionParent) {
            sectionParent.addEventListener('click', (e) => {
                e.preventDefault();
                setTimeout(
                    () => {
                        if (this.mapRef.current) {
                            this.mapRef.current.invalidateSize();
                            this.mapRef.current.setView(new LatLng(this.state.coords[0], this.state.coords[1]));
                        }
                    }, 20
                );
            });
        }
    }

    onLocateIconClicked = () => {
        navigator.geolocation.getCurrentPosition(geolocation => {
            this.setState({
                coords: [geolocation.coords.latitude, geolocation.coords.longitude]
            });
            this.setState({ showUserLocationCircle: true, userLocation: geolocation});
            if (this.mapRef != null && this.mapRef.current != null) {
                let zoomValue;
                geolocation.coords.accuracy <= 1000 ? zoomValue = 17 : zoomValue = 15;
                this.mapRef.current.setView(new LatLng(geolocation.coords.latitude, geolocation.coords.longitude), zoomValue);
            }
        }, error => console.warn(error.message));
    }

    relocateBasedOnUserInput = (latitude: string, longitude: string) => {
        this.updateMapCenter(parseFloat(latitude), parseFloat(longitude));
    }

    onAddressPlacePicked = (addressPlace: AddressPlace) => {
        this.updateMapCenter(addressPlace.lat, addressPlace.lng);
        this.setState({
            pickedAddressPlace: addressPlace
        });
        this.mapRef.current?.closePopup();
    }

    onAddressPlaceReset() {
        if (this.state.pickedAddressPlace) {
            this.props.onAddressPlaceReset();
            this.setState({
                pickedAddressPlace: null
            });
            this.updateMapCenter(defaultPosition[0], defaultPosition[1], 7);
        }
    }

    updateMapCenter = (latitude: number, longitude: number, zoom: number = this.mapRef.current?.getZoom()) => {
        this.setState({
            coords: [latitude, longitude]
        });
        this.mapRef.current?.setView(new LatLng(latitude, longitude), zoom);
    }

    canRenderStreetMap() {
        const checkbox: HTMLInputElement | null = document.querySelector(".leaflet-control-layers-selector");

        return checkbox != null && !checkbox.checked;
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
    handleMarkerClick = (addressPlace: AddressPlace) => {
        /*this.mapRef.current?.flyTo(new LatLng(addressPlace.lat, addressPlace.lng), this.mapRef.current?.getZoom(), {
            animate: true,
            duration: 0.375
        });*/
        document.querySelector(".leaflet-popup")?.remove();
        this.mapRef.current?.openPopup(addressPlace.toHTMLString(), new LatLng(addressPlace.lat+0.000065, addressPlace.lng), {closeButton:false});
        document.getElementById(Constants.ADDRESS_PLACE_PICK_BUTTON)?.addEventListener('click', () => this.props.onAddressPlacePicked(addressPlace));
        document.getElementById(Constants.ADDRESS_PLACE_CLOSE_BUTTON)?.addEventListener('click', () => document.querySelector(".leaflet-popup")?.remove());
    }

    render() {
        if (this.state.coords) {
            return (
                <div>
                    <MapContainer id={"map"} center={new LatLng(this.state.coords[0], this.state.coords[1])} zoom={7} scrollWheelZoom={true}
                                  whenCreated={mapInstance => {
                                      this.mapRef.current = mapInstance;
                                      this.mapRef.current.addEventListener("zoomend", this.handleMapInteractionEnd);
                                      this.mapRef.current.addEventListener("moveend", this.handleMapInteractionEnd);
                                  }} >
                        <LayersControl position="bottomleft">

                            <LayersControl.Overlay name="Satellite">
                                <TileLayer
                                    url='https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}'
                                    subdomains={['mt1','mt2','mt3']}
                                    maxNativeZoom={19}
                                    maxZoom={21}
                                />
                            </LayersControl.Overlay>

                            {
                                this.canRenderStreetMap() &&
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    maxNativeZoom={19}
                                    maxZoom={21}
                                />
                            }

                            {
                                //Try to render address place near the center of the map only when zoomed 19 and more
                                this.state.canRenderClosestAddressPlace && this.mapRef.current &&
                                <AddressPlaceMarkersList coords={this.mapRef.current.getCenter()} onPick={this.props.onAddressPlacePicked} handleMarkerClick={this.handleMarkerClick} pickedAddressPlace={this.state.pickedAddressPlace}/>

                            }

                            {
                                this.state.pickedAddressPlace &&
                                <SelectedAddressPlaceMarker addressPlace={this.state.pickedAddressPlace} recenterMap={this.flyToPoint}/>
                            }

                            {
                                this.state.showLocationMarker &&
                                <LocationMarker {...this.props}/>
                            }

                            {
                                this.state.showUserLocationCircle && this.state.userLocation && <CircleLayer coords={[this.state.userLocation.coords.latitude, this.state.userLocation.coords.longitude]} radius={this.state.userLocation.coords.accuracy} color={"blue"}/>
                            }
                            <Control position='topright'>
                                <LocateIcon onClick={this.onLocateIconClicked}/>
                            </Control>

                            <Control position='bottomleft'>
                                <Button size='sm' className={'btn-custom'} onClick={() => this.onAddressPlaceReset()}>Clear form</Button>
                            </Control>

                        </LayersControl>
                    </MapContainer>
                </div>
            );
        } else
            return null;
    }
}