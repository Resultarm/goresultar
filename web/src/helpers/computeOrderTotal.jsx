import round from "./round";

const computeOrderTotal = (selectedProducts, discount = 0) => {
  let total = 0;
  for (const id in selectedProducts) {
    const p = selectedProducts[id];
    let space = (p.measurementValue || []).reduce((v, acc, i) => acc * v, 1);
    total += (p.quantity || 0) * p.price * space;
  }

  if (discount === 0) return total;

  return total - Number(((total * discount) / 100).toFixed(2));
};

export default computeOrderTotal;
