const Checkbox = ({show, classes, label, type, onCheckbox, choices, inputs, error, errMsg}) => {
    const errorClass = error ? ' error' : '';
    return (
        !show ? null :
        <div className={classes + errorClass}>
            <label>{label}</label>
            {choices.map((choice, index) => {
                return (
                    <React.Fragment key={inputs[index].id}>
                        <input
                            id={inputs[index].id}
                            type={type}
                            onChange={onCheckbox}
                            value={choice.value}
                            name={inputs[index].id}
                        />
                        <label>{inputs[index].label}</label>
                    </React.Fragment>
                )
            })}
            {error && <label>{errMsg}</label>}
        </div>
    );
};

export default Checkbox;