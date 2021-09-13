import React, { useContext } from "react";
import { useAPI } from "../../helpers/useFetch";
import currencyFormatter from "../../helpers/currencyFormatterPrefix";
import { Dimmer, Loader, Divider } from "semantic-ui-react";
import { Radio, Modal, DatePicker, Button } from "antd";
import { useState } from "react";
import moment from "moment";
import { useTranslation } from "react-i18next";
import RevenueCost from "./RevenueCost";
import ExpenseStats from "./ExpenseStats";
import { PrinterOutlined } from "@ant-design/icons";
import { UserContext } from "src/contexts";
import "./styles.scss";
import { navigate } from "@reach/router";

const { RangePicker } = DatePicker;

const OrgStatTitles = {
  organizations: "Organizations",
  branches: "Branches",
  products: "Products",
  brands: "Brands",
  reps: "Representants",
  departments: "Departments",
};

const commissionNameMap = {
  open: "future-commission",
  closed: "paid-commission",
  partial: "generated-commission",
  quotations: "potential-commission",
  canceled: "lost-commission",
};

function RealProfit({ data, dashboard }) {
  const profit = data.partial.revenue + data.closed.revenue - data.partial.cost - data.closed.cost;
  const realProfit = profit - dashboard.totalexpenses;
  const { t } = useTranslation("translation");
  return (
    <div className="card">
      <div className="main" style={{ color: realProfit < 0 ? "#d3131d" : "" }}>
        {currencyFormatter.format(realProfit)}
      </div>
      <div className="below">
        <span style={{ fontSize: 12, color: "gray" }}>
          {t("Profit")}:
          <br />
          <span className="revenue">{currencyFormatter.format(profit)}</span>
        </span>
        <span style={{ fontSize: 12, color: "gray" }}>
          {t("Expense")}:
          <br />
          <span className="cost">{currencyFormatter.format(dashboard.totalexpenses)}</span>
        </span>
      </div>
      <div className="side-by-side">
        <div>{t("Real Profits")}</div>
      </div>
    </div>
  );
}

