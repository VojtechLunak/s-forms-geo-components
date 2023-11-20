// @ts-nocheck
import React from 'react';
import {
    Question,
    ConfigurationContext, Constants as SConstants
} from '@kbss-cvut/s-forms';
import AddressPlace from "../../model/AddressPlace";
import Utils from "../../utils/Utils";
import Constants from "../../Constants";
import QuestionEntity from "../../model/QuestionEntity";

export interface AddressProps {
    question: object,
    addressPlace: AddressPlace,
    isGeneralLocationPicked: boolean
}

export default class AddressComponent extends Question {

    constructor(props: AddressProps) {
        super(props);
        this.state = {
            code: null,
            addressPlace: this.props.addressPlace,
            isGeneralLocationPicked: this.props.isGeneralLocationPicked
        };
    }

    /**
     * Reset address subquestions recursively to empty string ("").
     * @param question
     */
    _resetValuesToSubQuestionsRecursively(question = this.props.question) {
        const subquestions = question[SConstants.HAS_SUBQUESTION];

        if (question[SConstants.LAYOUT_CLASS]) {
            if (question[SConstants.LAYOUT_CLASS] === SConstants.LAYOUT.DISABLED) {
                question[SConstants.LAYOUT_CLASS] = [];
                return;
            }

            if (question[SConstants.LAYOUT_CLASS].includes(SConstants.LAYOUT.DISABLED)) {
                question[SConstants.LAYOUT_CLASS] = question[SConstants.LAYOUT_CLASS].filter((value: string) => {
                    return value !== SConstants.LAYOUT.DISABLED;
                });
            }
        }

        if (!subquestions || subquestions.lenght === 0)
            return;

        for (const subquestion of subquestions) {
            if (this.props.isGeneralLocationPicked && subquestion[Constants.HAS_MAIN_PROCESSING_ASPECT_TARGET]["@id"] === Constants.ADDRESS_TEXT) {
                subquestion[SConstants.HAS_ANSWER][0][SConstants.HAS_DATA_VALUE] = {"@value": null};
                continue
            }
            if (!this.props.isGeneralLocationPicked && subquestion[Constants.HAS_MAIN_PROCESSING_ASPECT_TARGET]["@id"] === Constants.ADDRESS_TEXT) {
                subquestion[SConstants.LAYOUT_CLASS] = [];
                continue;
            }
            if (subquestion[SConstants.HAS_ANSWER] && subquestion[SConstants.HAS_ANSWER][0])
                subquestion[SConstants.HAS_ANSWER][0][SConstants.HAS_DATA_VALUE] = {"@value": null};
            this._resetValuesToSubQuestionsRecursively(subquestion)
        }
    }

    componentDidUpdate() {
        //When address place is no longer selected, then reset data
        if (!this.props.addressPlace && this.state.code) {
            this.setState({
                code: null
            })

            this._resetValuesToSubQuestionsRecursively();
            return;
        }

        /*if (!this.props.addressPlace && !this.state.code) {
            this._resetValuesToSubQuestionsRecursively();
            return;
        }*/

        // Data mapping from component to questions;
        if (this.props.addressPlace) {
            if (this.state.code && this.props.addressPlace.addressCode === this.state.code)
                return;

            try {

                if (!this.state.code || this.state.code !== this.props.addressPlace.addressCode) {
                    this.setState({
                        code: this.props.addressPlace.addressCode
                    });
                }

                const question = this.props.question;

                const addressText = Utils.getSubQuestionByPropertyValue(question, Constants.HAS_MAIN_PROCESSING_ASPECT_TARGET, Constants.ADDRESS_TEXT);
                const addressTextQ = new QuestionEntity(addressText);
                addressTextQ.setAnswerValue(this.props.addressPlace.getAddressText());


                const streetQuestion = Utils.getSubQuestionByPropertyValue(question, Constants.HAS_MAIN_PROCESSING_ASPECT_TARGET, Constants.STREET_NAME);
                const streetQ = new QuestionEntity(streetQuestion);
                streetQ.setAnswerValue(this.props.addressPlace.streetName);

                const houseNumberQuestion = Utils.getSubQuestionByPropertyValue(question, Constants.HAS_MAIN_PROCESSING_ASPECT_TARGET, Constants.HOUSE_NUMBER);
                const houseNumberQ = new QuestionEntity(houseNumberQuestion);
                houseNumberQ.setAnswerValue(this.props.addressPlace.buildingIdentifier);

                const houseNumberPrefixQuestion = Utils.getSubQuestionByPropertyValue(question, Constants.HAS_MAIN_PROCESSING_ASPECT_TARGET, Constants.HOUSE_NUMBER_TYPE);
                const houseNumberPrefixQ= new QuestionEntity(houseNumberPrefixQuestion);
                houseNumberPrefixQ.setAnswerValue(this.props.addressPlace.buildingIdentifierType);

                const postalCodeQuestion = Utils.getSubQuestionByPropertyValue(question, Constants.HAS_MAIN_PROCESSING_ASPECT_TARGET, Constants.POSTAL_CODE);
                const postalCodeQ = new QuestionEntity(postalCodeQuestion);
                postalCodeQ.setAnswerValue(this.props.addressPlace.postalCode);

                const addressCodeQuestion = Utils.getSubQuestionByPropertyValue(question, Constants.HAS_MAIN_PROCESSING_ASPECT_TARGET, Constants.ADDRESS_PLACE_CODE);
                const addressCodeQ = new QuestionEntity(addressCodeQuestion);
                addressCodeQ.setAnswerValue(this.props.addressPlace.addressCode);

                const orientationNumberQuestion = Utils.getSubQuestionByPropertyValue(question, Constants.HAS_MAIN_PROCESSING_ASPECT_TARGET, Constants.ORIENTATION_NUMBER);
                const orientationNumberQ= new QuestionEntity(orientationNumberQuestion);
                orientationNumberQ.setAnswerValue(this.props.addressPlace.orientationNumber);

                //Getting info about subQuestion of orientation number question
                const orientationNumberExtensionQuestion = Utils.getSubQuestionByPropertyValue(orientationNumberQuestion, Constants.HAS_MAIN_PROCESSING_ASPECT_TARGET, Constants.ORIENTATION_NUMBER_EXTENSION);
                const orientationNumberExtensionQ= new QuestionEntity(orientationNumberExtensionQuestion);
                orientationNumberExtensionQ.setAnswerValue(this.props.addressPlace.orientationNumberExtension);

            } catch (e) {
                console.error(e);
                console.error("Cannot set address text when address question is not rendered.")
            }
        }

        return null;
    }
}

AddressComponent.contextType = ConfigurationContext;