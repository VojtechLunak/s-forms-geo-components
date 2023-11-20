import Constants from "./Constants";
import {Constants as SConstants} from "@kbss-cvut/s-forms";
import NullQuestion from "./components/NullQuestion";
import Utils from "./utils/Utils.js";
import NiceComponent from "./components/NiceComponent";
import GeoComponent from "./components/GeoComponent";
import "./styles/components.css";

export default class GeoComponents {

  static componentCache = {};

  static _cached(q, form, key, mapRule) {

    let cachedQuestion = GeoComponents.componentCache[q['@id']];
    if (cachedQuestion === undefined) {
      cachedQuestion = {};
      GeoComponents.componentCache[q['@id']] = {};
    }

    let cachedValue = cachedQuestion[key];
    if (cachedValue === undefined) {
      cachedValue = mapRule(q, form);
      GeoComponents.componentCache[q['@id']][key] = cachedValue;
    }

    return cachedValue;
  }

  static getComponentMapping() {
    return [
      {
        component: NiceComponent,
        mapRule: NiceComponent.mappingRule
      },
      {
        component: GeoComponent,
        mapRule: (q, form) => this.isGeoComponentQuestion(q, form)
      },
      /*{
        component: AddressTextComponent,
        mapRule: q => q[Constants.HAS_MAIN_PROCESSING_ASPECT_TARGET] && q[Constants.HAS_MAIN_PROCESSING_ASPECT_TARGET]['@id'] === Constants.ADDRESS_TEXT
      },*/
      /*{
        component: GeoComponent,
        mapRule: q => Utils.hasPropertyWithValue(q, Constants.HAS_MAIN_PROCESSING_ASPECT_TARGET, Constants.LATITUDE_IRI)
      },*/
      {
        component: NullQuestion,
        mapRule: (q, form) => {
          return q[Constants.IS_PART_OF_LOCATION] && !this.isGeoComponentQuestion(q, form);
        }
      },
      {
        component: NullQuestion,
        mapRule: (q, form) => GeoComponents._cached(q, form, 'NullQuestion-unit-of-measure', () => {
          const parent = Utils.findParent(form?.root, q['@id']);
          return !!(parent && Utils.isReferencedByProperty(parent[SConstants.HAS_SUBQUESTION], q['@id'], Constants.HAS_UNIT_OF_MEASURE));
        })
      },
      {
        component: NullQuestion,
        mapRule: (q, form) => GeoComponents._cached(q, form, 'NullQuestion-type-question', () => {
          const parent = Utils.findParent(form?.root, q['@id']);
          return Utils.hasPropertyWithValue(parent, Constants.HAS_TYPE_QUESTION, q['@id']);
        })
      },
      /*{
        component: NullQuestion,
        mapRule: q => {
          return !!q[Constants.SHOW_ADVANCED_QUESTION]
        }
      },*/
      {
        component: NullQuestion,
        mapRule: q => {
          return Utils.hasPropertyWithValue(q, Constants.HAS_MAIN_PROCESSING_ASPECT_TARGET, Constants.LONGITUDE_IRI);
        }
      },
      {
        component: NullQuestion,
        mapRule: q => Utils.hasPropertyWithValue(q, Constants.HAS_MAIN_PROCESSING_ASPECT_TARGET, Constants.ADDRESS_IRI)
      },
      {
        component: NullQuestion,
        mapRule: q => Utils.hasPropertyWithValue(q, Constants.HAS_MAIN_PROCESSING_ASPECT_TARGET, "https://slovník.gov.cz/generický/vstupné/pojem/vstupné")
      },
      {
        component: NullQuestion,
        mapRule: q => Utils.hasPropertyWithValue(q, Constants.HAS_MAIN_PROCESSING_ASPECT_TARGET, "https://slovník.gov.cz/generický/čas/pojem/časová-specifikace")
      },
      {
        component: NullQuestion,
        mapRule: q => Utils.hasPropertyWithValue(q, Constants.HAS_MAIN_PROCESSING_ASPECT_TARGET, "https://slovník.gov.cz/generický/věci/pojem/název")
      },
      {
        component: NullQuestion,
        mapRule: q => Utils.hasPropertyWithValue(q, Constants.HAS_MAIN_PROCESSING_ASPECT_TARGET, "https://slovník.gov.cz/generický/číselníky/pojem/typ-turistického-cíle")
      }
    ];
  }

  /**
   * Checks whether question is viable to be the GeoComponent input question based on is-part-of-location property and question order.
   * @param q
   * @param form
   * @returns {boolean}
   */
  static isGeoComponentQuestion(q, form) {
    if (q[Constants.IS_PART_OF_LOCATION]) {
      // get set of questions related to geo component
      let QS = Utils.getAllQuestionsWithPropertyWithValue(form.root, Constants.IS_PART_OF_LOCATION, q[Constants.IS_PART_OF_LOCATION]);

      // get shared parent for QS
      let pQ = Utils.findSharedParent(form.root, QS);

      // find first direct sibling of shared parent that contains/is related question to geo component
      const firstSibling = Utils.findFirstDirectSiblingOfNode(form.root, pQ);

      let fQ;

      for (const question of QS) {
        // if question related to geo component is direct subquestion of shared parent, then select it as GeoComponent input
        if (question[Constants.HAS_RELATED_QUESTION_LEVEL] - pQ[Constants.HAS_RELATED_QUESTION_LEVEL] === 1) {
          fQ = question;
          if (q['@id'] === fQ['@id']) {
            console.log("GeoComponent from fQ with ID: " + fQ['@id']);
            return true;
          }
        }
      }

      if (q['@id'] === pQ['@id']) {
        console.log("GeoComponent from parent question with ID: " + pQ['@id']);
        return true;
      }
    }
    return false;
  }

}
