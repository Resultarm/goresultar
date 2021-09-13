package main

import (
	"context"
	"encoding/json"
	"fmt"
	authrest "gerenciador/ecommerce/auth/rest"
	authsvc "gerenciador/ecommerce/auth/service"
	orderrest "gerenciador/ecommerce/order/rest"
	"gerenciador/pkg/log"
	"gerenciador/pkg/resource"
	"gerenciador/pkg/services/database"
	"gerenciador/pkg/services/recaptcha"
	"gerenciador/pkg/services/server"
	"gerenciador/pkg/services/session"
	"gerenciador/pkg/services/view"
	"net/http"
	"os"
	"os/signal"
	"runtime/trace"
	"strings"
	"syscall"
	"time"

	casbin "github.com/casbin/casbin/v2"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"github.com/gin-gonic/gin"
)

func serveResource(w http.ResponseWriter, req *http.Request) {
	path := "./public" + req.URL.Path
	http.ServeFile(w, req, path)
}

// configuration contains the application settings
type configuration struct {
	Database database.Info `json:"Database"`
	// Email     email.SMTPInfo  `json:"Email"`
	Recaptcha recaptcha.Info  `json:"Recaptcha"`
	Server    server.Server   `json:"Server"`
	Session   session.Session `json:"Session"`
	Template  view.Template   `json:"Template"`
	View      view.View       `json:"View"`
}

// ParseJSON unmarshals bytes to structs
func (c *configuration) ParseJSON(b []byte) error {
	return json.Unmarshal(b, &c)
}

func main() {

	var srv = NewServer()
	srv.initConfig()
	go listenToSystemSignals(srv)

	mongoURI := fmt.Sprintf("mongodb://%s:%s", srv.cfg.MongoConf.Host, srv.cfg.MongoConf.Port)
	mongoClient, err := mongo.NewClient(options.Client().ApplyURI(mongoURI))
	if err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)

	err = mongoClient.Connect(ctx)
	if err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
	defer cancel()

	enforcer, err := casbin.NewEnforcer("rbac_model.conf", "auth_policy.csv")
	if err != nil {
		fmt.Println(err)
		os.Exit(1)
	}

	db := mongoClient.Database(srv.cfg.MongoConf.DatabaseName)
	resrc := resource.New(db, enforcer)
	srv.HTTPServer.DB = db

	authhandler := authrest.New(resrc, []byte(srv.cfg.JwtKey))
	orderhandler := orderrest.New(resrc)

	r := gin.Default()
	r.GET("/ping", func(c *gin.Context) { c.JSON(200, gin.H{"message": "pong"}) })

	api := r.Group("/api/v1")

	api.Use(func(ctx *gin.Context) {

		if ctx.Request.URL.Path == "/api/v1/login" {
			return
		}
		authHeader := ctx.GetHeader("Authorization")
		tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenStr == "" {
			tokenStr, _ = ctx.GetQuery("_token")
		}
		if tokenStr == "" {
			ctx.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"message": "access token is required"})
			return
		}

		user, err := authsvc.AuthCheck([]byte(srv.cfg.JwtKey), tokenStr)
		if err != nil {
			ctx.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"message": err.Error()})
			return
		}

		ctx.Set("user", user)

		ctx.Next()
	})

	api.POST("/login", authhandler.Login)
	api.GET("/orders", orderhandler.GetAll)

	go func() {

		r.Run() // listen and serve on 0.0.0.0:8080 (for windows "localhost:8080")
	}()

	err = srv.Run()

	code := srv.ExitCode(err)

	trace.Stop()

	os.Exit(code)

	////todo extract these into a separate file server
	//http.Handle("/products/", http.StripPrefix("/products", http.FileServer(http.Dir("products/"))))
	//
	//http.Handle("/expenses/", http.StripPrefix("/expenses", http.FileServer(http.Dir("expenses/"))))
	//
	//http.Handle("/cheques/", http.StripPrefix("/cheques", http.FileServer(http.Dir("cheques/"))))

}
func listenToSystemSignals(server *Server) {
	signalChan := make(chan os.Signal, 1)
	sighupChan := make(chan os.Signal, 1)

	signal.Notify(sighupChan, syscall.SIGHUP)
	signal.Notify(signalChan, os.Interrupt, syscall.SIGTERM)

	for {
		select {
		case <-sighupChan:
			log.Reload()
		case sig := <-signalChan:
			server.Shutdown(fmt.Sprintf("System signal: %s", sig))
		}
	}
}
