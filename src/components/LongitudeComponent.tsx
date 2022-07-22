import React from 'react';
import JsonLdUtils from 'jsonld-utils';
import {
    Question,
    FormUtils,
    ConfigurationContext,
    Answer, Constants as SConstants
} from '@kbss-cvut/s-forms';
import Constants from '../Constants';
import classNames from 'classnames';


interface Props {
    question: object
}

class LongitudeComponent extends Question {

    static mappingRule = (q: Question) => JsonLdUtils.hasValue(q, Constants.HAS_MAIN_PROCESSING_ASPECT_TARGET, Constants.LONGITUDE);

    constructor(props: Props) {
        super(props);
        console.log("Longitude component init");
    }

    onSubQuestionChange = (subQuestionIndex: number, change: any) => {
        this._handleChange(SConstants.HAS_SUBQUESTION, subQuestionIndex, change);
    };

    _getAnswerWidthStyle() {
        return super._getAnswerWidthStyle();
    }

    renderAnswers() {
        const question = this.props.question,
            children = [],
            answers = this._getAnswers();
        let cls;

            cls = classNames(
                'answer',
                Question._getQuestionCategoryClass(question),
                Question.getEmphasizedOnRelevantClass(question)
            );
            children.push(
                <div
                    key={'row-item-0'}
                    className={cls}
                    id={question['@id']}
                    onMouseEnter={this._onMouseEnterHandler}
                    onMouseLeave={this._onMouseLeaveHandler}
                >
                    <Answer
                        index={0}
                        answer={answers[0]}
                        question={question}
                        onChange={this.handleAnswerChange}
                        onCommentChange={this.handleCommentChange}
                        showIcon={this.state.showIcon}
                    />
                </div>
            );
        return children;
    }
}

LongitudeComponent.contextType = ConfigurationContext;
export default LongitudeComponent;
