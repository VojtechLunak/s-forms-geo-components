import React, { useRef } from "react";
import SForms, { Constants, IntlContextProvider } from "@kbss-cvut/s-forms";
import exampleForm from "./assets/example_form.json";
import exampleFormTC from "./assets/example_turisticky_cil.json";
import touristForm from "./assets/example_tourist_destination_form_with_location.json";
import touristFormWithData from "./assets/example_tourist_destination_form_with_location_with_data.json";
import mondisForm from "./assets/example_mondis_form.json";
import possibleValues from "./assets/possibleValues.json";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import GeoComponents from "../GeoComponents";

const componentMapping = GeoComponents.getComponentMapping();

const modalProps = {
  onHide: () => {},
  show: true,
  title: "Title",
};

const options = {
  i18n: {
    "wizard.next": "Next",
    "wizard.previous": "Previous",
    "section.expand": "Expand",
    "section.collapse": "Collapse",
  },
  intl: {
    locale: "cs",
  },
  modalView: false,
  modalProps,
  horizontalWizardNav: false,
  wizardStepButtons: true,
  enableForwardSkip: true,
  startingStep: 1,
  users: [
    { id: "http://fel.cvut.cz/people/max-chopart", label: "Max Chopart" },
    {
      id: "http://fel.cvut.cz/people/miroslav-blasko",
      label: "Miroslav Blasko",
    },
  ],
  currentUser: "http://fel.cvut.cz/people/max-chopart",
  icons: [
    {
      id: Constants.ICONS.QUESTION_HELP,
      behavior: Constants.ICON_BEHAVIOR.ENABLE,
    },
    {
      id: Constants.ICONS.QUESTION_COMMENTS,
      behavior: Constants.ICON_BEHAVIOR.ON_HOVER,
    },
    {
      id: Constants.ICONS.QUESTION_LINK,
      behavior: Constants.ICON_BEHAVIOR.ON_HOVER,
    },
  ],
};

export default {
  title: "SForms Geo Component",
  component: SForms,
} as ComponentMeta<typeof SForms>;

const Template: ComponentStory<typeof SForms> = (args) => {
  const refForm = useRef();

  const fetchTypeAheadValues = () => {
    return new Promise((resolve) =>
        setTimeout(() => resolve(possibleValues), 1500)
    );
  };

  return (
      <IntlContextProvider locale={options.intl.locale}>
        <SForms
            options={options}
            ref={refForm}
            form={exampleForm}
            fetchTypeAheadValues={fetchTypeAheadValues}
            componentMapRules={componentMapping}
            {...args}
        />
      </IntlContextProvider>
  );
};

export const Form1 = Template.bind({});
Form1.args = {
  options: options,
};
export const TouristDestination1 = Template.bind({});
TouristDestination1.args = {
  options: options,
  form: exampleFormTC,
};

export const TouristDestinationWithGeolocation = Template.bind({});
TouristDestinationWithGeolocation.args = {
  options: options,
  form: touristForm
};

export const TouristDestinationWithGeolocationWithData = Template.bind({});
TouristDestinationWithGeolocationWithData.args = {
  options: options,
  form: touristFormWithData
};

export const Mondis = Template.bind({});
Mondis.args = {
  options: options,
  form: mondisForm
};