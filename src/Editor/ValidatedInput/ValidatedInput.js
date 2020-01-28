import React, { useState } from "react";

import "./ValidatedInput.css";

function ValidatedInput(props) {
  const [touched, setTouched] = useState(false);

  function handleBlur() {
    if (!touched) setTouched(true);
    props.onBlur();
  }

  return (
    <div className={props.inline ? "input-field inline" : "input-field"}>
      <input
        id={props.identification}
        name={props.name}
        type={props.type}
        className={props.errorMessage && touched ? "invalid" : "validate"}
        {...(props.placeholder && { placeholder: props.placeholder })}
        {...(props.onChange && { onChange: props.onChange })}
        {...(props.value && { value: props.value })}
        {...(props.autocomplete && { autocomplete: props.autocomplete })}
        {...(props.onBlur && { onBlur: handleBlur })}
        // {...props.input}
        style={{
          paddingLeft: "13px",
          paddingRight: "13px"
        }}
      />
      {/* {props.label && (
        <label htmlFor={props.identification}>{props.label}</label>
      )} */}
      {props.errorMessage && (
        <span className="helper-text" data-error={props.errorMessage} />
      )}
    </div>
  );
}

export default ValidatedInput;
