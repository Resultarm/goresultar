import moment from "moment";
import safeget from "./safeget";

const defaultValues = {
  string: "",
  number: 0,
  date: "",
};

export default function sorter(field, compareType) {
  const getValue =
    typeof field === "function"
      ? field
      : (o) => safeget(o, field.split("."), defaultValues[compareType]);
  switch (compareType) {
    case "string": {
      return (a, b) => getValue(a).localeCompare(getValue(b));
    }
    case "number": {
      return (a, b) => getValue(a) - getValue(b);
    }
    case "date": {
      return (a, b) => moment(getValue(a)).diff(moment(getValue(b)));
    }
    default:
      return (a, b) => 0;
  }
}
