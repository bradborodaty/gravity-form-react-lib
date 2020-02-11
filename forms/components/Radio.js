const Radio = ({show, classes, label, type, onInput, choices, id, required, error, errMsg}) => {
    const errorClass = error ? ' error' : '';
    return (
        !show ? null :
        <div className={classes + errorClass}>
            <label>{label}</label>
                {choices.map(choice => {
                    return (
                        <React.Fragment key={choice.value}>
                            <input
                                key={choice.value}
                                id={id}
                                type={type}
                                onChange={onInput}
                                value={choice.value}
                                name={label}
                                required={required}
                            />
                            <label>{choice.text}</label>
                        </React.Fragment>
                    )
                })}
            {error && <label>{errMsg}</label>}
        </div>
    );
};

export default Radio;