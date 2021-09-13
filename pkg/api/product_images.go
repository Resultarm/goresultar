package api

import (
	"bytes"
	m "gerenciador/pkg/models"
	"io"
	"io/ioutil"
	"net/http"
	"os"
	"path"
)

// func (hs *HTTPServer) CreateProductImage(ctx *m.AdminReqContext) Response {

// 	logger := hs.log.New("CreateProduct")
// 	if err := ctx.Req.ParseForm(); err != nil {
// 		logger.Error(err.Error())
// 		return InternalServerError(err)
// 	}
// 	prodId, err := id.FromString(ctx.Params(":id"))
// 	if err != nil {
// 		logger.Error(err.Error())
// 		return Error(http.StatusUnprocessableEntity, "could not parse id", err)
// 	}

// 	product, err := hs.ProductsRepo.FindOne(m.FindByIdQuery{prodId}, false)
// 	if err != nil {
// 		logger.Error(err.Error())
// 		return InternalServerError(err)
// 	}

// 	_, header, err := ctx.Req.FormFile("file")
// 	if err != nil {
// 		logger.Error(err.Error())
// 		return Error(http.StatusBadRequest, "could not process file", err)
// 	}

// 	//if header.Size > hs.Cfg.MaxFileSize {
// 	//	return Error(http.StatusBadRequest,
// 	//		fmt.Sprintf("file should not be larger than %v", humanize.Bytes(uint64(hs.Cfg.MaxFileSize))), nil)
// 	//}

// 	//todo add fileservice

// 	contentType := header.Header.Get("Content-Type")
// 	if !util.AllowedImageType(contentType) {
// 		return Error(http.StatusBadRequest,
// 			"unsupported image type: should be jpeg, png, jpg", nil)
// 	}
// 	fileName, err := hs.FileSaver.SaveFile("", header)
// 	if err != nil {
// 		logger.Error(err.Error())
// 		return Error(http.StatusUnprocessableEntity, "could not upload file", err)
// 	}
// 	product, _ = hs.ProductsRepo.Update(m.FindByIdQuery{prodId}, bson.M{
// 		"images": append(product.Images, m.ProductImage{
// 			Id:      id.New(),
// 			Link:    fileName,
// 			Comment: ctx.Req.Form.Get("comment"),
// 		}),
// 	})

// 	//todo generate QR code product url page url and it name, price and status
// 	return Success("product image created")
// }
// func (hs *HTTPServer) GetProductImages(ctx *macaron.Context) Response {
// 	logger := hs.log.New("GetProductImages")

// 	prodId, err := id.FromString(ctx.Params(":id"))
// 	if err != nil {
// 		logger.Error(err.Error())
// 		return Error(http.StatusUnprocessableEntity, "could not parse id", err)
// 	}

// 	product, err := hs.ProductsRepo.FindOne(m.FindByIdQuery{prodId}, false)
// 	if err != nil {
// 		logger.Error(err.Error())
// 		return InternalServerError(err)
// 	}

// 	if len(product.Images) == 0 {
// 		return JSON(http.StatusOK, []interface{}{})
// 	}
// 	images := []m.ProductImage{}
// 	for _, img := range product.Images {
// 		images = append(images, m.ProductImage{
// 			Id:      img.Id,
// 			Link:    "/assets/" + img.Link,
// 			Comment: img.Comment,
// 		})
// 	}

// 	return JSON(http.StatusOK, images)

// }
// func (hs *HTTPServer) DeleteProductImage(ctx *macaron.Context) Response {
// 	logger := hs.log.New("GetProductImages")

// 	prodId, err := id.FromString(ctx.Params(":id"))
// 	if err != nil {
// 		logger.Error(err.Error())
// 		return Error(http.StatusUnprocessableEntity, "could not parse id", err)
// 	}

// 	imageId, err := id.FromString(ctx.Params(":imageId"))
// 	if err != nil {
// 		logger.Error(err.Error())
// 		return Error(http.StatusUnprocessableEntity, "could not parse id", err)
// 	}

// 	product, err := hs.ProductsRepo.FindOne(m.FindByIdQuery{prodId}, false)
// 	if err != nil {
// 		logger.Error(err.Error())
// 		return InternalServerError(err)
// 	}

// 	images := []m.ProductImage{}
// 	for _, img := range product.Images {
// 		if img.Id == imageId {
// 			continue
// 		}
// 		images = append(images, img)
// 	}

// 	product, err = hs.ProductsRepo.Update(m.FindByIdQuery{prodId},
// 		bson.M{"images": images})
// 	if err != nil {
// 		logger.Error(err.Error())
// 		return InternalServerError(err)
// 	}

// 	return JSON(http.StatusOK, images)

// }

func (hs *HTTPServer) ServeProductImage(ctx *m.AdminReqContext) {
	logger := hs.log.New("ServeImage")
	f, err := os.Open(path.Join("data", ctx.Params("entity"), ctx.Params("name")))
	if err != nil {
		logger.Error(err.Error())
		return
	}
	defer f.Close()

	cont, err := ioutil.ReadAll(f)
	if err != nil {
		logger.Error(err.Error())
		return
	}

	// Only the first 512 bytes are used to sniff the content type.
	contType := http.DetectContentType(cont[:512])
	ctx.Resp.Header().Set("Content-Type", contType)

	//ctx.ServeFile(ctx.Params("name"))
	_, err = io.Copy(ctx.Resp, bytes.NewBuffer(cont))
	if err != nil {
		logger.Error(err.Error())
		return
	}
}
