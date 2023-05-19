import {Constants as SConstants, Question} from "@kbss-cvut/s-forms";
import JsonLdUtils from "jsonld-utils";
import Constants from "../Constants.js";

export default class Utils {

  static findParent(root, id) {

    if (!root) {
      return null;
    }

    const subQuestions = root[SConstants.HAS_SUBQUESTION];
    if (subQuestions && subQuestions.length) {

      for (const subQuestion of subQuestions) {

        if (subQuestion['@id'] === id) {
          return root;
        }

        const found = Utils.findParent(subQuestion, id);
        if (found) {
          return found;
        }
      }
    }

    return null;
  }

  static findChild(parent, id) {

    if (!parent) {
      return null;
    }

    if (parent['@id'] === id) {
      return parent;
    }

    const subQuestions = parent[SConstants.HAS_SUBQUESTION];
    if (subQuestions && subQuestions.length) {

      for (let subQuestion of subQuestions) {
        let found = Utils.findChild(subQuestion, id);
        if (found) {
          return found;
        }
      }
    }

    return null;
  }

  static findDirectChild(parent, id) {

    if (!parent) {
      return null;
    }

    const subQuestions = parent[SConstants.HAS_SUBQUESTION];
    if (subQuestions && subQuestions.length) {

      for (let i = 0; i < subQuestions.length; i++) {
        if (subQuestions[i]['@id'] === id) {
          return { q: subQuestions[i], index: i };
        }
      }
    }

    return null;
  }

  static isReferencedByProperty(questions, questionId, property) {

    if (questions && questions.length) {

      for (const question of questions) {
        if (Utils.hasPropertyWithValue(question, property, questionId)) {
          return true;
        }
      }
    }

    return false;
  }

  static findRelatedQuestionByPropertyValue(root, property, id) {
    let foundQuestions = [];
    if (!root[Constants.HAS_RELATED_QUESTIONS])
      return null;
    for (const question of root[Constants.HAS_RELATED_QUESTIONS]) {
      if (question[property] && question[property]['@id'] && question[property]['@id'] === id) {
        foundQuestions.push(question);
      }
      const result = this.findRelatedQuestionByPropertyValue(question, property, id);
      if (result)
        return result;
    }

    return foundQuestions;
  }

  /**
   * Depth first search of node structure. Returns list of all question with given property-value pair.
   * @param root  from which node to traverse
   * @param property  property to look for
   * @param value wanted value
   * @param init  first iteration marker
   * @param foundList results list
   * @returns {*[]}
   */
  static getAllQuestionsWithPropertyWithValue(root, property, value, init = true, foundList = null) {
    let foundQuestions = foundList != null ? foundList : [];

    let formBaseQuestions;
    if (init) {
      formBaseQuestions = root[Constants.HAS_RELATED_QUESTIONS][1][Constants.HAS_RELATED_QUESTIONS];
    } else
      formBaseQuestions = root[Constants.HAS_RELATED_QUESTIONS];

    if (!formBaseQuestions) return foundQuestions;

    for (const question of formBaseQuestions) {
      if (this.hasPropertyWithValue(question, property, value)) {
        foundQuestions.push(question);
      }

      foundQuestions = (this.getAllQuestionsWithPropertyWithValue(question, property, value, false, foundQuestions));
    }
    return foundQuestions;
  }

  static findSharedParent(root, questions) {
    const qs = questions;
    let tempParents = [];
    for (let question of qs) {
      tempParents.push(this.findParent(root, question['@id']));
    }

    tempParents.reduce((previousValue, currentValue) => previousValue[Constants.HAS_RELATED_QUESTION_LEVEL] < currentValue[Constants.HAS_RELATED_QUESTION_LEVEL] ? previousValue : currentValue);
    return tempParents[0];
  }

  /**
   * Find first direct sibling of shared parent that contains/is related question to geo component.
   * @param root form root
   * @param node node to find sibling for
   */
  static findFirstDirectSiblingOfNode(root, node) {
    const parent = this.findParent(root, node['@id']);
    return parent[SConstants.HAS_SUBQUESTION][0][Constants.SHOW_ADVANCED_QUESTION] ? parent[SConstants.HAS_SUBQUESTION][1] : parent[SConstants.HAS_SUBQUESTION][0];
  }

