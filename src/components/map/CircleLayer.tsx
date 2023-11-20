// @ts-nocheck

import React from "react";
import {Circle, LayerGroup, Tooltip} from "react-leaflet";
import {LatLng} from "leaflet";

interface Props {
    coords: number[],
    radius: number | undefined,
    color: string,
    tooltipText: string | null
}

export default class CircleLayer extends React.Component<Props, any> {
    constructor(props: Props) {
        super(props);
    }

    render() {
        return (
        <Circle
            center={new LatLng(this.props.coords[0], this.props.coords[1])}
            pathOptions={{fillColor: this.props.color}}
            radius={this.props.radius}
            className={"location-circle"}
        >
            {
                this.props.tooltipText &&
                <Tooltip className={"cursor-pointer"} direction="bottom" offset={[0, 10]} opacity={1} permanent interactive>
                    {this.props.tooltipText}
                </Tooltip>
            }
        </Circle>
        );
    }
}