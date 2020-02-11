# Graphql Gravity Forms Library

This is a react component that consumes the Gravity Forms REST API through GraphQL, outputs the form, and accepts submissions. Some setup is required on the Wordpress side in order for this component to work in your react application.

# How to use

The form library is very simple to use. Import the <b>Form</b> component from the <b>Form.js</b> file and pass it a required prop of `formId`. The `formId` prop needs to be an integer.

Example:

```javascript
<Form
    formId={1}
/>
```

# Props

| Prop name | Expected Value | Purpose |
| --- | --- | --- |
| formId | Integer | Used to query the form by ID from the database |
| confirmId | String | The Id of the confirm message to be used on a successful form submission |
| submitHook | Function | Pass a function to this prop to be notified of attempted form submissions. Your function will receive one parameter of type boolean. True for successful submission and false for failed submission |
| hiddenValues | Object | Used to set the hidden field values for the corresponding hidden fields of the form. For example, if the form has a hidden field of page title, the prop would pass the ID of the page title hidden field, and the value to submit for the hidden field. The format for the object is strict and must follow the format of `key = field id` and `value = any value` (e.g. `{'4': 'I am hidden!'}`). |