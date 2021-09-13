import { nf } from "src/helpers";
import { CUBIC_METER, LINEAR_METER, SQUARE_METER, UNIT } from "../../DimensionFields/constants";

function MeasurementValueDisplay({ type, value }) {
  switch (type) {
    case UNIT:
      return "";
    case LINEAR_METER:
      return `${__("Meters")}: ${nf(value[0])}`;

    case SQUARE_METER:
      return `${__("Width")}: ${nf(value[0])}, ${__("Length")}: ${nf(value[1])}`;
    case CUBIC_METER:
      return `${__("Width")}: ${nf(value[0])}, ${__("Length")}: ${nf(value[1])}, ${__("Height")}: ${nf(value[2])}`;

    default:
      return value;
  }
}

export default MeasurementValueDisplay;
