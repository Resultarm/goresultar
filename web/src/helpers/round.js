//const round = (n) => Number(n.toFixed(2));
const round = (n) => Number((n / 100).toFixed(2) * 100);
export default round;