  static hasSubQuestionWithValue(parent, property, value) {

    let subQuestions = parent[SConstants.HAS_SUBQUESTION];
    if (subQuestions && subQuestions.length) {
      for (let subQuestion of subQuestions) {
        if (JsonLdUtils.hasValue(subQuestion, property, value)) {
          return true;
        }
      }
    }

    return false;
  }

  static hasPropertyWithValue(question, property, value) {
    if (!question) {
      return false;
    }

    const propValue = this.getJsonAttValues(question, property, "@id");
    if (!propValue) {
      return false;
    }

    if (propValue.includes(value)) {
      return true;
    }

    if (propValue === value) {
      return true;
    }

    if (propValue['@id'] === value) {
      return true;
    }

    return false;
  }

  static getSubQuestionByPropertyValue(parent, property, value) {
    let subQuestions = parent[SConstants.HAS_SUBQUESTION];
    if (subQuestions && subQuestions.length) {
      for (let subQuestion of subQuestions) {
        if (subQuestion && subQuestion[property]["@id"] === value) {
          return subQuestion;
        }
      }
    }

    return null;
  }

  /**
   * Wraps passed object into new array if it is not array already.
   * @param object_or_array An object or array.
   * @returns {*} New array containing passed object or passed array.
   */
  static asArray(object_or_array) {
    if (!object_or_array) {
      return [];
    }
    if (object_or_array.constructor === Array) {
      return object_or_array;
    }
    return [object_or_array];
  }

  /**
   * Gets array of values of the specified attribute.
   *
   * If the attribute value is a string, it is returned, otherwise a '@value' attribute is retrieved from the nested
   * object.
   * @param obj Object from which the attribute value will be extracted
   * @param att Attribute name
   * @param by (optional) JSON attribute to use instead of '@value' in case the att value is an object
   * @return {*} Array of attribute values (possibly null)
   */
  static getJsonAttValues(obj, att, by = null) {
    if (obj[att] === null || obj[att] === undefined) {
      return null;
    }
    return Utils.asArray(obj[att]).map(v => typeof v === 'object' ? v[by ? by : '@value'] : v )
  }


  /**
   * @param {string[]} arr1
   * @param {string[]} arr2
   */
  static hasArraySameValues(arr1, arr2) {

    if (!arr1 || !arr2) {
      return false;
    }

    if (arr1.length === undefined) {
      return false;
    }

    if (arr1.length !== arr2.length) {
      return false;
    }

    const set = {};
    for (let el of arr1) {
      set[el] = 1;
    }

    for (let el of arr2) {
      if (!set[el]) {
        return false;
      }
      set[el] = 2;
    }

    return Object.values(set).every(el => el === 2);
  }


  static getAddressPlacesTestingSample() {
    return [
      {addressText: "Test address 20/50, 589632 CVUT FEL"},
      {addressText: "Test address 20, 589632 CVUT FEL"},
      {addressText: "Test address 20/10a, 589632 CVUT FEL"},
      {addressText: "Test address 20/50, 589632 CVUT FEL"},
      {addressText: "Test address 20/50, 589632 CVUT FEL"},
      {addressText: "Test address 20/50, 589632 CVUT FEL"},
      {addressText: "Test address 20/50, 589632 CVUT FEL"}
    ]
  }

  // static _findQuestion(question, id) {
  //
  //   if (question['@id'] === id) {
  //     return question;
  //   }
  //
  //   const subQuestions = question[SConstants.HAS_SUBQUESTION];
  //   if (subQuestions && subQuestions.length) {
  //
  //     for (const subQuestion of subQuestions) {
  //       const found = _QuestionWithUnit._findQuestion(subQuestion, id);
  //       if (found) {
  //         return found;
  //       }
  //     }
  //   }
  //
  //   return null;
  // }
}
