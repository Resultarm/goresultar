import { nf } from "src/helpers";

const measurementValueDisplay = (measurements = []) => measurements.map(nf).join(" x ");

export default measurementValueDisplay;
