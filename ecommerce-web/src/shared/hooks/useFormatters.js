import { useContext, useMemo } from "react";
import { LocaleContext } from "shared/contexts";

const localeCurrencies = {
  "pt-BR": "BRL",
};

const useFormatters = () => {
  const { locale } = useContext(LocaleContext);

  return useMemo(
    () => ({
      cf: new Intl.NumberFormat(locale, {
        style: "currency",
        currency: localeCurrencies[locale],
      }).format,
      nf: (n) => n.toLocaleString(locale),
      df: (d) => d.toLocaleString(locale),
    }),
    [locale]
  );
};

export default useFormatters;
