import { Constants as SConstants } from '@kbss-cvut/s-forms';
import Constants from "../Constants";

export default class QuestionEntity {
    readonly id: string;
    readonly subQuestions: QuestionEntity[] | null;
    readonly originalQuestion: any

    constructor(question: any) {
        this.id = question["@id"];
        this.originalQuestion = question;

        // When first question is initialized, the HAS_ANSWER acts like it is not there in the this.originalQuestion object, even-though the question has it surely
        if (!this.originalQuestion[SConstants.HAS_ANSWER] || !this.originalQuestion[SConstants.HAS_ANSWER][0]) {
            this.originalQuestion[SConstants.HAS_ANSWER] = [];
            const tempobj = JSON.parse(`{"`+ SConstants.HAS_DATA_VALUE + `":  {"@value" : ""}}`);
            this.originalQuestion[SConstants.HAS_ANSWER][0] = tempobj;
            //this.originalQuestion[SConstants.HAS_ANSWER][0][SConstants.HAS_DATA_VALUE] = {"@value" : ""};
        }

        this.subQuestions = null;
        const subQuestions: [] = question[SConstants.HAS_SUBQUESTION];
        if (subQuestions)
            this.subQuestions = subQuestions.map(q => new QuestionEntity(q));
    }

    setAnswerValue(value: string) {
        if (!value)
            value = "";
        this.originalQuestion[SConstants.HAS_ANSWER][0][SConstants.HAS_DATA_VALUE] = {"@value": value};

        //Temp fix for allowing address text input
        if (this.originalQuestion[Constants.HAS_MAIN_PROCESSING_ASPECT_TARGET]['@id'] === Constants.ADDRESS_TEXT)
            return;

        //Disable form inputs for further editing
        if (!this.originalQuestion[SConstants.LAYOUT_CLASS]) {
            this.originalQuestion[SConstants.LAYOUT_CLASS] = SConstants.LAYOUT.DISABLED;
        } else if (!this.originalQuestion[SConstants.LAYOUT_CLASS][SConstants.LAYOUT.DISABLED]) {
            this.originalQuestion[SConstants.LAYOUT_CLASS].push(SConstants.LAYOUT.DISABLED);
        }
    }
}