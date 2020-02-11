const Select = ({ show, classes, label, id, onInput, choices, required, error, errMsg }) => {
    const errorClass = error ? ' error' : '';
    return (
        !show ? null :
        <div className={classes + errorClass}>
            <label>{label}</label>
            <select
                id={id}
                onChange={onInput}
                required={required}
            >
                <option value="">{label}{required && '*'}</option>
                {choices.map(choice => {
                    return (
                        <option key={choice.value} value={choice.value}>
                            {choice.text}
                        </option>
                    )
                })}
            </select>
            {error && <label>{errMsg}</label>}
        </div>
    );
};

export default Select;