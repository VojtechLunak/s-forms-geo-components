// @ts-nocheck

import React from 'react';
import {ConfigurationContext, FormQuestionsContext, Question, Constants as SConstants} from '@kbss-cvut/s-forms';
import Constants from '../Constants';
import Utils from "../utils/Utils";
import MapComponent from "./map/MapComponent";
import PropTypes from "prop-types";
import CoordinateComponent from "./coordinates/CoordinateComponent";
import AddressPlace from "../model/AddressPlace";
import AddressComponent from "./address/AddressComponent";
import AddressTextComponent from "./address/AddressTextComponent";
import spring_backend_api from "../api/spring_backend_api";
import AddressPlaceParser from "../utils/AddressPlaceParser";

interface Props {
    index: number,
    onChange: object,
    question: object,
    collapsible: boolean,
    withoutCard: boolean
}

class _GeoComponent extends Question {
    private mapComponentRef = React.createRef<MapComponent>();
    private locationQuestionsCache = Utils.getAllQuestionsWithPropertyWithValue(this.props.formData.root, Constants.IS_PART_OF_LOCATION, this.props.question[Constants.IS_PART_OF_LOCATION]);

    constructor(props: Props) {
        super(props);

        console.log(this.props.question);

        this.state = {
            latitude: null,
            longitude: null,
            addressPlace: null
        };

        console.log("Geo component init");
    }

    getCoordinateProps(coordinateQuestion: any) {
        return {
            question: coordinateQuestion,
            //index: question.index,
            collapsible: this.props.collapsible,
            formData: this.props.formData,
            onChange: this.props.onChange,
            withoutCard: this.props.withoutCard,
            addressPlace: this.state.addressPlace
        }
    }

    getAddressQuestionProps(addressQuestion: any) {
        return {
            question: addressQuestion,
            //index: addressQuestion.index,
            collapsible: this.props.collapsible,
            formData: this.props.formData,
            onChange: this.props.onChange,
            withoutCard: this.props.withoutCard,
            addressPlace: this.state.addressPlace,
            isGeneralLocationPicked: this.state.latitude !== null
        }
    }

    getAddressTextQuestionProps(addressTextQuestion: any) {
        return {
            question: addressTextQuestion,
            //index: addressQuestion.index,
            collapsible: this.props.collapsible,
            formData: this.props.formData,
            onChange: this.props.onChange,
            withoutCard: this.props.withoutCard,
            addressPlace: this.state.addressPlace,
        }
    }

    onAddressPlaceSuggestionClick = (addressCode: number) => {
        spring_backend_api.getAddressPlaceByCode(addressCode)
            .then(response => {
                this.onAddressPlacePicked(AddressPlaceParser.parseAddressFromSpringBackend(response.data));
            })
            .catch(error => console.error(error));
    }

    onMarkerLocationPicked = (latitude: number, longitude: number) => {
        this.onAddressPlaceReset()
        this.setState({
            latitude: latitude.toFixed(7),
            longitude: longitude.toFixed(7),
            addressPlace: null
        });

        this.mapComponentRef.current?.onMarkerLocationPicked(latitude, longitude);
    }

    onUserLongitudeInput = (longitudeInput: number) => {
        this.setState({
            longitude: longitudeInput
        });
        this.mapComponentRef.current?.relocateBasedOnUserInput(this.state.latitude, longitudeInput);
    }

    onUserLatitudeInput = (latitudeInput: number) => {
        this.setState({
            latitude: latitudeInput
        });
        this.mapComponentRef.current?.relocateBasedOnUserInput(latitudeInput, this.state.longitude);
    }

    onAddressPlacePicked = (addressPlace : AddressPlace) => {
        this.setState({
            latitude: addressPlace.lat.toFixed(7),
            longitude: addressPlace.lng.toFixed(7),
            addressPlace: addressPlace
        });
        this.mapComponentRef.current?.onAddressPlacePicked(addressPlace);
    }

    onAddressPlaceTextModified = (e) => {
        e.stopPropagation();

        this.setState({
            latitude: null,
            longitude: null,
            addressPlace: null
        });

        this.mapComponentRef.current?.onAddressPlaceReset();
    }

    onCoordinateValueModifiedWhenAddressPlaceIsSelected = (e) => {
        e.stopPropagation();

        this.setState({
            addressPlace: null
        });

        this.mapComponentRef.current?.onAddressPlaceReset();
    }

