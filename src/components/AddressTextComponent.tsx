import React from 'react';
import {
    Question,
    ConfigurationContext,
    Constants as SConstants
} from '@kbss-cvut/s-forms';
import AddressPlace from "./AddressPlace";
import AddressPlaceParser from "../utils/AddressPlaceParser";
import {AsyncTypeahead} from "react-bootstrap-typeahead";
import inspire_address_api from "../api/inspire_address_api";

export interface AddressTextProps {
    question: object,
    addressPlace: AddressPlace | null
}

export default class AddressTextComponent extends Question {

    constructor(props: AddressTextProps) {
        super(props);
        this.state = {
            addressPlace: this.props.addressPlace,
            isLoading: false,
            autocompleteResults: []
        }
    }

    componentDidMount() {
        super.componentDidMount();
        this._updateTextValue();
    }

    componentDidUpdate() {
        super.componentDidUpdate();
        if (this.props.addressPlace !== this.state.addressPlace) {
            this._updateTextValue();
            this.setState({
                addressPlace: this.props.addressPlace
            });
        }
        return null;
    }

    /*handleAnswerChange = (answerIndex: number, change: any) => {
        if (change[SConstants.HAS_DATA_VALUE]) {
            const inputValue: string = change[SConstants.HAS_DATA_VALUE]["@value"];

            const regExp = new RegExp("^\\d{1,3}\\.?\\d+$");
            if (regExp.test(inputValue)) {
                this.props.onInput(inputValue);
                this._handleChange(SConstants.HAS_ANSWER, answerIndex, change);
            }
        }
    };*/

    _handleSearch = (input: string) => {
        this.setState({
            isLoading: true
        });

        inspire_address_api.getAutocompleteFromGeocodeSOE(input)
            .then(response => {
                const parsed = response.data;
                console.log(parsed);
                console.log(parsed["suggestions"]);

                this.setState({
                    isLoading: false,
                    autocompleteResults: parsed["suggestions"]
                });
            })

    }

    _updateTextValue() {
        if (this.props.addressPlace && this.props.addressPlace !== this.state.addressPlace) {
            const question = this.props.question;

            question[SConstants.HAS_ANSWER][0][SConstants.HAS_DATA_VALUE] = {
                '@value': AddressPlaceParser.getAddressText(this.props.addressPlace)
            };
        }
    }

    renderAnswers() {
        console.log(this.state.autocompleteResults);
        return (
            <AsyncTypeahead
                id="async-example"
                isLoading={this.state.isLoading}
                labelKey="text"
                minLength={4}
                onSearch={this._handleSearch}
                options={this.state.autocompleteResults}
                placeholder="Search for a address..."
                renderMenuItemChildren={(option: any) => {
                    return (
                    <>
                        <span>{option["text"]}</span>
                    </>
                    )}}
            />
        );
    }
}

AddressTextComponent.contextType = ConfigurationContext;