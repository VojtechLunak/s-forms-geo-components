
export default class Constants {

    static COMPOSITE_PATTERN = 'http://onto.fel.cvut.cz/ontologies/form/has-composite-pattern';
    static PATTERN = 'http://onto.fel.cvut.cz/ontologies/form/has-pattern';
    static COMPOSITE_VARIABLES = 'http://onto.fel.cvut.cz/ontologies/form/has-composite-variables';
    static SHOW_ADVANCED_QUESTION = 'http://onto.fel.cvut.cz/ontologies/form/show-advanced-question';
    static HAS_UNIT_OF_MEASURE = 'http://onto.fel.cvut.cz/ontologies/form/has-unit-of-measure-question';
    static HAS_TYPE_QUESTION = 'http://onto.fel.cvut.cz/ontologies/form/has-type-question';

    static HAS_IDENTIFYING_QUESTION = 'http://onto.fel.cvut.cz/ontologies/form/has-identifying-question';
    static HAS_NON_SELECTABLE_VALUE = 'http://onto.fel.cvut.cz/ontologies/form/has-non-selectable-value';

    static HAS_MAIN_PROCESSING_ASPECT_TARGET = 'http://onto.fel.cvut.cz/ontologies/kodi/sgov2sforms/has-main-processing-aspect-target';
    static HAS_PRECEDING_QUESTION = 'http://onto.fel.cvut.cz/ontologies/form/has-preceding-question';
    static HAS_RELATED_QUESTIONS = 'http://onto.fel.cvut.cz/ontologies/documentation/has_related_question';
    static IS_PART_OF_LOCATION = 'http://onto.fel.cvut.cz/ontologies/kodi/sgov2sforms/is-part-of-location';
    static LONGITUDE_IRI = 'https://slovník.gov.cz/veřejný-sektor/pojem/zemepisná-délka';
    static LATITUDE_IRI = 'https://slovník.gov.cz/veřejný-sektor/pojem/zemepisná-šírka';
    static ADDRESS_IRI = 'https://slovník.gov.cz/legislativní/sbírka/111/2009/pojem/adresa';
    static ADDRESS_TEXT = 'https://slovník.gov.cz/generický/adresy/pojem/text-adresy';
    static ADDRESS_CODE = 'https://slovník.gov.cz/generický/adresy/pojem/má-kód-adresního-místa';
    static STREET_NAME = 'https://slovník.gov.cz/legislativní/sbírka/111/2009/pojem/má-název-ulice';
    static HOUSE_NUMBER = 'https://slovník.gov.cz/legislativní/sbírka/111/2009/pojem/má-číslo-domovní';
    static HOUSE_NUMBER_TYPE = 'https://slovník.gov.cz/generický/adresy/pojem/typ-čísla-domovního';
    static ORIENTATION_NUMBER = 'https://slovník.gov.cz/legislativní/sbírka/111/2009/pojem/číslo-orientační';
    static ORIENTATION_NUMBER_CHARACTER = 'https://slovník.gov.cz/generický/adresy/pojem/znak-čísla-orientačního';
    static ORIENTATION_NUMBER_EXTENSION = 'https://slovník.gov.cz/legislativní/sbírka/326/2000/pojem/dodatek-čísla-orientačního';
    static POSTAL_CODE = 'https://slovník.gov.cz/generický/adresy/pojem/poštovní-směrovací-číslo';
    static ADDRESS_PLACE_CODE = 'https://slovník.gov.cz/generický/adresy/pojem/má-kód-adresního-místa';
    static HAS_RELATED_QUESTION_LEVEL = 'http://onto.fel.cvut.cz/ontologies/kodi/sgov2sforms/has-related-question-level';

    static ADDRESS_PLACE_PICK_BUTTON = 'address_place_pick_button';
    static ADDRESS_PLACE_CLOSE_BUTTON = 'address_place_cl_button';

    static LOCATION_PICK_BUTTON = 'location_pick_button';
    static LOCATION_CLOSE_BUTTON = 'location_close_button';

    static LAYOUT_TYPE = 'nice';
    static LAYOUT_TYPE_QUESTION = 'type-question';
    static LAYOUT_STICKY = 'sticky';

    static BROADER = 'http://www.w3.org/2004/02/skos/core#broader';
    static DISJOINT_WITH = 'http://www.w3.org/2002/07/owl#disjointWith';

    static DEFAULT_COORDINATES = [50.0, 16.0];
}
