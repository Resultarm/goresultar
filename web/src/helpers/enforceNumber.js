import isNumericInput from "./isNumericInput";

export default (e) => {
  const keyCode = e.keyCode;
  if (
    !(
      isNumericInput(keyCode) ||
      keyCode === 188 ||
      keyCode === 190 ||
      keyCode === 8 ||
      keyCode === 9
    )
  ) {
    e.preventDefault();
    return;
  }
};
