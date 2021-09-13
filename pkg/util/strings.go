package util

import (
	"math/rand"
	"regexp"
	"time"
)

func SplitString(str string) []string {
	if len(str) == 0 {
		return []string{}
	}

	return regexp.MustCompile("[, ]+").Split(str, -1)
}

const letterBytes = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

var seededRand = rand.New(
	rand.NewSource(time.Now().UnixNano()))

func RandomString(n int) string {
	b := make([]byte, n)
	for i := range b {
		b[i] = letterBytes[seededRand.Intn(len(letterBytes))]
	}
	return string(b)
}
