import { useMemo } from "react";
import { useAPI } from "src/hooks";

function useProductProfits(filters = {}) {
  const searchParams = new URLSearchParams(filters).toString();
  const [{ data: products = [] } = {}, status] = useAPI(`/api/v2/analytics/product/profits?${searchParams}`);

  const productMap = useMemo(() => Object.fromEntries(products.map(({ _id, profit }) => [_id, profit])), [products]);

  return { data: productMap, status };
}

export default useProductProfits;
