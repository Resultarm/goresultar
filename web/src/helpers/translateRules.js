export default (t, rules) => {
  const translatedRules = {};
  for (let prop in rules) {
    if (rules.hasOwnProperty(prop)) {
      translatedRules[prop] = rules[prop].map((r) => ({ ...r, message: r.message ? t(r.message) : undefined }));
    }
  }
  return translatedRules;
};
