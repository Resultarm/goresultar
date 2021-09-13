import React, { useState } from "react";

import { Icon, Button, Table, Confirm, Dropdown, Modal, Form, Pagination } from "semantic-ui-react";
import DeleteOrder from "../DeleteOrder";
import { formatNumber, stringifyOrderStatus } from "../../../helpers/formatters";
import UpdateQuotation from "../UpdateQuotation";
import moment from "moment";

import currencyFormatter from "../../../helpers/currencyFormatterPrefix";
import AddOrderPaymentModal from "../../../components/OrderComponents/AddOrderPaymentModal/index";
import { updateOrderProcessStatus } from "../../../services/orderService";
import { Row, Upload } from "antd";
import { useTranslation } from "react-i18next";
import { orderProcesses } from "../../../hooks/index";
import { useContext } from "react";
import { UserContext } from "../../../contexts";

const _30Days = 30 * 24 * 60 * 60 * 1000;

const ConcludedStatus = 8;

const OrderProcess = ({ id: orderId, status, paymentStatus, onUpdate, allowed }) => {
  const { t } = useTranslation(["translation"]);
  const [shouldShowReviewModal, setShouldShowReviewModal] = useState(false);
  const [files, setFiles] = useState([]);
  const [review, setReview] = useState("");
  const handleClick = (id) => () => {
    updateOrderProcessStatus(orderId, { processStatus: id }).then(() => onUpdate());
  };

  const addReview = () => {
    updateOrderProcessStatus(orderId, {
      processStatus: ConcludedStatus,
      documents: files.map(({ response }) => response?.message),
      comment: review,
    }).then(() => onUpdate());
  };

  const handleFilesChane = ({ fileList }) => {
    setFiles(fileList);
  };

  const closeShouldShowReviewModal = () => setShouldShowReviewModal(false);
  return (
    <>
      <Dropdown text={t(orderProcesses[status])}>
        <Dropdown.Menu>
          {orderProcesses.map((label, i) => (
            <Dropdown.Item
              key={label}
              text={t(label)}
              onClick={i === ConcludedStatus ? () => setShouldShowReviewModal(true) : handleClick(i)}
              disabled={(i === ConcludedStatus && (status !== 7 || paymentStatus !== 3)) || i === 0 || !allowed.includes(i)}
            />
          ))}
        </Dropdown.Menu>
      </Dropdown>
      {shouldShowReviewModal && (
        <Modal closeIcon open onClose={closeShouldShowReviewModal}>
          <Modal.Header>{t("Conclude with Review")}</Modal.Header>
          <Modal.Content>
            <Form>
              <div style={{ marginBottom: 16 }}>
                <Upload
                  onChange={handleFilesChane}
                  fileList={files}
                  action="/api/assets/upload?entity=order"
                  accept="image/*,.pdf"
                  headers={{
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                  }}
                >
                  <Button>{t("Add files")}</Button>
                </Upload>
              </div>

              <Form.Group widths="equal">
                <Form.TextArea
                  label={t("Client Review")}
                  onChange={(e, { value }) => {
                    setReview(value);
                  }}
                />
              </Form.Group>
            </Form>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button onClick={closeShouldShowReviewModal}>Cancel</Button>
              <Button primary onClick={addReview}>
                {t("Conclude")} {t("Order")}
              </Button>
            </div>
          </Modal.Content>
        </Modal>
      )}
    </>
  );
};

const noPaymentSince30days = (order) => {
  const lastTransactionOn = (order.transactions || []).sort((a, b) => b.createdAt - a.createdAt)[0]?.createdAt;
  const lastPaymentOn = lastTransactionOn || order.createdAt;
  return [1, 2].includes(order.status) && Date.now() - lastPaymentOn * 1000 > _30Days;
};

