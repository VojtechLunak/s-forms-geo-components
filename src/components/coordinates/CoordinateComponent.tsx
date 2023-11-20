// @ts-nocheck
import React from 'react';
import {
    Question,
    ConfigurationContext,
    Constants as SConstants, Answer
} from '@kbss-cvut/s-forms';
import classNames from "classnames";
import Modal from "react-bootstrap/Modal";
import {Button} from "react-bootstrap";
import AddressPlace from "../../model/AddressPlace";

export interface CoordinateProps {
    question: object,
    coordValue: number,
    onInput: (coordinate: string) => void,
    onCoordinateInputModified: (event: any) => void,
    addressPlace: AddressPlace | null
}

export default class CoordinateComponent extends Question {

    constructor(props: CoordinateProps) {
        super(props);
        this.state = {
            coordValue: this.props.coordValue,
            showPopup: false,
            tempChange: null
        };
    }

    componentDidMount() {
        super.componentDidMount();
        this._updateCoordValue();
    }

    componentDidUpdate() {
        if (this.props.coordValue !== this.state.coordValue) {
            this._updateCoordValue();
            this.setState({
                coordValue: this.props.coordValue
            })
        }
        return null;
    }

    handleAnswerChange = (answerIndex: number, change: any) => {
        if (change[SConstants.HAS_DATA_VALUE]) {
            const inputValue: string = change[SConstants.HAS_DATA_VALUE]["@value"];
            if (inputValue.includes("e"))
                return;

            if (this.props.addressPlace && inputValue !== this.state.coordValue) {
                this.setState({showPopup: true, tempChange: {answerIndex, change}});
                return;
            }

            this._handleChange(SConstants.HAS_ANSWER, answerIndex, change);
            this.props.onInput(inputValue);


            /*const regExp = new RegExp("^\\d{1,3}\\.\\d+?$");
            if (regExp.test(inputValue)) {
                this.props.onInput(inputValue);
                this._handleChange(SConstants.HAS_ANSWER, answerIndex, change);
            }*/
        }
    };

    _updateCoordValue() {
        const question = this.props.question;

        question[SConstants.HAS_ANSWER][0][SConstants.HAS_DATA_VALUE] = {
            '@value': this.props.coordValue
        };
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

    _handleKeepAddressPlaceButtonClick = () => {
        this.setState({showPopup:false});
    }

    _handleModifyAddressPlaceButtonClick = (e) => {
        this._handleChange(SConstants.HAS_ANSWER, this.state.tempChange.answerIndex, this.state.tempChange.change);
        this.props.onInput(this.state.tempChange.change[SConstants.HAS_DATA_VALUE]["@value"]);
        this.setState({showPopup: false, tempChange: null})
        this.props.onCoordinateInputModified(e);
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
                >
                    <div className="answer-content" style={this._getAnswerWidthStyle()}>
                        {this._renderAnswer(i, answers[i])}
                    </div>
                </div>
            );
        }

        children.push(this._renderModifyAddressTextPopup());

        return children;
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

CoordinateComponent.contextType = ConfigurationContext;