package main

import (
	"context"
	"fmt"
	"gerenciador/pkg/api"
	"gerenciador/pkg/log"
	"gerenciador/pkg/services/registry"
	"gerenciador/pkg/settings"
	"os"

	"github.com/facebookgo/inject"
	"github.com/pkg/errors"
	"golang.org/x/sync/errgroup"
	"golang.org/x/xerrors"
)

func NewServer() *Server {
	rootCtx, shutdownFn := context.WithCancel(context.Background())
	childRoutines, childCtx := errgroup.WithContext(rootCtx)

	cfg := settings.NewCfg()

	return &Server{
		context:       childCtx,
		shutdownFn:    shutdownFn,
		childRoutines: childRoutines,
		log:           log.New("server"),
		cfg:           cfg,
		HTTPServer:    &api.HTTPServer{DB: nil},
	}
}

// Server is responsible for managing the lifecycle of services.
type Server struct {
	context            context.Context
	shutdownFn         context.CancelFunc
	childRoutines      *errgroup.Group
	log                log.Logger
	cfg                *settings.Config
	shutdownReason     string
	shutdownInProgress bool

	HTTPServer *api.HTTPServer `inject:""`
}

func (s *Server) Run() (err error) {
	s.initConfig()

	services := registry.GetServices()

	err = s.buildServiceGraph(services)
	if err != nil {
		fmt.Println(err.Error())
		os.Exit(1)
	}
	// Initialize services.
	for _, service := range services {
		if registry.IsDisabled(service.Instance) {
			continue
		}

		s.log.Info("Initializing " + service.Name)

		if err := service.Instance.Init(); err != nil {
			return errors.New(err.Error() + "Service init failed")
		}
	}

	// Start background services.
	for _, svc := range services {
		service, ok := svc.Instance.(registry.BackgroundService)
		if !ok {
			continue
		}

		if registry.IsDisabled(svc.Instance) {
			continue
		}

		// Variable is needed for accessing loop variable in callback
		descriptor := svc
		s.childRoutines.Go(func() error {
			// Don't start new services when server is shutting down.
			if s.shutdownInProgress {
				return nil
			}

			err := service.Run(s.context)
			// Mark that we are in shutdown mode
			// So no more services are started
			s.shutdownInProgress = true
			if err != nil {
				if err != context.Canceled {
					// Server has crashed.
					s.log.Error("Stopped "+descriptor.Name, "reason", err)
				} else {
					s.log.Info("Stopped "+descriptor.Name, "reason", err)
				}

				return err
			}

			return nil
		})
	}

	defer func() {
		//s.log.Debug("Waiting on services...")
		if waitErr := s.childRoutines.Wait(); waitErr != nil {
			s.log.Error("A service failed", "err", waitErr)
			if err == nil {
				err = waitErr
			}
		}
	}()

	return
}

func (s *Server) Shutdown(reason string) {
	s.log.Info("Shutdown started", "reason", reason)
	s.shutdownReason = reason
	s.shutdownInProgress = true

	// call cancel func on root context
	s.shutdownFn()

	// wait for child routines
	if err := s.childRoutines.Wait(); err != nil && !xerrors.Is(err, context.Canceled) {
		s.log.Error("Failed waiting for services to shutdown", "err", err)
	}
}
func (s *Server) ExitCode(reason error) int {
	code := 1

	if reason == context.Canceled && s.shutdownReason != "" {
		reason = fmt.Errorf(s.shutdownReason)
		code = 0
	}

	s.log.Error("Server shutdown", "reason", reason)

	return code
}
func (s *Server) buildServiceGraph(services []*registry.Descriptor) error {
	// Specify service dependencies.
	var g inject.Graph

	objs := []interface{}{
		&s.cfg.MongoConf,
		s.cfg,
		s,
	}

	for _, service := range services {
		objs = append(objs, service.Instance)
	}
	//Provide services and their dependencies to the graph.
	for _, obj := range objs {
		if err := g.Provide(&inject.Object{Value: obj}); err != nil {
			return errors.New("Failed to provide object to the graph " + err.Error())
		}
	}
	//
	//// Resolve services and their dependencies.
	if err := g.Populate(); err != nil {
		return errors.New("Failed to populate service dependency" + err.Error())
	}

	return nil
}
