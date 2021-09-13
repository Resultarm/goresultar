package fileService

import (
	"gerenciador/pkg/log"
	"gerenciador/pkg/services/registry"
	"gerenciador/pkg/settings"
	"gerenciador/pkg/util"
	"io"
	"mime/multipart"
	"os"
	"path"
	"path/filepath"
)

func init() {
	registry.Register(&registry.Descriptor{
		Name:     "FileService",
		Priority: registry.Medium,
		Instance: &Service{},
	})
}

type Service struct {
	cfg settings.Config

	log log.Logger
}

func (srv *Service) Init() error {
	srv.log = log.New("Service")
	return nil
}

func (srv *Service) SaveFile(savepath string, header *multipart.FileHeader) (string, error) {
	f, err := header.Open()
	if err != nil {
		srv.log.Error(err.Error())
		return "", err
	}
	defer f.Close()

	fileName := util.RandomString(8) + filepath.Ext(header.Filename)

	//if err = os.MkdirAll("/data/", 0777); err != nil {
	//	srv.log.Error(err.Error())
	//	return "", err
	//}
	os.MkdirAll(path.Join("data", savepath), 0777)

	f2, err := os.Create(path.Join("data", savepath, fileName))
	if err != nil {
		srv.log.Error(err.Error())
		return "", err
	}
	defer f2.Close()

	_, err = io.Copy(f2, f)
	if err != nil {
		srv.log.Error(err.Error())
		return "", err
	}

	return fileName, nil
}
