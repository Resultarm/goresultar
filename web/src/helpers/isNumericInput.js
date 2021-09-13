export default (keyCode) => {
  return (
    (keyCode >= 48 && keyCode <= 57) || // Allow number line
    (keyCode >= 96 && keyCode <= 105) // Allow number pad
  );
};
