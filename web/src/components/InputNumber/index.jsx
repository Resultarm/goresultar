import React from "react";
import { Form } from "semantic-ui-react";

const isNumericInput = (event) => {
  const key = event.keyCode;
  return (
    (key >= 48 && key <= 57) || // Allow number line
    (key >= 96 && key <= 105) // Allow number pad
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

const NUM_LENGTH = 11;
const enforceFormat = (event) => {
  // Input must be of a valid number format or a modifier key, and not longer than ten digits
  if (!isNumericInput(event) && !isModifierKey(event)) {
    event.preventDefault();
  }
};

const formatEVToPhone = (event) => {
  if (isModifierKey(event)) {
    return;
  }

  event.target.value = formatToPhone(event.target.value);
};
const formatToPhone = (number) => {
  const input = number.replace(/\D/g, "").substring(0, NUM_LENGTH); // First ten digits of input only
  const area = input.substring(0, 2);
  const middle = input.substring(2, 7);
  const last = input.substring(7, NUM_LENGTH);

  if (input.length > 7) {
    return `(${area}) ${middle} - ${last}`;
  } else if (input.length > 2) {
    return `(${area}) ${middle}`;
  } else if (input.length > 0) {
    return `(${area}`;
  }
};

const InputNumber = ({ onChange, defaultValue, ...props }) => {
  const handleChange = (e) => {
    onChange(
      Number(e.target.value.replace(/\D/g, "").substring(0, NUM_LENGTH))
    );
  };
  return (
    <Form.Input
      placeholder="(00) 00000 - 0000"
      onKeyDown={enforceFormat}
      onKeyUp={formatEVToPhone}
      onChange={handleChange}
      maxLength={17}
      defaultValue={
        defaultValue ? formatToPhone(defaultValue.toString()) : undefined
      }
      {...props}
    />
  );
};

export default InputNumber;

//https://stackoverflow.com/a/30058928/6748719
