export default function includes(input, searchText) {
  if (input === undefined || input === null) return false;

  const trimmed = searchText.trim();
  if (!trimmed) return true;

  const stringified = typeof input === "string" ? input : JSON.stringify(input);

  return stringified.toLowerCase().includes(trimmed.toLowerCase().toString());
}
