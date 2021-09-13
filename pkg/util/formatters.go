package util

import (
	"golang.org/x/text/language"
	"golang.org/x/text/message"
)

func FormatCurrencyFloat(valor float64, dec int) string {
	p := message.NewPrinter(language.BrazilianPortuguese)

	formatZ := "R$ %.0f"

	format2 := "R$ %.2f"

	if dec == 0 {
		return p.Sprintf(formatZ, valor)
	}
	return p.Sprintf(format2, valor)
}

func FormatCurrencyInt(valor int) string {
	p := message.NewPrinter(language.BrazilianPortuguese)
	return p.Sprintf("R$ %.2f", float64(valor/100))
}