function Dashboard({ history }) {
  const { user: admin } = useContext(UserContext);

  const [daterange, setDaterange] = useState({
    range: "alltime",
    value: [undefined, undefined],
  });
  const { t } = useTranslation("translation");

  const rangeQueryParam = new URLSearchParams([
    ["from", daterange.value[0] ? daterange.value[0].unix() : ""],
    ["to", daterange.value[1] ? daterange.value[1].unix() : ""],
  ]);
  const [data = {}, orderStatsStatus] = useAPI(`/api/orders-stats?${rangeQueryParam}`);
  const [dashboard = {}, dashboardStatus] = useAPI(`/api/dashboard?${rangeQueryParam}`);
  const [productStats = [], productStatsStatus] = useAPI(`/api/products-stats?${rangeQueryParam}`);
  const [countByProcessStatus = [], countByProcessStatusStatus] = useAPI(
    `/api/orders/aggregations/process-status?${rangeQueryParam}`
  );
  const [shouldShowPrintEverything, setShouldShowPrintEverything] = useState(false);

  const showPrintEverythingDialog = () => setShouldShowPrintEverything(true);
  const hidePrintEverythingDialog = () => setShouldShowPrintEverything(false);

  const handleCustomRangeRadio = (e) => {
    const v = e.target.value;
    switch (v) {
      case "alltime":
        setDaterange({ range: v, value: [undefined, undefined] });
        break;
      case "last30days":
        setDaterange({
          range: v,
          value: [moment().subtract(30, "days"), undefined],
        });
        break;
      case "today":
        setDaterange({
          range: v,
          value: [moment().startOf("day"), undefined],
        });
        break;
      case "custom":
        setDaterange({
          range: v,
          value: [moment().subtract(14, "days"), undefined],
        });
        break;
      default:
        break;
    }
  };

  const handleCustomRangeChange = (value) => {
    setDaterange((s) => ({
      ...s,
      value: value === null ? [undefined, undefined] : value,
    }));
  };

  let totalRevenue = 0;
  let totalCost = 0;
  let totalQuantity = 0;
  let totalCollected = 0;
  let totalNeedsToCollect = 0;
  if (orderStatsStatus.isSuccess) {
    totalRevenue = data.open.revenue + data.closed.revenue + data.partial.revenue;
    totalCost = data.open.cost + data.closed.cost + data.partial.cost;
    totalQuantity = data.open.orders + data.closed.orders + data.partial.orders;
    totalCollected = data.closed.revenue + data.partial.collected;
    totalNeedsToCollect = data.open.revenue + (data.partial.revenue - data.partial.collected);
  }

  let totalprofits = 0;
  if (orderStatsStatus.isSuccess && dashboardStatus.isSuccess) {
    totalprofits = data.partial.revenue + data.closed.revenue - data.partial.cost - data.closed.cost - dashboard.totalexpenses;
  }

  let totalProducts = {
    products: 0,
    worthPrice: 0,
    worthCost: 0,
  };
  if (productStatsStatus.isSuccess) {
    totalProducts = productStats.reduce(
      (acc, p) => ({
        products: acc.products + p.total,
        worthPrice: acc.worthPrice + p.worthPrice,
        worthCost: acc.worthCost + p.worthCost,
      }),
      totalProducts
    );
  }

  const topDepartments = productStats.sort((a, b) => b.worthPrice - b.worthCost - (a.worthPrice - a.worthCost)).slice(0, 5);

  const allearnings = dashboard?.allrepearnings;

  return (
    <div className="dashboard">
      <div className="filters">
        <div>
          <span style={{ marginRight: 16 }}>{t("See by date range")}</span>
          <Radio.Group onChange={handleCustomRangeRadio} defaultValue={daterange.range}>
            <Radio value="alltime">{t("All Time")}</Radio>
            <Radio value="last30days">{t("Last 30 days")}</Radio>
            <Radio value="today">{t("Today")}</Radio>
            <Radio value="custom">{t("Custom")}</Radio>
          </Radio.Group>
          <RangePicker
            onChange={handleCustomRangeChange}
            defaultValue={[moment().subtract(14, "days"), moment()]}
            disabled={daterange.range !== "custom"}
          />
        </div>
      </div>
      <div className="dashboard-inner" style={{ maxWidth: 1000, margin: "auto" }}>
        {orderStatsStatus.isLoading && (
          <Dimmer active={orderStatsStatus.isLoading}>
            <Loader />
          </Dimmer>
        )}
        <div className="space-between margin-bottom">
          <h3 style={{ textTransform: "uppercase" }}>{t("Dashboard Reports")}</h3>
          <Button icon={[1, 2, 3].includes(admin.roleNumber) && <PrinterOutlined />} onClick={showPrintEverythingDialog}>
            {[1, 2, 3].includes(admin.roleNumber) && t("Print")}
          </Button>
        </div>
        {orderStatsStatus.isSuccess && (
        <div className="statisticsv2">
          {[1, 2].includes(admin.roleNumber) && (
             <>
              <RevenueCost
              className="open"
              labelLink={`/orders?paymentStatus=1`}
              revenue={data.open.revenue}
              cost={data.open.cost}
              label={t("Open")}
              value={data.open.orders}
            />
            <RevenueCost 
              className="partial"
              labelLink={`/orders?paymentStatus=2`}
              revenue={data.partial.revenue}
              cost={data.partial.cost}
              collected={data.partial.collected}
              notCollected={data.partial.revenue - data.partial.collected}
              label={t("Partial")}
              value={data.partial.orders}
            />
            <RevenueCost
              className="closed"
              labelLink={`/orders?paymentStatus=3`}
              revenue={data.closed.revenue}
              cost={data.closed.cost}
              label={t("Closed")}
              value={data.closed.orders}
            />          
            <RevenueCost
              revenue={totalRevenue}
              cost={totalCost}
              collected={totalCollected}
              notCollected={totalNeedsToCollect}
              label={t("Placed Orders")}
              value={totalQuantity}
              labelLink={`/orders`}
            />
            <RevenueCost
              revenue={totalProducts.worthPrice}
              cost={totalProducts.worthCost}
              label={t("Products Registered")}
              value={totalProducts.products}
              labelLink={`/products`}
            />
             </>
              )}
             {[1, 2, 3, 8].includes(admin.roleNumber) && (
             <>
              <RevenueCost
              className="quotations"
              labelLink={`/orders?paymentStatus=4`}
              revenue={[1, 2].includes(admin.roleNumber) && data.quotations.revenue}
              cost={[1, 2].includes(admin.roleNumber) && data.quotations.cost}
              label={t("Quotations")}
              value={data.quotations.orders}
            />   
          
            <div>
              <RevenueCost
              className="canceled"
              revenue={data.canceled.revenue}
              cost={data.canceled.cost}
              label={t("Canceled")}
              value={data.canceled.orders}
              labelLink={`/orders?status=9`}
            /> 
            </div>
            </>
            )}
             {[1, 2].includes(admin.roleNumber) && (
             <>
            {orderStatsStatus.isSuccess && dashboardStatus.isSuccess && <RealProfit data={data} dashboard={dashboard} />}
            <div className="card org-stats">
              {dashboardStatus.isSuccess && (
                <div className="wrapper">
                  <div className="main">
                    {currencyFormatter.format(dashboard.topreps.reduce((acc, { earnings }) => acc + earnings, 0))}
                  </div>
                  
                  <div className="below">
                    {t("Rep Orders")}: {dashboard.topreps.reduce((acc, { orders }) => acc + orders, 0)}
                  </div>
                </div>
              )}
            </div>
            </>
            )}
            <div className="card org-stats">
              {dashboardStatus.isSuccess && (
                <div className="wrapper">
                  <div className="main" onClick={() => navigate(`/clients`)}>{dashboard.clients}</div>
                  <div className="below">{t("Clients")}
                  </div>
                  
                </div>
              )}
            </div>
            <div className="card org-stats">
              {dashboardStatus.isSuccess && (
                <div className="wrapper">
                  <div className="main" onClick={() => navigate(`/orders`)}>{dashboard.orders}</div>
                  <div className="below">{t("Orders")}</div>
                </div>
              )}
            </div>
            <div className="card org-stats">
              {dashboardStatus.isSuccess && (
                <div className="wrapper">
                  <div className="main" onClick={() => navigate(`/tasks`)}>{dashboard.task}</div>
                  <div className="below">{t("Tasks")}</div>
                </div>
              )}
            </div>
          </div>
        )}
        {dashboardStatus.isLoading && (
          <Dimmer active={dashboardStatus.isLoading}>
            <Loader />
          </Dimmer>
        )}
        <Divider />
        {[1, 2, 8].includes(admin.roleNumber) && dashboardStatus.isSuccess && (
          <>
            <div className="org-statsv2">
              {Object.entries(OrgStatTitles)
                .filter(([k]) => (admin.roleNumber === 1 && k === "organizations" ? false : true))
                .map(([k, v]) => (
                  <div className="wrapper simplecard" key={k}>
                    <div className="main">{dashboard[k] || 0}</div>
                    <div className="below">{t(v)}</div>
                  </div>
                ))}
            </div>
            <Divider />
          </>
        )}
        {[1, 2, 3, 8].includes(admin.roleNumber) && countByProcessStatusStatus.isSuccess && (
          <>
            <div className="order-process-status-counts">
              {countByProcessStatus
                .filter(({ id }) => ((admin.allowedStatuses || []).length ? (admin.allowedStatuses || []).includes(id) : true))
                .map(({ status, count }) => (
                  <div className="wrapper simplecard" key={status} onClick={() => navigate(`/orders?status=${status}`)}>
                    <div className="main">{count}</div>
                    <div className="below">{status}</div>
                  </div>
                ))}
            </div>
            <Divider />
          </>
        )}
        {[1, 2, 3].includes(admin.roleNumber) && <ExpenseStats />}
        {[1, 2].includes(admin.roleNumber) && (
             <>
       <div className="statisticsv2">    
       <div className="card org-stats">
        {dashboardStatus.isSuccess && (
          <div className="wrapper">
            <div className="main" onClick={() => navigate(`/cheques`)}>{dashboard.cheques}</div>
            <div className="below">{t("Cheques")}</div>
          </div>
        )}
        </div>
        <div className="card org-stats">
             {dashboardStatus.isSuccess && (
          <div className="wrapper">
          <div className="main" onClick={() => navigate(`/vehicles`)}>{dashboard.vehicle}</div>
          <div className="below">{t("Vehicles")}</div>
        </div>
         )}
      </div>
      </div>  
      </>

        )}
        {[1, 2, 3, 8].includes(admin.roleNumber) && (
          <>
            <h3 style={{ textTransform: "uppercase" }}>{t("Top departments")}</h3>
            {productStatsStatus.isSuccess && (
              <div className="product-statistics">
                {topDepartments.map((product) => (
                  <RevenueCost
                    key={product?.department?._id}
                    revenue={[1, 2].includes(admin.roleNumber) && product.worthPrice}
                    cost={[1, 2].includes(admin.roleNumber) && product.worthCost}
                    label={product?.department?.title}
                    value={product.total}
                    labelLink={`/products?departmentId=${product.department?._id}`}
                  />
                ))}
              </div>
            )}
            <Divider />
          </>
        )}
        {[1, 2].includes(admin.roleNumber) && (
          <>
            <h3 style={{ textTransform: "uppercase" }}>{t("Top Representants Earnings")}</h3>
            {dashboardStatus.isSuccess && (
              <div className="product-statistics">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <div className="card" key={i}>
                    {dashboard.topreps[i] && (
                      <>
                        <div className="main">{currencyFormatter.format(dashboard.topreps[i].earnings)}</div>
                        <div className="below"></div>

                        <div className="side-by-side">
                          {dashboard.topreps[i].name}: {dashboard.topreps[i].orders}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
            <Divider />
          </>
        )}
        {((admin.roleNumber === 3 && admin.isRep) || admin.roleNumber === 8) && dashboardStatus.isSuccess && (
          <div className="all-rep-earnings">
            <div className="card">
              <div className="wrapper">
                <div className="main">
                  {currencyFormatter.format(
                    [t("open"), t("partial"), t("closed"), t("quotations")].reduce(
                      (acc, k) => (allearnings[commissionNameMap[k]] || 0) + acc,
                      0
                    )
                  )}
                </div>
                <div className="below">
                  {t("Total")}:{" "}
                  {[t("open"), t("partial"), t("closed"), t("quotations") ].reduce(
                    (acc, k) => (allearnings[k] || []).filter(Boolean).length + acc,
                    0
                  )}
                </div>
              </div>
            </div>
            {Object.entries(commissionNameMap).map(([k, v]) => (
              <div className="card" key={k}>
                <div className="wrapper">
                  <div className="main">{currencyFormatter.format(allearnings[v] || 0)}</div>
                  <div className="below">
                    {k}: {(allearnings[k] || []).filter(Boolean).length}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
     
      {[1, 2, 3].includes(admin.roleNumber) && shouldShowPrintEverything && (
        <Modal onCancel={hidePrintEverythingDialog} visible width="95%" bodyStyle={{ height: "87vh" }} footer={null} centered>
          <iframe
            src={`/print-everything?nav=false&${rangeQueryParam}`}
            width="100%"
            height="100%"
            title={t("Report")}
          ></iframe>
        </Modal>
      )}
       
    </div>
    
  );
}

export default Dashboard;
