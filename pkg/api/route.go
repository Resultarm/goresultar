package api

import (
	"context"
	"fmt"
	"gerenciador/pkg/middleware"
	"gerenciador/pkg/resource"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	ginbinding "github.com/gin-gonic/gin/binding"
	"github.com/go-macaron/binding"
	validator "github.com/go-playground/validator/v10"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	analyticsrest "gerenciador/pkg/analytics/rest"
	clientREST "gerenciador/pkg/client/rest"
	departmentREST "gerenciador/pkg/department/rest"
	"gerenciador/pkg/middleware/acl"
	orderrest "gerenciador/pkg/order/rest"
	productREST "gerenciador/pkg/product/rest"
	roleREST "gerenciador/pkg/role/rest"

	hr "gerenciador/pkg/middleware/httprouterwrapper"
	"gerenciador/pkg/middleware/logrequest"
	m "gerenciador/pkg/models"
	"gerenciador/pkg/services/session"

	"github.com/casbin/casbin/v2"
	mongodbadapter "github.com/casbin/mongodb-adapter/v3"

	gcontext "github.com/gorilla/context"
	"github.com/josephspurrier/csrfbanana"
	"github.com/julienschmidt/httprouter"
	"github.com/justinas/alice"
)

//todo move http/https middleware onto http server initialization
//// Load returns the routes and middleware
//func (hs *HTTPServer) Load() http.Handler {
//	return middleware(hs.routes())
//}
//
//// LoadHTTPS returns the HTTP routes and middleware
//func (hs *HTTPServer) LoadHTTPS() http.Handler {
//	return middleware(hs.routes())
//}
//
//// LoadHTTP returns the HTTPS routes and middleware
//func (hs *HTTPServer) LoadHTTP() http.Handler {
//	return middleware(hs.routes())
//
//	// Uncomment this and comment out the line above to always redirect to HTTPS
//	//return http.HandlerFunc(redirectToHTTPS)
//}

// Optional method to make it easy to redirect from HTTP to HTTPS
func redirectToHTTPS(w http.ResponseWriter, req *http.Request) {
	http.Redirect(w, req, "https://"+req.Host, http.StatusMovedPermanently)
}

