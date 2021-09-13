import React, { useEffect } from "react";

import Spinner from "./../../components/Spinner";
import OrderList from "src/components/OrderComponents/OrderList";
import OrderFormModal from "./OrderFormModal";
import { Input } from "antd";
import { deleteOrder } from "../../services/orderService";
import { useState } from "react";
import moment from "moment";
import { Radio, Select, Button } from "antd";
import { useOrders, orderProcesses } from "src/hooks";
import "./styles.css";
import { useTranslation } from "react-i18next";
import OrgAwareButton from "src/components/OrgAwareButton";
import { useContext } from "react";
import { UserContext } from "src/contexts";

import { paymentStatuses, statuses } from "src/hooks/useOrders";

const _30Days = 30 * 24 * 60 * 60 * 1000;

const noPaymentSince30days = (order) => {
  const lastTransactionOn = (order.transactions || []).sort((a, b) => b.createdAt - a.createdAt)[0]?.createdAt;
  const lastPaymentOn = lastTransactionOn || order.createdAt;
  return [1, 2].includes(order.status) && Date.now() - lastPaymentOn * 1000 > _30Days;
};

const expiredQuotataionsPredicate = (order) => {
  const shouldDeleteQuote = order.status === 4 && Date.now() - order.createdAt * 1000 > _30Days;
  return shouldDeleteQuote;
};

const lastWeekOpenOrdersPredicate = (order) =>
  order.createdAt * 1000 > moment().subtract(7, "days").unix() && order.status === 1;

