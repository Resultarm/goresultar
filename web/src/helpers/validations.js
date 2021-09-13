export const isTextValid = (text, min, max) => {
    return text && text.length >= min && (text.length <= max || max === 0);
};