    onAddressPlaceReset = (e = null) => {
        e?.stopPropagation();

        this.setState({
            latitude: null,
            longitude: null,
            addressPlace: null
        });

        const addressQuestion = this.locationContainsAddress();
        if (addressQuestion) {
            const addressTitleQuestion = Utils.getSubQuestionByPropertyValue(addressQuestion, Constants.HAS_MAIN_PROCESSING_ASPECT_TARGET, Constants.ADDRESS_TEXT);
            addressTitleQuestion[SConstants.HAS_ANSWER][0][SConstants.HAS_DATA_VALUE] = {"@value": null};
        }

        this.mapComponentRef.current?.onAddressPlaceReset();
    }

    isAddressComponentQuestion = () => {
        return this.props.question[Constants.HAS_MAIN_PROCESSING_ASPECT_TARGET]['@id'] == Constants.ADDRESS_IRI;
    }

    locationContainsAddress = () => {
        return this.locationQuestionsCache.find(q => q[Constants.HAS_MAIN_PROCESSING_ASPECT_TARGET]['@id'] === Constants.ADDRESS_IRI);
    }

    locationContainsCoordinates = () => {
        return this.locationQuestionsCache.find(q => q[Constants.HAS_MAIN_PROCESSING_ASPECT_TARGET]['@id'] === Constants.LONGITUDE_IRI || q[Constants.HAS_MAIN_PROCESSING_ASPECT_TARGET]['@id'] === Constants.LATITUDE_IRI);
    }


    render(): Element | any {

        return [
            <div>
                {
                    this.isAddressComponentQuestion() &&
                    <AddressComponent {...this.getAddressQuestionProps(this.props.question)} />
                }

                <MapComponent onMarkerLocationPicked={this.onMarkerLocationPicked} onAddressPlacePicked={this.onAddressPlacePicked} onAddressPlaceReset={this.onAddressPlaceReset} ref={this.mapComponentRef} userInputCoords={[this.state.latitude, this.state.longitude]}/>

                {
                    this.isAddressComponentQuestion() && this.locationContainsCoordinates() &&
                    <>
                    <div className={'coordinate'}>
                        <CoordinateComponent
                            coordValue={this.state.longitude}
                            onInput={this.onUserLongitudeInput} onCoordinateInputModified={this.onCoordinateValueModifiedWhenAddressPlaceIsSelected} {...this.getCoordinateProps(this.locationQuestionsCache.find(q => q[Constants.HAS_MAIN_PROCESSING_ASPECT_TARGET]['@id'] === Constants.LONGITUDE_IRI))}/>
                    </div>
                    <div className={'coordinate'}>
                        <CoordinateComponent coordValue={this.state.latitude}
                                             onInput={this.onUserLatitudeInput} onCoordinateInputModified={this.onCoordinateValueModifiedWhenAddressPlaceIsSelected} {...this.getCoordinateProps(this.locationQuestionsCache.find(q => q[Constants.HAS_MAIN_PROCESSING_ASPECT_TARGET]['@id'] === Constants.LATITUDE_IRI))}/>
                    </div>
                        {this.isAddressComponentQuestion() &&
                            <div className={'address-text'}>
                                <AddressTextComponent {...this.getAddressTextQuestionProps(this.props.question[SConstants.HAS_SUBQUESTION].find(q => q[Constants.HAS_MAIN_PROCESSING_ASPECT_TARGET]['@id'] === Constants.ADDRESS_TEXT))}
                                                      onAddressPlaceSuggestionClick={this.onAddressPlaceSuggestionClick}
                                                      onAddressTextModified={this.onAddressPlaceTextModified}
                                />
                            </div>
                        }
                    </>
                }
                {
                    !this.isAddressComponentQuestion() && this.locationContainsAddress() &&
                    <AddressComponent {...this.getAddressQuestionProps(this.locationQuestionsCache.find(q => q[Constants.HAS_MAIN_PROCESSING_ASPECT_TARGET]['@id'] === Constants.ADDRESS_IRI))} />
                }
            </div>
        ];
    }
}

_GeoComponent.propTypes.formData = PropTypes.object;
_GeoComponent.contextType = ConfigurationContext;

const GeoComponent = (props: Props) => {
    const formQuestionsContext = React.useContext(FormQuestionsContext);
    const formData = formQuestionsContext.getData();

    return (
        <_GeoComponent formData={formData} {...props} />
    );
};

export default GeoComponent;