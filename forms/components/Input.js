const Input = ({ value, show, label, type, id, inputs, placeholder, classes, onInput, onPhone, required, error, errMsg }) => {
    const errorClass = error ? ' error' : '';
    if(!show) return null;
    if(inputs && inputs.length > 0) {
        return inputs.map(input => {
            if(input.isHidden) {
                return null
            } else {
                return (
                    <div key={input.id} className={classes + errorClass}>
                        <label>{input.label}</label>
                        <input
                            id={input.id}
                            type={type}
                            placeholder={input.placeholder}
                            onChange={onInput}
                            required={required}
                            name={input.id}
                        />
                        {error && <label>{errMsg}</label>}
                    </div>
                )
            }
        })
    } 
    if(type == 'phone') {
        return (
            <div className={classes + errorClass} style={{display: type == 'hidden' ? 'none' : ''}}>
                <label>{label}</label>
                <input
                    id={id}
                    type="tel"
                    placeholder={placeholder}
                    onChange={onPhone}
                    required={required}
                    name={id}
                    value={value}
                />
                {error && <label>{errMsg}</label>}
            </div>
        )
    }
    // default input return
    return (
        <div className={classes + errorClass} style={{display: type == 'hidden' ? 'none' : ''}}>
            <label>{label}</label>
            <input
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

export default Input;