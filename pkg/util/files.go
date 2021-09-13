package util

var imageTypes = []string{
	"image/jpeg",
	"image/png",
	"application/pdf",
}

func AllowedImageType(contentType string) bool {
	for _, t := range imageTypes {
		if contentType == t {
			return true
		}
	}
	return false
}
