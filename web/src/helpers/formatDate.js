import moment from "moment";

export default (ts) => {
  return moment(ts).format("DD/MM/YYYY");
};
