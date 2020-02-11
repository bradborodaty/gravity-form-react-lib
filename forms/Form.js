import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import PropTypes from 'prop-types';

import Input from './components/Input';
import Select from './components/Select';
import Checkbox from './components/Checkbox';
import Radio from './components/Radio';
import TextArea from './components/TextArea';

const FORM_QUERY = gql`
    query FORM_QUERY($formId: Int!) {
        gravityForms(id:$formId)
    }
`;

const POST_FORM_MUTATION = gql`
    mutation POST_FORM_MUTATION($values: String!, $formId: String!) {
        gravityFormsEntryMutation(
            input: {
                clientMutationId: "formsubmission",
                formInput: $values,
                formID: $formId
            }
        ) {
            clientMutationId
            returnOutput
        }
    }
`;

function Form({formId,confirmId,submitHook,hiddenValues}) {
    // form values
    const [values, setValues] = useState({});
    // messages
    const [message, setMessage] = useState("");
    // disabled
    const [disabled, setDisabled] = useState(false);
    // submission setter
    const [submitted, setSubmit] = useState(false);
    // errors
    const [errors, setErrors] = useState({});
    // pass formId prop to query to get specific form
    const { loading, error, data } = useQuery(FORM_QUERY, { variables: { formId: formId} } );
    const [submit] = useMutation(POST_FORM_MUTATION);

    // set hidden fields in effect that is dependent upon hiddenValues prop
    // **will only run if the hiddenValues prop changes
    useEffect(() => {
        // only map over fields and set state if values
        // for the hidden fields have been passed
        // hiddenValues format must match: {'fieldID':'hiddenInputValue'}
        // may want to update this to do required checking, default setting, etc.
        if(hiddenValues && data.gravityForms) {
            const formData = JSON.parse(data.gravityForms);
            let hiddenObj = {};
            formData.fields.map(field => {
                if(field.type === 'hidden') {
                    hiddenObj[field.id] = hiddenValues[field.id];
                }
            });
            setValues(prevState => ({ ...prevState, ...hiddenObj }));
        }
    }, [hiddenValues]);

    // handler to update form input changes
    function onFormChange({ target: { id, value }}) {
        setValues(prevState => ({ ...prevState, [id]: value }));
    }
    // handler for checkbox changes
    function onCheckboxClick({target: {id, value}}) {
        if(!values.hasOwnProperty(id)) {
            setValues(prevState => ({ ...prevState, [id]: value }));
        } else {
            // create copy of state to not directly mutate state
            const stateCopy = Object.assign({}, values);
            delete stateCopy[id];
            setValues({ ...stateCopy });
        }
    }
    // handler for phone input
    function onPhoneInput({target: {id, value}}) {
        const phone = normalizePhone(values[id], value);
        setValues(prevState => ({...prevState, [id]: phone}));
    }
    // function that masks phone input
    function normalizePhone(prev, value) {
        // return if nothing
        if(!value) return value;
        // only accept 0-9
        const currVal = value.replace(/[^\d]/g, '');
        // if no value yet or new value is greater than what it was before
        if(!prev || value.length > prev.length) {
            if(currVal.length <= 3) return `${currVal}`;
            if(currVal.length === 3) return `(${currVal})`;
            if(currVal.length <= 6) return `(${currVal.slice(0,3)}) ${currVal.slice(3)}`;
            if (currVal.length === 6) return `(${currVal.slice(0, 3)}) ${currVal.slice(3)}-`;
            return `(${currVal.slice(0,3)}) ${currVal.slice(3,6)}-${currVal.slice(6,10)}`;
        }
    }

    // handler to handle form submit
    function handleSubmit(e,confirmMessage) {
        // prevent default form behavior
        e.preventDefault();
        setDisabled(true);
        // clear any errors that are showing
        setErrors({});
        // create empty data object to not mutate state
        let submitData = {};
        // map over state to create api expected input
        for(var key in values) {
            if(values.hasOwnProperty(key)) {
                submitData[`input_${key}`] = values[key];
            }
        }
        // console.log(submitData);
        // submit mutation
        submit({
            variables: { formId: formId, values: JSON.stringify(submitData) },
            update: (_, FetchResult) => {
                // console.log(FetchResult);
                const status = JSON.parse(FetchResult.data.gravityFormsEntryMutation.returnOutput);
                // console.log(status);
                if(!status.is_valid) {
                    setSubmit(false);
                    setMessage('There was a problem with your submission. Errors have been highlighted below.');
                    setDisabled(false);
                    setErrors(status.validation_messages);
                    if(submitHook) {
                        submitHook(false);
                    }
                } else {
                    setSubmit(true);
                    setMessage(confirmMessage);
                    if(submitHook) {
                        submitHook(true);
                    }
                }
            },
        });
    }

    // function to determine field type
    function buildForm(type, field) {
        const reusedProps = {
            key: field.id,
            id: field.id,
            label: field.label,
            type: field.type,
            choices: field.choices,
            inputs: field.inputs,
            onInput: onFormChange,
            placeholder: field.placeholder,
            classes: field.cssClass,
            required: field.isRequired,
            error: errors.hasOwnProperty(field.id) ? true : false,
            errMsg: field.errorMessage,
            show: field.conditionalLogic != "" ? conditionalLogic(field) : true,
            value: values[field.id],
        }
        switch(type) {
            case 'hidden' :
                // console.log(field.id, field.defaultValue);
                break;
            case 'text' :
            case 'name' :
            case 'email' :
                return <Input {...reusedProps} />
            case 'phone' :
                return <Input {...reusedProps} onPhone={onPhoneInput} />
            case 'select' :
                return <Select {...reusedProps} />
            case 'checkbox' :
                // come back to checkbox required validation
                return <Checkbox {...reusedProps} onCheckbox={onCheckboxClick} />
            case 'radio' :
                return <Radio {...reusedProps} />
            case 'textarea' :
                return <TextArea {...reusedProps} />
            default :
                // don't include this return statement in production
                return <p>{`haven't setup a component to handle ${field.type} yet...`}</p>;
                break;
        }
    }

    // function to check value vs value based on condition
    function dynamicOperatorCheck(value1, value2, operator) {
        switch(operator) {
            case 'is' :
                return value1 == value2 ? true : false;
            case 'isnot' :
                return value1 != value2 ? true : false;
            default :
                return false;
        }
    }

    // make conditionalLogic dynamic
    function conditionalLogic(field) {
        const rules = field.conditionalLogic.rules;
        const allConditions = field.conditionalLogic.logicType == 'all' ? true : false;

        // check against all conditions if true
        if(allConditions) {
            for(var i = 0; i < rules.length; i++) {
                if(!dynamicOperatorCheck(values[rules[i].fieldId],rules[i].value,rules[i].operator)) {
                    return false
                }
            }
            return true
        } else {
            // else check covers if any are true
            for(var i = 0; i < rules.length; i++) {
                if(dynamicOperatorCheck(values[rules[i].fieldId],rules[i].value,rules[i].operator)) {
                    return true
                }
            }
            return false
        }
    }

    // check loading and error states on form call
    if(loading) return  null;
    if(error) return <p>Error: {error.message}</p>;

    // parse json data returned from form
    // console.log(JSON.parse(data.gravityForms));
    const parsedData = JSON.parse(data.gravityForms);
    // get confirm message by prop
    const confirmMessage = parsedData.confirmations.hasOwnProperty(confirmId) ? parsedData.confirmations[confirmId].message : 'Thanks for contacting us! We will get in touch with you shortly.';
    
    // return form html and appropriate fields
    return (
        submitted ? <p>{message}</p> :
        <form
            onSubmit={(e) => handleSubmit(e,confirmMessage)}
            className={parsedData.cssClass}
        >
            <fieldset disabled={disabled}>
                <h3>{parsedData.title}</h3>
                {parsedData.description && <div dangerouslySetInnerHTML={{__html: parsedData.description}} />}
                {message && <div className="validation_error">{message}</div>}
                {parsedData.fields.map(field => {
                    return buildForm(field.type, field)
                })}
                <div className="submit_button">
                    <button type="submit">{parsedData.button.text ? parsedData.button.text : 'Submit'}</button>
                </div>
            </fieldset>
        </form>
    )
}

Form.propTypes = {
    formId: PropTypes.number.isRequired,
    confirmId: PropTypes.string,
    submitHook: PropTypes.func
}

export default Form;