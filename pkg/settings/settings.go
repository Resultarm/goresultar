package settings

const (
	Dev  = "development"
	Prod = "production"
)

var (
	Environment = Dev
)

type Config struct {
	//Jwt settings

	//server settings
	HttpAddr     string
	HttpPort     string
	HttpProtocol string
	//mgo settings
	MongoConf MongoConf

	//log
	LogsPath string

	//file manager
	Directory   string
	MaxFileSize int64

	//Jwt
	JwtKey string
}

type MongoConf struct {
	Host         string
	Port         string
	DatabaseName string
}

func NewCfg() *Config {
	return &Config{}
}