const EstConclusionDate = ({ date, status }) => {
  if (!date) return "-";
  const dateFormatted = moment(date).format("DD/MM/YYYY");
  const diffFromToday = moment(date).diff(moment(), "day");
  let bgColor;
  let prefix;
  if (status < 7) {
    if (diffFromToday <= 0) {
      bgColor = "rgba(255, 0, 0, 0.2)";
      prefix = "🚨";
    } else if (diffFromToday > 0 && diffFromToday <= 5) {
      prefix = <span style={{ fontFamily: "Segoe UI Emoji" }}>⚠️ </span>;
      bgColor = "rgba(255, 255, 0, 0.2)";
    }
  }

  return (
    <span style={{ backgroundColor: bgColor, padding: 8 }}>
      {prefix}
      {dateFormatted}
    </span>
  );
};

const OrderList = ({
  orders,
  addToast,
  loadOrders,
  setSelectedOrders,
  selectedOrders,
  showOrderUpdateModal,

  filters,
  pages,
  onPageChange,
}) => {
  const { t } = useTranslation(["translation"]);
  const { user: admin } = useContext(UserContext);
  const [collectPaymentFor, setCollectPaymentFor] = useState(undefined);

  const [shouldShowChangeStatusModal, setShouldShowChangeStatusModal] = useState();

  const allowedOrders = (orders || []).filter(({ processStatus, client }) => {
    const r1 = (admin.allowedStatuses || []).length > 0 ? admin.allowedStatuses.includes(processStatus) : true;
    const r2 = admin.roleNumber === 6 ? client?._id === admin._id : true;
    return r1 && r2;
  });

  const updateOrderStatusProcess = () => {};

  const selectOrder = (_id) => (event) => {
    if (event.target.checked) {
      setSelectedOrders([...selectedOrders, _id]);
    } else {
      setSelectedOrders(selectedOrders.filter((sid) => sid !== _id));
    }
  };

  const handleEdit = (order) => {
    setCollectPaymentFor(order);
  };

  const closeCollectPaymentModal = () => {
    setCollectPaymentFor(undefined);
  };

  const handleAfterUpdate = () => {
    closeCollectPaymentModal();
    loadOrders();
  };

  function subtotal(items) {
    return items.map(({ price }) => price).reduce((sum, i) => sum + i, 0);
  }

  return (
    <>
      <div style={{ padding: 25 }}>
        <Pagination
          activePage={filters.currentPage}
          totalPages={pages}
          onPageChange={(_, { activePage }) => onPageChange(activePage)}
        />
      </div>
      <Table celled>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell colSpan="2" rowSpan="2">
              {t("Actions")}
            </Table.HeaderCell>
            <Table.HeaderCell>{t("ID")}</Table.HeaderCell>
            <Table.HeaderCell>{t("Client")}</Table.HeaderCell>
            <Table.HeaderCell>{t("Status")}</Table.HeaderCell>
            <Table.HeaderCell>{t("Process Status")}</Table.HeaderCell>
            <Table.HeaderCell>{t("Total Units")}</Table.HeaderCell>
            <Table.HeaderCell>{t("Total Cost")}</Table.HeaderCell>
            <Table.HeaderCell>{t("Total Paid")}</Table.HeaderCell>
            <Table.HeaderCell>{t("To Recieve")}</Table.HeaderCell>
            <Table.HeaderCell>{t("Est. Conlusion")}</Table.HeaderCell>
            <Table.HeaderCell>{t("Created At")}</Table.HeaderCell>
            <Table.HeaderCell>{t("Last Pay date")}</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {allowedOrders.map((order) => {
            const shouldDeleteQuote = order.status === 4 && Date.now() - order.createdAt * 1000 > _30Days;
            const sumCalc = currencyFormatter.format(order.totalCost - order.totalPaid);

            //const subTotal = (({sumCalc}) => sumCalc.reduce, (sum, i) => sum + i, 0);

            return (
              <Table.Row key={order._id}>
                <Table.Cell>
                  <div style={{ display: "flex", gridAutoFlow: "column", columnGap: 16 }}>
                    {([1].includes(admin.roleNumber) || shouldDeleteQuote) && (
                      <DeleteOrder
                        hasPayments={order.totalPaid !== 0}
                        id={order._id}
                        addToast={addToast}
                        loadOrders={loadOrders}
                      />
                    )}
                    {order.totalCost > order.totalPaid && order.status !== 4 && (
                      <button onClick={() => handleEdit(order)} className="table-action-btn">
                        <Icon name="money bill alternate" />
                      </button>
                    )}
                    {order.status === 4 && <UpdateQuotation id={order._id} addToast={addToast} loadOrders={loadOrders} />}

                    {(order.status === 4 || admin.roleNumber === 1) && (
                      <Button className="table-action-btn" onClick={() => showOrderUpdateModal(order._id)}>
                        <Icon name="pencil alternate" />
                      </Button>
                    )}
                  </div>
                </Table.Cell>
                <Table.Cell>
                  {order.status === 4 && <input type="checkbox" onChange={selectOrder(order._id)}></input>}
                </Table.Cell>

                <Table.Cell>
                  <a href={`/orders/view/${order._id}`}>{order.orderId}</a>
                </Table.Cell>
                <Table.Cell>
                  {(order.client || {}).firstName} {(order.client || {}).lastName}
                </Table.Cell>
                <Table.Cell>
                  {stringifyOrderStatus(t, order.status, shouldDeleteQuote || noPaymentSince30days(order))}
                </Table.Cell>
                <Table.Cell>
                  {order.status !== 4 && (
                    <OrderProcess
                      id={order._id}
                      status={order.processStatus}
                      onUpdate={loadOrders}
                      paymentStatus={order.status}
                      allowed={
                        [1, 2].includes(admin.roleNumber)
                          ? [...orderProcesses.keys()]
                          : orderProcesses.map((_, i) => i).filter((s) => order.processStatus + 1 === s)
                      }
                    />
                  )}
                </Table.Cell>
                <Table.Cell>{formatNumber(order.totalUnits)}</Table.Cell>
                <Table.Cell>{currencyFormatter.format(order.totalCost)}</Table.Cell>
                <Table.Cell>{currencyFormatter.format(order.totalPaid)}</Table.Cell>
                <Table.Cell style={{ padding: 16, width: 160, color: "red", backgroundColor: "#f5ebe1", fontWeight: "bold" }}>
                  {sumCalc} {subtotal}
                </Table.Cell>
                <Table.Cell style={{ padding: 16, width: 160 }}>
                  <EstConclusionDate date={order.estConclusionDate} status={order.processStatus} />
                </Table.Cell>
                <Table.Cell>{moment(order.createdAt * 1000).format("DD/MM/YYYY")}</Table.Cell>
                <Table.Cell>
                  {order.transactions.length > 0
                    ? moment(order.transactions.sort((a, b) => b.createdAt - a.createdAt)[0].createdAt * 1000).format(
                        "DD/MM/YYYY"
                      )
                    : "-"}
                </Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
        <Table.Footer>
          <tr>
            <th></th>
            <th></th>
            <th></th>
            <th></th>
            <th></th>
            <th></th>
            <th></th>
            <th>Total</th>
            <th></th>
            <th></th>
            <th></th>
            <th></th>
            <th></th>
          </tr>

          <Table.Row>
            <Table.HeaderCell colSpan="20" style={{ textAlign: "right" }}>
              <Pagination
                activePage={filters.currentPage}
                totalPages={pages}
                onPageChange={(_, { activePage }) => onPageChange(activePage)}
              />
            </Table.HeaderCell>
          </Table.Row>
        </Table.Footer>
      </Table>
      {collectPaymentFor && (
        <AddOrderPaymentModal
          addToast={addToast}
          order={collectPaymentFor}
          onClose={closeCollectPaymentModal}
          afterSave={handleAfterUpdate}
          loadOrders={loadOrders}
        />
      )}
      {shouldShowChangeStatusModal && (
        <Confirm open onCancel={() => setShouldShowChangeStatusModal(undefined)} onConfirm={updateOrderStatusProcess} />
      )}
    </>
  );
};

OrderList.defaultProps = {
  orders: [],
  isLoading: true,
};

export default OrderList;
