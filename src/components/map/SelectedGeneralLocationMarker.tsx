import L, {LatLng} from "leaflet";
import React, {useState} from "react";
import {Marker, Popup, Tooltip, useMap} from "react-leaflet";

const customIcon = new L.Icon({
    iconUrl: require('../../img/selected-location-icon.svg'),
    iconRetinaUrl: require('../../img/selected-location-icon.svg'),
    iconSize: [38, 50],
    iconAnchor: [22, 50],
    popupAnchor: [0, -44]
});

interface Props {
    coords: number[],
    onRender: (lat: number, lng: number) => void
}

export default function SelectedGeneralLocationMarker(props: Props) {
    const [lastCoords, setLastCoords] = useState<LatLng | null>(null);
    const map = useMap();

    if (!props.coords[0] || !props.coords[1])
        return null;

    let selectedPositionCoords: LatLng | null;
    try {
        selectedPositionCoords = new LatLng(props.coords[0], props.coords[1]);

        if (!lastCoords || lastCoords.lat != selectedPositionCoords.lat || lastCoords.lng != selectedPositionCoords.lng) {
            setLastCoords(selectedPositionCoords);
            props.onRender(selectedPositionCoords?.lat, selectedPositionCoords?.lng);
        }
    } catch (e) {
        console.warn("Invalid coordinates: " + props.coords[0] + " " + props.coords[1] + ". Using last valid coordinates: " + lastCoords?.lat + " " + lastCoords?.lng);
        return null;
    }

    return (
        <Marker position={selectedPositionCoords} icon={customIcon}
                eventHandlers={{click: () => map.getZoom() < 15 ? map.setView(selectedPositionCoords, 15) : null}}>
            <Tooltip className={"cursor-pointer"} direction="bottom" offset={[0, 1]} opacity={1} interactive>
                {selectedPositionCoords?.lat.toFixed(7) + " z. š."} <br/>
                {selectedPositionCoords?.lng.toFixed(7) + " z. d."} <br/>
            </Tooltip>
            <Popup closeButton={false} position={new LatLng(selectedPositionCoords?.lat + 0.00565, selectedPositionCoords?.lng)}>
                {selectedPositionCoords?.lat.toFixed(7) + " z. š."} <br/>
                {selectedPositionCoords?.lng.toFixed(7) + " z. d."} <br/>
            </Popup>
        </Marker>
    )
}