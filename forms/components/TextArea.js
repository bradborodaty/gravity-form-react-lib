const TextArea = ({show, label, type, id, placeholder, classes, onInput, required, error, errMsg }) => {
    const errorClass = error ? ' error' : '';
    return (
        !show ? null :
        <div className={classes + errorClass}>
            <label>{label}</label>
            <textarea
                id={id}
                type={type}
                placeholder={placeholder}
                onChange={onInput}
                required={required}
                name={id}
            />
            {error && <label>{errMsg}</label>}
        </div>
    );
};

export default TextArea;