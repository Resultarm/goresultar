export default function safeget(object, path, defaultVal) {
  if (typeof object === "undefined" || object === null) {
    return defaultVal;
  }
  if (path.length === 0) {
    return object;
  }

  return safeget(object[path.shift()], path, defaultVal);
}
