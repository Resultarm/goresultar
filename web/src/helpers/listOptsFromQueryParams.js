const filtersFromQueryParams = () => {
  const searchParams = new URLSearchParams(window.location.search);
  return {
    from: searchParams.get("from"),
    to: searchParams.get("to"),
  };
};

export default filtersFromQueryParams;
