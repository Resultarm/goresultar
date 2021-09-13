package main

import (
	"gerenciador/pkg/log"
	"path/filepath"
	"strings"

	"github.com/pkg/errors"
	"gopkg.in/ini.v1"
)

var confPath = "config/config.ini"

func (s *Server) initConfig() (err error) {
	confFile, err := ini.Load(confPath)
	if err != nil {
		s.log.Error("config file not found at ", confPath)
		return
	}

	//mongo
	mongo := confFile.Section("mongo")
	s.cfg.MongoConf.Host = mongo.Key("host").String()
	s.cfg.MongoConf.Port = mongo.Key("port").String()
	s.cfg.MongoConf.DatabaseName = mongo.Key("database").String()

	//todo extract from config file
	//http
	httpSection := confFile.Section("http")
	s.cfg.HttpAddr = httpSection.Key("addr").MustString("localhost")
	s.cfg.HttpPort = httpSection.Key("port").MustString("3000")
	s.cfg.HttpProtocol = httpSection.Key("protocol").MustString("http")

	//file manager
	fileManager := confFile.Section("file_manager")
	s.cfg.Directory = fileManager.Key("dir").MustString("data")
	s.cfg.MaxFileSize = fileManager.Key("max_size").MustInt64(2097152)

	jwt := confFile.Section("jwt")
	s.cfg.JwtKey = jwt.Key("secret").MustString("")

	s.initLogging(confFile)
	return
}

func (s *Server) initLogging(file *ini.File) error {
	cfg := s.cfg
	logModeStr, err := valueAsString(file.Section("log"), "mode", "console")
	if err != nil {
		return err
	}
	// split on comma
	logModes := strings.Split(logModeStr, ",")
	// also try space
	if len(logModes) == 1 {
		logModes = strings.Split(logModeStr, " ")
	}
	logsPath, err := valueAsString(file.Section("paths"), "logs", "")
	if err != nil {
		return err
	}
	cfg.LogsPath = logsPath
	return log.ReadLoggingConfig(logModes, cfg.LogsPath, file)
}

func makeAbsolute(path string, root string) string {
	if filepath.IsAbs(path) {
		return path
	}
	return filepath.Join(root, path)
}

func valueAsString(section *ini.Section, keyName string, defaultValue string) (value string, err error) {
	defer func() {
		if err_ := recover(); err_ != nil {
			err = errors.New("Invalid value for key '" + keyName + "' in configuration file")
		}
	}()

	return section.Key(keyName).MustString(defaultValue), nil
}
