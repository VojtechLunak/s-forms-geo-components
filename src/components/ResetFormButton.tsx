import L, {LatLng} from "leaflet";
import React, {useEffect, useRef, useState} from "react";
import {Marker, Popup, Tooltip, useMap} from "react-leaflet";
import {Button} from "react-bootstrap";

const POSITION_CLASSES = {
    bottomleft: 'leaflet-bottom leaflet-left',
    bottomright: 'leaflet-bottom leaflet-right',
    topleft: 'leaflet-top leaflet-left',
    topright: 'leaflet-top leaflet-right',
}

interface Props {
    test: (e: any) => void,
    text: string
}

export default function ResetFormButton(props: Props) {
    const divRef = useRef(null);

    useEffect(() => {
        L.DomEvent.disableClickPropagation(divRef.current!);
    });

    return (
        <div ref={divRef} className={POSITION_CLASSES.bottomleft}>
            <div className={"leaflet-control leaflet-bar"}>
                <Button size='sm' className={'btn-custom'}
                        onClick={(e: any) => {
                            e.preventDefault();
                            e.stopPropagation();
                            props.test(e)
                        }}>{props.text}</Button>
            </div>
        </div>
    )
}