function OrdersPage(props) {
  const { t } = useTranslation("translation");
  const { user: admin } = useContext(UserContext);
  const { addToast, location } = props;
  const { data: orders, total, pages, all: allOrders, search, goto, filters, status: ordersStatus, refresh } = useOrders();
  const [alerted, setAlerted] = useState(false);
  const [shouldShowQuotationForm, setShouldShowQuotationForm] = useState(false);
  const [paymentDueAlert, setPaymentDueAlert] = useState(false);
  const [conclusionNearAlert, setConclusionNearAlert] = useState(false);
  const [conclusionDueAlert, setConclusionDueAlert] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [showOrderCreateModal, setShowOrderCreateModal] = useState(false);
  const [editOrderId, setEditOrderId] = useState(undefined);

  const searchParams = new URLSearchParams(location.search);
  const defaultSelectedStatus = Number(searchParams.get("status"));
  const defaultSelectedPaymentStatus = Number(searchParams.get("paymentStatus"));
  const [selectedStatus, setSelectedStatus] = useState(defaultSelectedStatus > -1 ? defaultSelectedStatus : undefined);
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState(
    defaultSelectedPaymentStatus > -1 ? defaultSelectedPaymentStatus : undefined
  );

  const handleSearch = (e) => {
    search(e.target.value);
  };

  const closeOrderFormModal = () => {
    setEditOrderId(undefined);
    setShowOrderCreateModal(false);
    setShouldShowQuotationForm(false);
  };

  const afterPlace = () => {
    closeOrderFormModal();
    refresh();
  };

  const deleteSelected = () => {
    const p = Promise.all(selectedOrders.map((_id) => deleteOrder(_id, { deleteTrxs: false })));
    p.then((resp) => {
      this.props.addToast(t("Orders deleted successfully"), {
        appearance: "success",
      });
    })
      .catch((err) => {
        if (err.message !== "") {
          this.props.addToast(t("Could not delete orders") + ": " + err.message, {
            appearance: "error",
          });
        } else {
          this.props.addToast(t("Something went wrong"), { appearance: "error" });
        }
      })
      .finally(() => {
        setSelectedOrders([]);
        refresh();
      });
  };

  const handleFilterChange = (e) => {
    switch (e.target.value) {
      case "latePayments":
        filters.setPredicate(noPaymentSince30days);
        break;
      case "expiredQuotes":
        filters.setPredicate(expiredQuotataionsPredicate);
        break;
      default:
        filters.setPredicate(undefined);
    }
  };

  useEffect(() => {
    if (ordersStatus.isSuccess) {
      if (selectedStatus > 0 || selectedPaymentStatus > 0) {
        filters.setPredicate(
          ({ processStatus, status }) =>
            (selectedStatus > 0 ? processStatus === selectedStatus : true) &&
            (selectedPaymentStatus > 0 ? status === selectedPaymentStatus : true)
        );
      } else {
        filters.setPredicate(undefined);
      }
    }
  }, [selectedStatus, selectedPaymentStatus, ordersStatus]);

  useEffect(() => {
    if (!alerted) {
      const shouldAlert = allOrders.some(expiredQuotataionsPredicate);

      if (shouldAlert) {
        addToast(t("You have quotations older than 30 days"), {
          appearance: "warning",
          autoDismissTimeout: 10000,
        });
        setAlerted(true);
      }
    }
  }, [allOrders]);

  useEffect(() => {
    if (!paymentDueAlert) {
      const shouldAlert = allOrders.some(noPaymentSince30days);

      if (shouldAlert) {
        addToast(t("You have orders haven't received payment since 30 days"), {
          appearance: "warning",
          autoDismissTimeout: 10000,
        });
        setPaymentDueAlert(true);
      }
    }
  }, [allOrders]);

  useEffect(() => {
    if (conclusionDueAlert && conclusionNearAlert) return;
    let shouldAlertForDue = false;
    let shouldAlertForNear = false;
    for (let i = 0; i < allOrders.length; i++) {
      const order = allOrders[i];
      if (order.estConclusionDate && ![8].includes(order.processStatus)) {
        const diffFromToday = moment(order.estConclusionDate).diff(moment(), "day");
        if (diffFromToday <= 0) {
          shouldAlertForDue = true;
        }
        if (diffFromToday <= 5 && diffFromToday > 0) {
          shouldAlertForNear = true;
        }
      }
    }
    if (shouldAlertForDue) {
      addToast(t("You are due to conclude order(s)"), {
        appearance: "error",
        autoDismissTimeout: 10000,
      });
      setConclusionDueAlert(true);
    }
    if (shouldAlertForNear) {
      addToast(t("You are near due to conclude order(s)"), {
        appearance: "warning",
        autoDismissTimeout: 10000,
      });
      setConclusionNearAlert(true);
    }
  }, [allOrders]);

  const isCreateDisabled =
    (admin.isRep || admin.roleNumber === 8) && admin.maxOrders > 0
      ? allOrders.filter(lastWeekOpenOrdersPredicate).length === admin.maxOrders
      : false;

  const selectedOrder = orders.find((o) => o._id === editOrderId);
  const okText = selectedOrder
    ? shouldShowQuotationForm
      ? t("Update") + " " + t("Quotation")
      : t("Update") + " " + t("Order")
    : shouldShowQuotationForm
    ? t("Create") + " " + t("Quotation")
    : t("Place") + " " + t("Order");

  return ordersStatus.isLoading ? (
    <Spinner />
  ) : (
    <div className={"container"}>
      <h2>{t("Orders")}</h2>
      {(showOrderCreateModal || (selectedOrder && selectedOrder.status !== 4)) && (
        <OrderFormModal
          addToast={props.addToast}
          onClose={closeOrderFormModal}
          afterPlace={afterPlace}
          initialValue={selectedOrder}
          okText={okText}
        />
      )}

      {(shouldShowQuotationForm || selectedOrder?.status === 4) && (
        <OrderFormModal
          addToast={props.addToast}
          onClose={closeOrderFormModal}
          afterPlace={afterPlace}
          initialValue={selectedOrder}
          okText={okText}
          isQuotation={shouldShowQuotationForm || selectedOrder.status === 4}
        />
      )}

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <span style={{ marginRight: 16 }}>
            {t("Total")}: {total}
          </span>
          <Input.Search
            style={{ marginRight: 16, width: 200 }}
            placeholder={t("Search")}
            onChange={handleSearch}
            value={filters.searchText}
            allowClear
          />
          <Radio.Group onChange={handleFilterChange} defaultValue="" style={{ marginRight: 16 }}>
            <Radio.Button value="">{t("All")}</Radio.Button>
            <Radio.Button value="latePayments">{t("Late Payments")}</Radio.Button>
            <Radio.Button value="expiredQuotes">{t("Exp. Quotations")}</Radio.Button>
          </Radio.Group>
          <Select
            defaultValue={selectedStatus}
            onChange={setSelectedStatus}
            style={{ width: 200, marginRight: 16 }}
            placeholder={t("Status")}
            allowClear
          >
            {orderProcesses.map((status, i) => (
              <Select.Option value={i}>{t(status)}</Select.Option>
            ))}
          </Select>
          <Select
            defaultValue={selectedPaymentStatus}
            onChange={setSelectedPaymentStatus}
            style={{ width: 200 }}
            allowClear
            placeholder={t("Payment Status")}
          >
            {paymentStatuses.map((status, i) => (
              <Select.Option value={i}>{t(status)}</Select.Option>
            ))}
          </Select>
        </div>
        <div>
          {selectedOrders.length > 0 && (
            <Button style={{ marginLeft: 16 }} onClick={deleteSelected} className="negative">
              {t("Delete Selected")}
            </Button>
          )}

          {[1, 2, 3, 4, 8].includes(admin.roleNumber) && (
            <>
              <OrgAwareButton
                style={{ marginRight: 16 }}
                onClick={() => setShouldShowQuotationForm(true)}
                type="primary"
                disabled={isCreateDisabled}
              >
                {isCreateDisabled ? t("you reached limit") : t("Create") + " " + t("Quotation")}
              </OrgAwareButton>
              <OrgAwareButton onClick={() => setShowOrderCreateModal(true)} type="primary" disabled={isCreateDisabled}>
                {isCreateDisabled ? t("you reached limit") : t("Create") + " " + t("Order")}
              </OrgAwareButton>
            </>
          )}
        </div>
      </div>
      <OrderList
        loadOrders={refresh}
        filters={filters}
        addToast={props.addToast}
        orders={orders}
        selectedOrders={selectedOrders}
        setSelectedOrders={setSelectedOrders}
        showOrderUpdateModal={setEditOrderId}
        admin={props.admin}
        pages={pages}
        onPageChange={goto}
      />
    </div>
  );
}

OrdersPage.defaultProps = {
  orders: [],
  isLoading: true,
};

export default OrdersPage;
