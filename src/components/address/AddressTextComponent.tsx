// @ts-nocheck
import React from 'react';
import {
    Question,
    ConfigurationContext,
    Constants as SConstants, FormUtils, Answer
} from '@kbss-cvut/s-forms';
import AddressPlace from "../../model/AddressPlace";
import spring_backend_api from "../../api/spring_backend_api";
import classNames from "classnames";
import Utils from "../../utils/Utils";
import Modal from 'react-bootstrap/Modal';
import { Button } from "react-bootstrap";

export interface AddressTextProps {
    question: object,
    addressPlace: AddressPlace | null,
    onAddressPlaceSuggestionClick: (admCode: number) => void,
    onAddressTextModified: (event: any) => void
}

export default class AddressTextComponent extends Question {

    constructor(props: AddressTextProps) {
        super(props);
        this.state = {
            addressPlace: null,
            suggestions: [],
            isFocused: false,
            showPopup: false,
            tempChange: null,
        }
    }

    componentDidMount() {
        super.componentDidMount();
        this._updateTextValue();
    }

    componentDidUpdate() {
        super.componentDidUpdate();
        this._updateTextValue();
        return null;
    }
    
    handleAnswerChange = (answerIndex: number, change: any) => {
        if (change[SConstants.HAS_DATA_VALUE]) {
            const inputValue: string = change[SConstants.HAS_DATA_VALUE]["@value"];

            if (this.state.addressPlace && inputValue !== this.state.addressPlace.getAddressText() && inputValue !== this.props.addressPlace.getAddressText()) {
                this.setState({showPopup: true, tempChange: {answerIndex, change}});
                return;
            }

            if (inputValue.length <= 3) {
                this.setState({
                    suggestions: null
                })
                this._handleChange(SConstants.HAS_ANSWER, answerIndex, change);
                return;
            }

            this._handleChange(SConstants.HAS_ANSWER, answerIndex, change);

            this._getSuggestions(inputValue);
        }
    }

    _getSuggestions = (input: string) => {
        spring_backend_api.getSuggestions(input)
          .then(response => {
              const addressPlaces = response.data;

              this.setState({
                  suggestions: addressPlaces
              })

          })
          .catch(error => {
              console.error(error);
              this.setState({
                  suggestions: Utils.getAddressPlacesTestingSample()
              })
          })
    }

    _updateTextValue() {
        if (this.state.addressPlace && !this.props.addressPlace) {
            this.setState({
                addressPlace: null,
                suggestions: null
            });
            return;
        }

        if (this.props.addressPlace && this.state.addressPlace?.addressCode !== this.props.addressPlace.addressCode) {
            this.setState({
                addressPlace: this.props.addressPlace
            });

            this.props.question[SConstants.HAS_ANSWER][0][SConstants.HAS_DATA_VALUE] = { '@value': this.props.addressPlace.getAddressText()};
            this.handleAnswerChange(0, this.props.question[SConstants.HAS_ANSWER][0]);
        }
    }

    _renderAnswer(index, answer) {
        let component = Answer;
        return React.createElement(component, {
            index: index,
            answer: answer,
            question: this.props.question,
            onChange: this.handleAnswerChange,
            onCommentChange: this.handleCommentChange,
            showIcon: this.state.showIcon,
            isInSectionHeader: true
        });
    }

    _renderSuggestions() {
        if (!this.state.suggestions || this.state.suggestions.length === 0 || !this.state.isFocused)
            return null;

        const children = [];

        for (const suggestion of this.state.suggestions) {
            children.push(
                <div key={suggestion.admCode} className={"suggestion"} onMouseDown={(e) =>  {
                    this.props.onAddressPlaceSuggestionClick(suggestion.admCode);
                    this.setState({isFocused: false});
                }}>
                    {suggestion.addressText}
                </div>
            )
        }

        return (
            <div className={"autocomplete"}>
                {children}
            </div>
        );
    }

    renderAnswers() {
        const question = this.props.question,
            children = [],
            answers = this._getAnswers();
        let cls;

        for (let i = 0, len = answers.length; i < len; i++) {
            cls = classNames(
                'answer',
                Question._getQuestionCategoryClass(question),
                Question.getEmphasizedOnRelevantClass(question)
            );
            children.push(
                <div
                    key={'row-item-' + i}
                    className={cls}
                    id={question['@id']}
                    onMouseEnter={this._onMouseEnterHandler}
                    onMouseLeave={this._onMouseLeaveHandler}
                    onFocus={() => this.setState({isFocused: true})}
                    onBlur={() => this.setState({isFocused: false})}
                >
                    <div className="answer-content" style={this._getAnswerWidthStyle()}>
                        {this._renderAnswer(i, answers[i])}
                    </div>
                        {this._renderSuggestions()}
                </div>
            );
        }

        children.push(this._renderModifyAddressTextPopup());

        return children;
    }

    _handleKeepAddressPlaceButtonClick = () => {
        this.setState({showPopup:false});
    }

    _handleModifyAddressPlaceButtonClick = (e) => {
        this._handleChange(SConstants.HAS_ANSWER, this.state.tempChange.answerIndex, this.state.tempChange.change);
        this._getSuggestions(this.state.tempChange.change[SConstants.HAS_DATA_VALUE]['@value']);
        this.setState({showPopup: false, tempChange: null})
        this.props.onAddressTextModified(e);
    }

    _renderModifyAddressTextPopup() {
        return (
            <Modal show={this.state.showPopup} onHide={() => this.setState({showPopup:false})} centered>
                <Modal.Header>
                    {/*<Modal.Title>Modifying selected address place</Modal.Title>*/}
                    <Modal.Title>Úprava zvoleného adresního místa</Modal.Title>
                </Modal.Header>
                {/*<Modal.Body>With modifying current address you will unselect current address place. Are you sure?</Modal.Body>*/}
                <Modal.Body>Úpravou hodnot znehodnotíte vybrané adresní místo a tím budou hodnoty adresního místa vynulovány. Jste si jisti?</Modal.Body>

                <Modal.Footer className={"address-place-popup-footer"}>
                    <Button variant="warning" onClick={(e) => this._handleModifyAddressPlaceButtonClick(e)}>
                        Odvybrat adresní místo
                    </Button>
                    <Button variant="secondary" onClick={this._handleKeepAddressPlaceButtonClick}>
                        Ponechat vybrané adresní místo
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }
}

AddressTextComponent.contextType = ConfigurationContext;