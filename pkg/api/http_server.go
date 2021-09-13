package api

import (
	"context"
	"fmt"
	"gerenciador/pkg/log"
	"gerenciador/pkg/middleware"
	m "gerenciador/pkg/models"
	"gerenciador/pkg/services/auth"
	"gerenciador/pkg/services/fileService"
	"gerenciador/pkg/services/mongostore"
	_ "gerenciador/pkg/services/mongostore"
	"gerenciador/pkg/services/registry"
	"gerenciador/pkg/settings"
	"net"
	"net/http"
	"sync"

	"github.com/pkg/errors"
	"github.com/withmandala/go-log/colorful"
	"go.mongodb.org/mongo-driver/mongo"
	"gopkg.in/macaron.v1"
)

func init() {
	registry.Register(&registry.Descriptor{
		Name:     "HTTPServer",
		Instance: &HTTPServer{},
		Priority: registry.Low,
	})
}

type HTTPServer struct {
	Am                      *macaron.Macaron                    `inject:""`
	Cfg                     *settings.Config                    `inject:""`
	ProductsRepo            m.ProductsRepository                `inject:""`
	OrdersRepo              m.OrdersRepository                  `inject:""`
	OrganizationsRepo       m.OrganizationsRepository           `inject:""`
	TransactionsRepo        m.TransactionsRepository            `inject:""`
	ClientsRepo             m.ClientsRepository                 `inject:""`
	AdminRepo               m.AdminsRepository                  `inject:""`
	SubCategoryRepository   m.SubCategoryRepository             `inject:""`
	CategoryRepository      m.CategoryRepository                `inject:""`
	ProductModelsRepository m.ProductModelsRepository           `inject:""`
	BrandRepository         m.BrandRepository                   `inject:""`
	DepartmentRepository    m.DepartmentRepository              `inject:""`
	FileSaver               *fileService.Service                `inject:""`
	AuthService             *auth.Service                       `inject:""`
	Cheque                  mongostore.ChequeRepository         `inject:""`
	Expense                 mongostore.ExpenseRepository        `inject:""`
	ExpensePayment          mongostore.ExpensePaymentRepository `inject:""`
	Onboarding              mongostore.OnboardingRepository     `inject:""`
	Service                 mongostore.ServiceRepository        `inject:""`
	Task                    mongostore.TaskRepository           `inject:""`
	Vehicle                 mongostore.VehicleRepository        `inject:""`

	DB      *mongo.Database
	log     log.Logger
	httpSrv *http.Server
}

func (hs *HTTPServer) Init() error {
	//todo add loggers
	hs.log = log.New("http.server")
	hs.Am = macaron.NewWithLogger(log.NewLogWriter(log.New(""), log.LvlInfo, "macaron"))

	hs.Am.Map(hs.log)
	hs.Am.Use(logger())

	hs.Am.Use(macaron.Renderer())
	hs.Am.Use(middleware.Recovery())
	hs.routes()

	hs.Am.Use(macaron.Static("public/swagger", macaron.StaticOptions{
		Prefix:    "docs",
		IndexFile: "index.html",
	}))

	return nil
}

func (hs *HTTPServer) Run(ctx context.Context) error {
	hs.httpSrv = &http.Server{
		Addr:    fmt.Sprintf("%s:%s", hs.Cfg.HttpAddr, hs.Cfg.HttpPort),
		Handler: hs.Am,
	}

	hs.log.Info("HTTP Server Listen", "address", hs.Cfg.HttpAddr, "port", hs.Cfg.HttpPort)

	var wg sync.WaitGroup
	wg.Add(1)

	// handle http shutdown on server context done
	go func() {
		defer wg.Done()

		<-ctx.Done()
		if err := hs.httpSrv.Shutdown(context.Background()); err != nil {
			hs.log.Error("Failed to shutdown server", "error", err.Error())
		}
	}()
	listener, err := net.Listen("tcp", hs.httpSrv.Addr)
	if err != nil {
		return errors.WithMessage(err, fmt.Sprintf("failed to open listener on address %s", hs.httpSrv.Addr))
	}
	if err := hs.httpSrv.Serve(listener); err != nil {
		if err == http.ErrServerClosed {
			hs.log.Info("server was shutdown gracefully")
			return nil
		}
		return err
	}
	wg.Wait()

	return nil
}

func logger() macaron.Handler {
	return func(ctx *macaron.Context, log log.Logger) {
		rw := ctx.Resp.(macaron.ResponseWriter)
		ctx.Next()
		colorFunc := colorful.Green

		var content string
		if settings.Environment == settings.Dev {
			content = fmt.Sprintf("Completed %s %s", ctx.Req.Method, ctx.Req.RequestURI)
		} else {
			content = fmt.Sprintf("Completed %s %s", ctx.Req.Method, ctx.Req.URL.Path)
		}
		statusInfo := fmt.Sprintf("%v %v", rw.Status(), http.StatusText(rw.Status()))
		switch rw.Status() / 100 {
		case 2:
			log.Info(content)
		case 3:
			colorFunc = colorful.Orange
			content = fmt.Sprintf("%s %s", content, colorFunc([]byte(statusInfo)))
			log.Info(content)
		case 4:
			colorFunc = colorful.Orange
			content = fmt.Sprintf("%s %s", content, colorFunc([]byte(statusInfo)))
			log.Warn(content)
		case 5:
			colorFunc = colorful.Red
			content = fmt.Sprintf("%s %s", content, colorFunc([]byte(statusInfo)))
			log.Error(content)
		}

	}
}
