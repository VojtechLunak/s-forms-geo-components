// @ts-nocheck
import {LatLng} from "leaflet";
import React, {useState} from "react";
import {Marker, useMapEvents} from "react-leaflet";
// @ts-ignore
import icon from "leaflet/dist/images/marker-icon.png";
// @ts-ignore
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import Constants from "../../Constants";
import AddressPlace from "../../model/AddressPlace";

interface MarkerProps {
  coords: number[] | null
  pickedLocationCoords: LatLng | null,
  pickedAddressPlace: AddressPlace | null,
  handleMarkerClick: (coords: LatLng) => void,
  onChange: (lat: number, lng: number) => void
}

export default function GeneralLocationMarker(props: MarkerProps) {
  const [markerCoords, setMarkerCoords] = useState<LatLng | null>(null);

  const map = useMapEvents({
    click(e) {
      setMarkerCoords(new LatLng(e.latlng.lat, e.latlng.lng));
      props.onChange(e.latlng.lat, e.latlng.lng);
    }
  });

  if (props.pickedLocationCoords && markerCoords?.lat.toFixed(7) === props.pickedLocationCoords.lat.toFixed(7) && markerCoords.lng.toFixed(7) === props.pickedLocationCoords.lng.toFixed(7))
     return null;

  if (props.pickedAddressPlace && props.pickedAddressPlace.lat == markerCoords?.lat && props.pickedAddressPlace.lng == markerCoords?.lng)
    return null;

  return markerCoords === null ? null : (
    <Marker position={markerCoords}
            eventHandlers = {{click: () => props.handleMarkerClick(markerCoords)}}>
    </Marker>
  )
}

export function getMarkerPopupHTML(markerCoords: LatLng) {
  let htmlString = "";
  htmlString += markerCoords.lat.toFixed(7) + " z. š." + "<br/>";
  htmlString += markerCoords.lng.toFixed(7) + " z. d." + "<br/>";

  htmlString += "<button id=" + Constants.LOCATION_PICK_BUTTON + " type=\"button\" class=\"btn btn-primary popup-btn\">Vybrat souřadnice</button> <br/>";
  htmlString += "<button id=" + Constants.LOCATION_CLOSE_BUTTON + " type=\"button\" class=\"btn btn-secondary popup-btn\">Zavřít</button>";

  return htmlString;
}