package api

import (
	"encoding/json"
	"gerenciador/pkg/id"
	"gerenciador/pkg/log"
	m "gerenciador/pkg/models"
	"gerenciador/pkg/services/mongostore"
	"gerenciador/pkg/settings"
	"net/http"

	"github.com/globalsign/mgo"
	"github.com/globalsign/mgo/bson"
	"gopkg.in/ini.v1"
)

var confPath = "config/config.ini"

func (hs *HTTPServer) GetDashboard(ctx *m.AdminReqContext) Response {
	confFile, err := ini.Load(confPath)
	if err != nil {
		return InternalServerError(err)
	}

	//mongo
	mongo := confFile.Section("mongo")

	s := mongostore.MongoStore{Config: &settings.MongoConf{DatabaseName: mongo.Key("database").String()}}
	sess := s.Session()

	query := m.RangeOrgsUserQueryFromCtx(ctx)

	aggrQ := []bson.M{}

	matchQ := mongostore.WrapSafeDeleteQuery(query.Query())
	aggrQ = append(aggrQ, bson.M{"$match": matchQ})

	groupQ := bson.M{"$group": bson.M{"_id": nil, "count": bson.M{"$sum": 1}}}
	aggrQ = append(aggrQ, groupQ)

	log.Info("q", aggrQ)

	brands := map[string]interface{}{}
	bc := sess.DB(s.Config.DatabaseName).C("brands")
	if err := bc.Pipe(aggrQ).One(&brands); err != nil {
		if err == mgo.ErrNotFound {
			brands["count"] = 0
		} else {
			return InternalServerError(err)
		}
	}

	productsCount, err := hs.ProductsRepo.Count(query)
	if err != nil {
		log.Info("failed to get product count", err)
	}

	// products := map[string]interface{}{}
	// pc := sess.DB(s.Config.DatabaseName).C("products")
	// if err := pc.Pipe(aggrQ).One(&products); err != nil {
	// 	if err == mgo.ErrNotFound {
	// 		log.Info("products aggregation failed")
	// 	} else {
	// 		return InternalServerError(err)
	// 	}
	// }
	clients := map[string]interface{}{}
	cc := sess.DB(s.Config.DatabaseName).C("clients")
	if err := cc.Pipe(aggrQ).One(&clients); err != nil {
		if err == mgo.ErrNotFound {
			clients["count"] = 0
		} else {
			return InternalServerError(err)
		}
	}

	orders := map[string]interface{}{}
	oc := sess.DB(s.Config.DatabaseName).C("orders")
	if err := oc.Pipe(aggrQ).One(&orders); err != nil {
		if err == mgo.ErrNotFound {
			orders["count"] = 0
		} else {
			return InternalServerError(err)
		}
	}

	departments := map[string]interface{}{}
	dc := sess.DB(s.Config.DatabaseName).C("departments")
	if err := dc.Pipe(aggrQ).One(&departments); err != nil {
		if err == mgo.ErrNotFound {
			departments["count"] = 0
		} else {
			return InternalServerError(err)
		}
	}

	// orgs := map[string]interface{}{}
	orgMatchQ := m.RangeOrgsUserQueryFromCtx(ctx)

	orgsc := sess.DB(s.Config.DatabaseName).C("organizations")
	b, _ := json.Marshal(orgMatchQ.Query())
	log.Info("org match", string(b))
	orgsCount, err := orgsc.Find(orgMatchQ.Query()).Count()
	if err != nil {
		if err == mgo.ErrNotFound {
			log.Info("orgs aggregation failed")
		} else {
			return InternalServerError(err)
		}
	}

	branchMatchQuery := m.RangeOrgsUserQueryFromCtx(ctx)
	branchMatchQuery.IDs = branchMatchQuery.OrganizationIDs
	branchMatchQuery.OrganizationIDs = nil // remove organiazionIDs becoz org collection don't have field organiazionId
	branchAggrQ := []bson.M{}
	branchAggrQ = append(branchAggrQ, bson.M{"$match": mongostore.WrapSafeDeleteQuery(branchMatchQuery.Query())})
	branchAggrQ = append(branchAggrQ, mongostore.NewUnwindStage("$branches"), groupQ)

	branches := map[string]interface{}{}
	if err := orgsc.Pipe(branchAggrQ).One(&branches); err != nil {
		if err == mgo.ErrNotFound {
			branches["count"] = 0
		} else {
			return InternalServerError(err)
		}
	}

	repMatchQ := mongostore.WrapSafeDeleteQuery(query.Query())
	repMatchQ["roleNumber"] = m.RepresentativeRoleNumber
	repQuery := []bson.M{}
	repQuery = append(repQuery, bson.M{"$match": repMatchQ}, groupQ)
	reps := map[string]interface{}{}

	repsc := sess.DB(s.Config.DatabaseName).C("admins")
	if err := repsc.Pipe(repQuery).One(&reps); err != nil {
		if err == mgo.ErrNotFound {
			reps["count"] = 0
		} else {
			return InternalServerError(err)
		}
	}

	task := map[string]interface{}{}
	tskc := sess.DB(s.Config.DatabaseName).C("task")
	if err := tskc.Pipe(aggrQ).One(&task); err != nil {
		if err == mgo.ErrNotFound {
			task["count"] = 0
		} else {
			return InternalServerError(err)
		}
	}

	cheques := map[string]interface{}{}
	cksc := sess.DB(s.Config.DatabaseName).C("cheques")
	if err := cksc.Pipe(aggrQ).One(&cheques); err != nil {
		if err == mgo.ErrNotFound {
			cheques["count"] = 0
		} else {
			return InternalServerError(err)
		}
	}

	vehicle := map[string]interface{}{}
	vhc := sess.DB(s.Config.DatabaseName).C("vehicle")
	if err := vhc.Pipe(aggrQ).One(&vehicle); err != nil {
		if err == mgo.ErrNotFound {
			vehicle["count"] = 0
		} else {
			return InternalServerError(err)
		}
	}

	ordersCount, _ := orders["count"].(int)
	clientsCount, _ := clients["count"].(int)
	brandsCount, _ := brands["count"].(int)
	// productsCount, _ := products["count"].(int)
	departmentsCount, _ := departments["count"].(int)
	// orgsCount, _ := orgs["count"].(int)
	branchesCount, _ := branches["count"].(int)
	repsCount, _ := reps["count"].(int)
	taskCount, _ := task["count"].(int)
	vehicleCount, _ := vehicle["count"].(int)
	chequesCount, _ := cheques["count"].(int)
	o := map[string]interface{}{
		"orders":      ordersCount,
		"clients":     clientsCount,
		"brands":      brandsCount,
		"branches":    branchesCount,
		"products":    productsCount,
		"departments": departmentsCount,
		"reps":        repsCount,
		"task":        taskCount,
		"vehicle":     vehicleCount,
		"cheques":     chequesCount,
	}
	if ctx.Admin.RoleNumber == m.SuperAdminRoleNumber {
		o["organizations"] = orgsCount
	}

	// <==== REP AND THEIR EARNING ====

	reprs := []m.Admin{}

	adminsc := sess.DB(s.Config.DatabaseName).C("admins")
	repQ := mongostore.WrapSafeDeleteQuery(bson.M{"roleNumber": m.RepresentativeRoleNumber})
	if err := adminsc.Find(repQ).All(&reprs); err != nil {
		if err != mgo.ErrNotFound {
			return InternalServerError(err)
		}
	}

	var repIds []id.ID
	for _, m := range reprs {
		repIds = append(repIds, m.ID)
	}

	ordersMatchQ := mongostore.WrapSafeDeleteQuery(query.Query())
	ordersMatchQ["userId"] = bson.M{"$in": repIds}
	ordersMatchQ["status"] = bson.M{"$in": []m.OrderStatus{m.ClosedOrder, m.PartialOrder}}

	pipe := []bson.M{
		{"$match": ordersMatchQ},
	}

	orders2 := []m.Order{}
	ordersc := sess.DB(s.Config.DatabaseName).C("orders")
	if err := ordersc.Pipe(pipe).All(&orders2); err != nil {
		if err == mgo.ErrNotFound {
		} else {
			return InternalServerError(err)
		}
	}

	temp := map[id.ID]float64{}
	repAndOrders := map[id.ID]uint{}
	for _, o := range orders2 {
		for _, i := range o.Items {
			commission := 0.0
			for _, r := range reprs {
				if r.ID == o.UserID {
					commission = r.Commission
					break
				}
			}
			temp[o.UserID] += (i.Price * commission / 100)
			repAndOrders[o.UserID]++
		}
	}

	type repAndEarning struct {
		Name     string  `json:"name"`
		Earnings float64 `json:"earnings"`
		ID       id.ID   `json:"id"`
		Orders   uint    `json:"orders"`
	}
	repAndEarnings := []repAndEarning{}

	for id, v := range temp {
		var name string
		for _, r := range reprs {
			if id == r.ID {
				name = r.FirstName + " " + r.LastName
				break
			}
		}
		repAndEarnings = append(repAndEarnings, repAndEarning{ID: id, Name: name, Orders: repAndOrders[id], Earnings: v})
	}

	// ==== REP AND THEIR EARNING ====>

	o["topreps"] = repAndEarnings

	// ==== REP AND THEIR ALL COMISSIONS ====

	type allRepEarning struct {
		Open               []id.ID `json:"open"`
		Closed             []id.ID `json:"closed"`
		Partial            []id.ID `json:"partial"`
		Quotations         []id.ID `json:"quotations"`
		Canceled           []id.ID `json:"canceled"`
		FutureComission    float64 `json:"future-commission"`
		GeneratedComission float64 `json:"generated-commission"`
		PaidComission      float64 `json:"paid-commission"`
		PotentialComission float64 `json:"potential-commission"`
		LostComission      float64 `json:"lost-commission"`
	}

	allrepearnings := allRepEarning{}
	allRepEarningsQ := []bson.M{}

	allRepEarningsMatchQ := mongostore.WrapSafeDeleteQuery(query.Query())
	allRepEarningsMatchQ["userId"] = ctx.Admin.ID
	allRepEarningsQ = append(allRepEarningsQ, bson.M{"$match": allRepEarningsMatchQ})

	allRepEarningsGroupQ := bson.M{
		"_id": "$userId",
		"open": bson.M{"$push": bson.M{
			"$cond": []interface{}{bson.M{"$eq": []interface{}{"$status", m.OpenOrder}}, "$$ROOT._id", nil},
		}},
		"partial": bson.M{"$push": bson.M{
			"$cond": []interface{}{bson.M{"$eq": []interface{}{"$status", m.PartialOrder}}, "$$ROOT._id", nil},
		}},
		"closed": bson.M{"$push": bson.M{
			"$cond": []interface{}{bson.M{"$eq": []interface{}{"$status", m.ClosedOrder}}, "$$ROOT._id", nil},
		}},
		"quotations": bson.M{"$push": bson.M{
			"$cond": []interface{}{bson.M{"$eq": []interface{}{"$status", m.QuotationOrder}}, "$$ROOT._id", nil},
		}},
		"canceled": bson.M{"$push": bson.M{
			"$cond": []interface{}{bson.M{"$eq": []interface{}{"$processStatus", m.StatusCanceled}}, "$$ROOT._id", nil},
		}},
	}

	allRepEarningsQ = append(allRepEarningsQ, bson.M{"$group": allRepEarningsGroupQ})

	if err := ordersc.Pipe(allRepEarningsQ).One(&allrepearnings); err != nil {
		if err == mgo.ErrNotFound {
			log.Info("orders not found")
		} else {
			log.Info("all rep earnings : %v", err)
			return InternalServerError(err)
		}
	}

	for _, id := range allrepearnings.Open {
		if id.Valid() {
			o, err := hs.OrdersRepo.FindOne(m.FindByIdQuery{Id: id})
			if err != nil {
				log.Info("error find open order : %v", err)
				return InternalServerError(err)
			}
			for _, i := range o.Items {
				allrepearnings.FutureComission += (i.Price * ctx.Admin.Commission / 100)
			}
		}
	}
	for _, id := range allrepearnings.Partial {
		if id.Valid() {
			o, err := hs.OrdersRepo.FindOne(m.FindByIdQuery{Id: id})
			if err != nil {
				log.Info("error find Partial order : %v", err)
				return InternalServerError(err)
			}
			for _, i := range o.Items {
				allrepearnings.GeneratedComission += (i.Price * ctx.Admin.Commission / 100)
			}
		}
	}
	for _, id := range allrepearnings.Closed {
		if id.Valid() {
			o, err := hs.OrdersRepo.FindOne(m.FindByIdQuery{Id: id})
			if err != nil {
				log.Info("error find Closed order : %v", err)
				return InternalServerError(err)
			}
			for _, i := range o.Items {
				allrepearnings.PaidComission += (i.Price * ctx.Admin.Commission / 100)
			}
		}
	}
	for _, id := range allrepearnings.Quotations {
		if id.Valid() {
			o, err := hs.OrdersRepo.FindOne(m.FindByIdQuery{Id: id})
			if err != nil {
				log.Info("error find Closed order : %v", err)
				return InternalServerError(err)
			}
			for _, i := range o.Items {
				allrepearnings.PotentialComission += (i.Price * ctx.Admin.Commission / 100)
			}
		}
	}
	for _, id := range allrepearnings.Canceled {
		if id.Valid() {
			o, err := hs.OrdersRepo.FindOne(m.FindByIdQuery{Id: id})
			if err != nil {
				log.Info("error find Closed order : %v", err)
				return InternalServerError(err)
			}
			for _, i := range o.Items {
				allrepearnings.LostComission += (i.Price * ctx.Admin.Commission / 100)
			}
		}
	}

	o["allrepearnings"] = allrepearnings

	realprofitsMatchQ := mongostore.WrapSafeDeleteQuery(query.Query())
	realprofitsQuery := []bson.M{
		{"$match": realprofitsMatchQ},
		{"$group": bson.M{
			"_id":           "$expenses._id",
			"totalexpenses": bson.M{"$sum": "$amount"},
		}},
	}

	expensesgrouped := map[string]interface{}{}

	expensesc := sess.DB(s.Config.DatabaseName).C("expenses")
	if err := expensesc.Pipe(realprofitsQuery).One(&expensesgrouped); err != nil {
		if err == mgo.ErrNotFound {
			expensesgrouped["totalexpenses"] = 0
		} else {
			return InternalServerError(err)
		}
	}

	o["totalexpenses"] = expensesgrouped["totalexpenses"]

	return JSON(http.StatusOK, o)

}
