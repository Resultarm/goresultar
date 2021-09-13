import React from "react";
import { Form } from "semantic-ui-react";
import currencyParser from "../../helpers/currencyParser";
import currencyFormatter from "../../helpers/currencyFormatter";
import { useState } from "react";

const isNumberValid = (number) => {
  if (typeof number === "number") {
    return number > 0;
  } else if (typeof number === "string") {
    return /(?=.*?\d)^\$?(([1-9]\d{0,2}(\.\d{3})*)|\d+)?(,\d{1,2})?$/.test(
      number
    );
  } else {
    return false;
  }
};

const isNumericInput = (event) => {
  const key = event.keyCode;
  return (
    (key >= 48 && key <= 57) || // Allow number line
    (key >= 96 && key <= 105) || // Allow number pad
    key === 188 ||
    key === 190
  );
};

const isModifierKey = (event) => {
  const key = event.keyCode;
  return (
    event.shiftKey === true ||
    key === 35 ||
    key === 36 || // Allow Shift, Home, End
    key === 8 ||
    key === 9 ||
    key === 13 ||
    key === 46 || // Allow Backspace, Tab, Enter, Delete
    (key > 36 && key < 41) || // Allow left, up, right, down
    // Allow Ctrl/Command + A,C,V,X,Z
    ((event.ctrlKey === true || event.metaKey === true) &&
      (key === 65 || key === 67 || key === 86 || key === 88 || key === 90))
  );
};

const enforceFormat = (event) => {
  // Input must be of a valid number format or a modifier key, and not longer than ten digits
  if (!isNumericInput(event) && !isModifierKey(event)) {
    event.preventDefault();
  }
};

function InputCost({ onChange, value, defaultValue, ...rest }) {
  const [isValid, setIsValid] = useState(true);
  const validate = (event) => {
    if (event.target.value === "") {
      onChange(0);
      return;
    }
    if (!isNumberValid(event.target.value)) {
      setIsValid(false);
    } else {
      onChange(currencyParser(event.target.value));
      setIsValid(true);
    }
  };
  return (
    <Form.Input
      onKeyDown={enforceFormat}
      {...rest}
      error={!isValid}
      onChange={validate}
      defaultValue={
        defaultValue === undefined
          ? undefined
          : currencyFormatter.format(defaultValue)
      }
      value={value === undefined ? undefined : currencyFormatter.format(value)}
    />
  );
}

export default InputCost;