func (hs *HTTPServer) routes() /**httprouter.Router*/ {
	r := httprouter.New()
	e := gin.New()
	e.Use(gin.Recovery())

	if v, ok := ginbinding.Validator.Engine().(*validator.Validate); ok {
		v.RegisterValidation("MongoID", MongoIDValidator, true)
	}

	hs.Am.Use(hs.InitAdminContext())
	bind := binding.Bind

	mac := hs.Am

	mac.Group("/api", func() {

		// mac.Post("/refresh", middleware.RequireAuth(), bind(m.Token{}), Wrap(hs.RefreshToken))

		mac.Get("/dashboard", middleware.Auth(m.OperationDashboard), Wrap(hs.GetDashboard))

		mac.Group("/products", func() {
			mac.Get("/", Wrap(hs.GetProducts))
			mac.Get("-stats", Wrap(hs.GetProductsStats))
			mac.Post("/", bind(m.ProductRequest{}), Validate, Wrap(hs.CreateProduct))

			mac.Group("/:id", func() {
				mac.Get("/", Wrap(hs.GetProduct))
				mac.Put("/", Wrap(hs.UpdateProduct))
				mac.Delete("/", Wrap(hs.DeleteProduct))
			})
		}, middleware.RequireAuth(), middleware.Auth(m.OperationProducts))

		mac.Group("/orders", func() {
			mac.Get("/", Wrap(hs.GetOrders))
			mac.Get("/statuses", Wrap(hs.GetAllOrderStatuses))
			mac.Get("-stats", Wrap(hs.GetOrderStats))
			mac.Get("/aggregations/process-status", Wrap(hs.GetCountByProcessStatus))
			mac.Post("/", bind(m.OrderRequest{}), Validate, Wrap(hs.CreateOrder))

			mac.Group("/:id", func() {
				mac.Get("/", Wrap(hs.FindOrder))
				mac.Put("/", bind(m.OrderRequest{}), Wrap(hs.UpdateOrder))
				mac.Post("/status", Wrap(hs.UpdateOrderStatus))
				mac.Post("/process-status", Wrap(hs.UpdateOrderProcessStatus))
				mac.Delete("/", bind(m.DeleteOrderForm{}), Wrap(hs.DeleteOrder))
				mac.Post("/payment-upload", Wrap(hs.UploadLogo))
			})
		}, middleware.RequireAuth(), middleware.Auth(m.OperationOrders))

		mac.Group("/orders/:orderId/payment", func() {
			//mac.Get("/", Wrap(hs.GetOrderPayment))
			mac.Post("/", bind(m.CreateTransactionCmd{}), Validate, Wrap(hs.CreateOrderPayment))
			mac.Put("/:transactionId", bind(m.CreateTransactionCmd{}), Validate, Wrap(hs.UpdateOrderPayment))
			mac.Delete("/:transactionId", Wrap(hs.DeleteOrderPayment))
			mac.Get("/", Wrap(hs.GetOrderPayments))

			//mac.Group("/:id", func() {
			//	mac.Get("/", Wrap(hs.FindOrder))
			//	mac.Put("/", Wrap(hs.UpdateOrder))
			//})
		}, middleware.RequireAuth(), middleware.Auth(m.OperationOrders))

		mac.Group("/categories", func() {
			mac.Get("/", Wrap(hs.GetCategories))
			mac.Post("/", bind(m.Category{}), Validate, Wrap(hs.CreateCategory))

			mac.Group("/:id", func() {
				mac.Get("/", Wrap(hs.GetCategory))
				mac.Put("/", bind(m.Category{}), Wrap(hs.UpdateCategory))
				mac.Delete("/", Wrap(hs.DeleteCategory))
			})
		}, middleware.RequireAuth(), middleware.Auth(m.OperationProducts))
		mac.Group("/brands", func() {
			mac.Get("/", Wrap(hs.GetBrands))
			mac.Post("/", Wrap(hs.CreateBrand))

			mac.Group("/:id", func() {
				mac.Get("/", Wrap(hs.GetBrand))
				mac.Put("/", bind(m.Brand{}), Wrap(hs.UpdateBrand))
				mac.Delete("/", Wrap(hs.DeleteBrand))
			})
		}, middleware.RequireAuth(), middleware.Auth(m.OperationProducts))

		mac.Group("/models", func() {
			mac.Get("/", Wrap(hs.GetModels))
			mac.Post("/", bind(m.ProductModel{}), Validate, Wrap(hs.CreateModel))

			mac.Group("/:id", func() {
				mac.Get("/", Wrap(hs.GetModel))
				mac.Put("/", bind(m.ProductModel{}), Wrap(hs.UpdateModel))
				mac.Delete("/", Wrap(hs.DeleteModel))
			})
		}, middleware.RequireAuth(), middleware.Auth(m.OperationProducts))

		mac.Group("/subcategories", func() {
			mac.Get("/", Wrap(hs.GetSubCategories))
			mac.Post("/", bind(m.SubCategory{}), Validate, Wrap(hs.CreateSubcategory))

			mac.Group("/:id", func() {
				mac.Get("/", Wrap(hs.GetSubCategory))
				mac.Put("/", bind(m.SubCategory{}), Wrap(hs.UpdateSubCategory))
				mac.Delete("/", Wrap(hs.DeleteSubCategory))
			})
		}, middleware.RequireAuth(), middleware.Auth(m.OperationProducts))
		mac.Group("/departments", func() {
			mac.Get("/", Wrap(hs.GetDepartments))

			mac.Get("-with-profits", Wrap(hs.GetDepartmentsWithProfits))

			mac.Group("/:id", func() {
				mac.Get("/", Wrap(hs.GetDepartment))

				mac.Delete("/", Wrap(hs.DeleteDepartment))
			})
		}, middleware.RequireAuth(), middleware.Auth(m.OperationProducts))

		mac.Group("/clients", func() {
			mac.Get("/", Wrap(hs.GetClients))

			mac.Group("/:id", func() {
				mac.Get("/", Wrap(hs.GetClient))
				mac.Put("/", bind(m.ClientPayload{}), Validate, Wrap(hs.UpdateClient))
				mac.Delete("/", Wrap(hs.DeleteClient))
			})
		}, middleware.RequireAuth(), middleware.Auth(m.OperationClients))

		mac.Group("/admins", func() {
			mac.Get("/", Wrap(hs.GetAdmins))
			mac.Post("/", bind(m.UserPayload{}), Validate, Wrap(hs.CreateAdmin))

			mac.Get("/roles", Wrap(hs.GetAdminRoles))

			mac.Group("/:id", func() {
				mac.Get("/", Wrap(hs.GetAdmin))
				mac.Put("/", bind(m.UserPayload{}), Validate, Wrap(hs.UpdateAdmin))
				mac.Delete("/", Wrap(hs.DeleteAdmin))
			})
		}, middleware.RequireAuth(), middleware.Auth(m.OperationAdmins))

		mac.Group("/orgs", func() {
			mac.Post("/", bind(m.Organization{}), Validate, Wrap(hs.CreateOrganization))

			mac.Post("/logo-upload", Wrap(hs.UploadLogo))

			mac.Group("/:id", func() {
				mac.Get("/", Wrap(hs.GetOrganization))
				mac.Put("/", bind(m.Organization{}), Validate, Wrap(hs.UpdateOrganization))
				mac.Put("/branch", bind(m.Organization{}), Validate, Wrap(hs.UpdateOrganization))
				mac.Delete("/", Wrap(hs.DeleteOrganization))
			})
		}, middleware.RequireAuth(), middleware.Auth(m.OperationOrganizations))

		mac.Group("/cheques", func() {
			mac.Get("/", Wrap(hs.GetCheques))
			mac.Post("/", bind(m.Cheque{}), Validate, Wrap(hs.AddCheque))
			mac.Put("/:id", bind(m.Cheque{}), Validate, Wrap(hs.UpdateCheque))
			mac.Delete("/:id", Wrap(hs.DeleteCheque))

			mac.Post("/:id/status", bind(StatusRequest{}), Validate, Wrap(hs.ChangeChequeStatus))
		}, middleware.RequireAuth(), middleware.Auth(m.OperationOrders))

		mac.Group("/expenses", func() {
			mac.Get("/", Wrap(hs.GetExpenses))
			mac.Post("/", bind(m.Expense{}), Validate, Wrap(hs.AddExpense))
			mac.Get("/:id", Wrap(hs.GetExpense))
			mac.Put("/:id", bind(m.Expense{}), Validate, Wrap(hs.UpdateExpense))
			mac.Delete("/:id", Wrap(hs.DeleteExpense))
			mac.Get("/:id/payments", Wrap(hs.GetExpensePayments))
			mac.Post("/:id/payments", bind(m.ExpensePayment{}), Wrap(hs.AddExpensePayment))
			mac.Get("/stats", Wrap(hs.GetStats))

		}, middleware.RequireAuth(), middleware.Auth(m.OperationOrders))

		mac.Post("/assets/upload", Wrap(hs.UploadLogo))
		mac.Get("/assets/:entity/:name", hs.ServeProductImage)

		mac.Get("/check-onboarded", bind(m.OnboardingRequest{}), Wrap(hs.CheckOnboarded))
		mac.Post("/onboard", bind(m.OnboardingRequest{}), Wrap(hs.Onboard))

		apiV2 := e.Group("/api/v2")
		apiV2.Use(hs.GinContextUpdate)
		apiV2.GET("/ping", func(c *gin.Context) {
			c.JSON(
				http.StatusOK,
				gin.H{
					"message": "PONG",
				},
			)
		})

		apiV2.POST("/auth/login", hs.Login)

		apiV2.GET("/organizations", hs.GetOrganizations)

		mongoURI := fmt.Sprintf("mongodb://%s:%s", hs.Cfg.MongoConf.Host, hs.Cfg.MongoConf.Port)
		mongoClientOptions := options.Client().ApplyURI(mongoURI)
		mongoClient, err := mongo.NewClient(options.Client().ApplyURI(mongoURI))
		if err != nil {
			fmt.Println(err)
			os.Exit(1)
		}
		ctx, _ := context.WithTimeout(context.Background(), 5*time.Second)

		err = mongoClient.Connect(ctx)
		if err != nil {
			fmt.Println(err)
			os.Exit(1)
		}
		// defer cancel()

		db := mongoClient.Database(hs.Cfg.MongoConf.DatabaseName)

		_, err = mongodbadapter.NewAdapterWithClientOption(mongoClientOptions, hs.Cfg.MongoConf.DatabaseName)
		if err != nil {
			fmt.Println(err)
			os.Exit(1)
		}

		enforcer, err := casbin.NewEnforcer("rbac_model.conf", "auth_policy.csv")
		if err != nil {
			fmt.Println(err)
			os.Exit(1)
		}

		resrc := resource.New(db, enforcer)

		clientHandler := clientREST.New(resrc)
		departmentHandler := departmentREST.New(resrc)
		roleHandler := roleREST.New(&resrc)
		productHandler := productREST.New(resrc)
		orderHandler := orderrest.New(&resrc)
		analyticshandler := analyticsrest.New(resrc)

		apiV2.POST("/clients", clientHandler.Add)

		apiV2.POST("/orders", orderHandler.Place)
		apiV2.PUT("/orders/:id", orderHandler.Update)
		apiV2.POST("/orders/:id/to-order", orderHandler.ToOrder)

		apiV2.GET("/products", productHandler.GetAll)
		// apiV2.GET("/products/:id", productHandler.Get)
		apiV2.POST("/products", productHandler.Add)
		apiV2.PUT("/products/:id", productHandler.Update)
		apiV2.GET("/products/statuses", hs.GetProductStatuses)
		apiV2.POST("/products/:id/status", hs.UpdateServiceStatus)

		apiV2.POST("/departments", departmentHandler.Add)
		apiV2.PUT("/departments/:id", departmentHandler.Update)

		apiV2.GET("/roles", roleHandler.GetAll)
		apiV2.GET("/permissions", roleHandler.GetPermissions)

		apiV2.GET("/tasks", hs.GetTasks)
		apiV2.GET("/tasks/:id", hs.GetTask)
		apiV2.POST("/tasks", hs.CreateTask)
		apiV2.PUT("/tasks/:id", hs.UpdateTask)

		apiV2.GET("/vehicles", hs.GetVehicles)
		apiV2.GET("/vehicles/:id", hs.GetVehicle)
		apiV2.POST("/vehicles", hs.CreateVehicle)
		apiV2.PUT("/vehicles/:id", hs.UpdateVehicle)

		apiV2.POST("/brands", hs.CreateBrand)

		apiV2.GET("/analytics/department/profits", analyticshandler.GetDepartmentWiseProfit)
		apiV2.GET("/analytics/product/profits", analyticshandler.GetProductWiseProfit)

		mac.Any("/v2/*", func(ctx *m.AdminReqContext) {
			e.ServeHTTP(ctx.Resp, ctx.Req.Request)
		}, middleware.RequireAuth())
	})

	//r.GET("/", hr.Handler(alice.
	//	New().
	//	ThenFunc(hs.IndexGET)))
	// Login
	//r.POST("/login", hr.Handler(alice.
	//	New().
	//	ThenFunc(hs.LoginPOST)))
	//
	//r.GET("/login", hr.Handler(alice.
	//	New().
	//	ThenFunc(hs.LoginGET)))
	//r.GET("/logout", hr.Handler(alice.
	//	New().
	//	ThenFunc(hs.LogoutGET)))
	//r.GET("/home", hr.Handler(alice.
	//	New(acl.DisallowAnon).
	//	ThenFunc(hs.Index)))
	//http.Handle("/", IndexHandler)
	//r.GET("/show", hr.Handler(alice.
	//	New().
	//	ThenFunc(ShowOrder))) // INDEX :: Show all registers
	//http.Handle("/show", ShowHandler)      // SHOW  :: Show only one register
	// r.GET("/showamount", hr.Handler(alice.
	// 	New().
	// 	ThenFunc(Showamount)))
	//http.Handle("/showamount", Showamount) // SHOW  :: Show total Valortotal per status
	//r.GET("/new", hr.Handler(alice.
	//	New(acl.DisallowAnon).
	//	ThenFunc(NewOrderVIEW)))
	//http.Handle("/new", NewHandler)        // NEW   :: Form to create new register
	//r.GET("/edit", hr.Handler(alice.
	//	New(acl.DisallowAnon).
	//	ThenFunc(hs.EditOrderVIEW)))
	// Receber
	//r.GET("/edit/receber", hr.Handler(alice.
	//	New(acl.DisallowAnon).
	//	ThenFunc(ReceberOrderVIEW)))
	/*******client************/
	// http.Handle("/client", ClientHandler)              // CLIENT :: Show all Clinets
	r.GET("/client", hr.Handler(alice.
		New(acl.DisallowAnon).
		ThenFunc(Client)))

	r.POST("/client", hr.Handler(alice.
		New(acl.DisallowAnon).
		ThenFunc(Client)))

	// http.Handle("/client/create", ClientCreateHandler) //CLIENTCREATE :: Client Register Form
	r.GET("/client/create", hr.Handler(alice.
		New(acl.DisallowAnon).
		ThenFunc(ClientCreate)))

	// /*******cheque************/
	// http.Handle("/cheque", ChequeHandler)              // CHEQUE :: Show all cheques
	// r.GET("/cheque", hr.Handler(alice.
	// 	New(acl.DisallowAnon).
	// 	ThenFunc(Cheque)))

	// r.POST("/cheque", hr.Handler(alice.
	// 	New(acl.DisallowAnon).
	// 	ThenFunc(Cheque)))

	// http.Handle("/cheque/create", ChequeCreateHandler) //CHEQUECREATE :: Cheque Register Form
	r.GET("/cheque/create", hr.Handler(alice.
		New(acl.DisallowAnon).
		ThenFunc(ChequeCreate)))

	// /*******maverage************/

	// http.Handle("/maverage", MaverageHandler)              // Maverage :: Show all Maverages
	r.GET("/maverage", hr.Handler(alice.
		New(acl.DisallowAnon).
		ThenFunc(Maverage)))

	r.POST("/maverage", hr.Handler(alice.
		New(acl.DisallowAnon).
		ThenFunc(Maverage)))

	// http.Handle("/maverageshow", MaverageShowHandler)      // MaverageShow :: Show by ID
	r.GET("/maverageshow", hr.Handler(alice.
		New(acl.DisallowAnon).
		ThenFunc(MaverageShow)))

	// http.Handle("/maverageupdate", MaverageUpdateHandler)  // Maverageupdate :: update by ID
	r.POST("/maverageupdate", hr.Handler(alice.
		New(acl.DisallowAnon).
		ThenFunc(MaverageUpdate)))

	// http.Handle("/maverageedit", MaverageEditHandler)      // MaverageEdit :: Edit by ID
	r.POST("/maverageedit", hr.Handler(alice.
		New(acl.DisallowAnon).
		ThenFunc(MaverageEdit)))

	r.GET("/maverageedit", hr.Handler(alice.
		New(acl.DisallowAnon).
		ThenFunc(MaverageEdit)))

	// http.Handle("/maveragedelete", MaverageDeleteHandler)  // MaveragesDelete:: Delete By ID
	r.GET("/maveragedelete", hr.Handler(alice.
		New(acl.DisallowAnon).
		ThenFunc(MaverageDelete)))

	// http.Handle("/maverage/create", MaverageCreateHandler) //CLIENTCREATE :: Maverage Register Form
	r.GET("/maverage/create", hr.Handler(alice.
		New(acl.DisallowAnon).
		ThenFunc(MaverageCreate)))

	// /*******benefic************/
	// http.Handle("/benefic", BeneficHandler)              // Benefic :: Show all Benefics
	r.GET("/benefic", hr.Handler(alice.
		New(acl.DisallowAnon).
		ThenFunc(Benefic)))

	r.POST("/benefic", hr.Handler(alice.
		New(acl.DisallowAnon).
		ThenFunc(Benefic)))
	// http.Handle("/benefic/create", BeneficCreateHandler) //CLIENTCREATE :: Benefic Register Form
	r.GET("/benefic/create", hr.Handler(alice.
		New(acl.DisallowAnon).
		ThenFunc(BeneficCreate)))

	// /******product************/
	// http.Handle("/product", ProductHandler)              // PRODUCT :: Show all Products

	//r.GET("/product", hr.Handler(alice.
	//	New(acl.DisallowAnon).
	//	ThenFunc(hs.GetProducts)))
	//r.POST("/product", hr.Handler(alice.
	//	New(acl.DisallowAnon).
	//	ThenFunc(hs.GetProducts)))
	// http.Handle("/product/create", ProductCreateHandler) //PRODUCTCREATE :: GetProducts Register Form
	//r.GET("/product/create", hr.Handler(alice.
	//	New(acl.DisallowAnon).
	//	ThenFunc(ProductCreate)))
	// http.Handle("/productshow", ProductShowHandler)      // ProdutShow :: Show by ID
	//r.GET("/productshow", hr.Handler(alice.
	//	New(acl.DisallowAnon).
	//	ThenFunc(hs.GetProduct)))
	//r.GET("/productedit", hr.Handler(alice.
	//	New(acl.DisallowAnon).
	//	ThenFunc(hs.ProductEditView)))
	//
	//r.POST("/productedit", hr.Handler(alice.
	//	New(acl.DisallowAnon).
	//	ThenFunc(hs.ProductEditView)))
	//r.POST("/productupdate", hr.Handler(alice.
	//	New(acl.DisallowAnon).
	//	ThenFunc(hs.UpdateProduct)))

	// /*******registration************/
	// http.Handle("/registration", RegistrationHandler)              // Registration :: Show all Users
	r.GET("/registration", hr.Handler(alice.
		New(acl.DisallowAnon).
		ThenFunc(Registration)))

	r.POST("/registration", hr.Handler(alice.
		New(acl.DisallowAnon).
		ThenFunc(Registration)))

	// http.Handle("/registration/create", RegistrationCreateHandler) //RegistrationCREATE :: Users Register Form
	r.GET("/registration/create", hr.Handler(alice.
		New(acl.DisallowAnon).
		ThenFunc(RegistrationCreate)))

	// // Manage actions
	// /*********main**************/
	// http.Handle("/insert", InsertHandler) // INSERT :: New register

	//r.POST("/insert", hr.Handler(alice.
	//	New(acl.DisallowAnon).
	//	ThenFunc(InsertOrder)))
	// http.Handle("/update", UpdateHandler) // UPDATE :: Update register
	//r.POST("/update", hr.Handler(alice.
	//	New().
	//	ThenFunc(UpdateOrder)))
	// http.Handle("/delete", DeleteHandler) // DELETE :: Destroy register
	//todo POINT OUT INCORRECT METHOD USAGE
	//r.POST("/delete", hr.Handler(alice.
	//	New(acl.DisallowAnon).
	//	ThenFunc(DeleteOrder)))
	//
	//r.GET("/delete", hr.Handler(alice.
	//	New(acl.DisallowAnon).
	//	ThenFunc(DeleteOrder)))

	// /*********maverage**************/
	// http.Handle("/maverage/store", MaverageStoreHandler)
	r.POST("/maverage/store", hr.Handler(alice.
		New(acl.DisallowAnon).
		ThenFunc(MaverageStore)))

	// /*********benefic**************/
	// http.Handle("/benefic/store", BeneficStoreHandler)
	r.POST("/benefic/store", hr.Handler(alice.
		New(acl.DisallowAnon).
		ThenFunc(BeneficStore)))

	// /*********client**************/
	// http.Handle("/client/store", ClientStoreHandler)
	r.POST("/client/store", hr.Handler(alice.
		New(acl.DisallowAnon).
		ThenFunc(ClientStore)))

	// /*********cheque**************/
	// http.Handle("/cheque/store", ChequeStoreHandler)
	r.POST("/cheque/store", hr.Handler(alice.
		New(acl.DisallowAnon).
		ThenFunc(ChequeStore)))

	// /*********product**************/
	// http.Handle("/product/store", ProductStoreHandler)
	//r.POST("/product/store", hr.Handler(alice.
	//	New(acl.DisallowAnon).
	//	ThenFunc(hs.CreateProduct)))

	// http.HandleFunc("/uploads/", serveResource)
	r.POST("/uploads/", hr.Handler(alice.
		New(acl.DisallowAnon).
		ThenFunc(serveResource)))

	// /*********registration**************/
	// http.Handle("/registration/store", RegistrationStoreHandler)
	r.POST("/registration/store", hr.Handler(alice.
		New(acl.DisallowAnon).
		ThenFunc(RegistrationStore)))

	// /***************expense**************/

	// http.Handle("/expense", ExpenseHandler)
	// r.GET("/expense", hr.Handler(alice.
	// 	New(acl.DisallowAnon).
	// 	ThenFunc(Expense)))

	// r.POST("/expense", hr.Handler(alice.
	// 	New(acl.DisallowAnon).
	// 	ThenFunc(Expense)))

	// // http.Handle("/expense/create", ExpenseCreateHandler)
	// r.GET("/expense/create", hr.Handler(alice.
	// 	New(acl.DisallowAnon).
	// 	ThenFunc(ExpenseCreate)))

	// // http.Handle("/expense/store", ExpenseStoreHandler)
	// r.POST("/expense/store", hr.Handler(alice.
	// 	New(acl.DisallowAnon).
	// 	ThenFunc(ExpenseStore)))

	r.ServeFiles("/products/*filepath", http.Dir("products/"))
	r.ServeFiles("/expenses/*filepath", http.Dir("expenses/"))
	r.ServeFiles("/cheques/*filepath", http.Dir("cheques/"))

	// r.Handler("", "/v2", ginRoutes())
}

func ginRoutes() http.Handler {
	e := gin.New()
	e.Use(gin.Recovery())

	return e
}

func serveResource(w http.ResponseWriter, req *http.Request) {
	path := "./public" + req.URL.Path
	http.ServeFile(w, req, path)
}

// *****************************************************************************
// Middleware
// *****************************************************************************

func middlewareH(h http.Handler) http.Handler {
	// Prevents CSRF and Double Submits
	cs := csrfbanana.New(h, session.Store, session.Name)
	cs.FailureHandler(http.HandlerFunc(InvalidToken))
	cs.ClearAfterUsage(true)
	cs.ExcludeRegexPaths([]string{"/static(.*)"})
	csrfbanana.TokenLength = 32
	csrfbanana.TokenName = "token"
	csrfbanana.SingleToken = false
	h = cs

	// Log every request
	h = logrequest.Handler(h)

	// Clear handler for Gorilla Context
	h = gcontext.ClearHandler(h)

	return h
}
