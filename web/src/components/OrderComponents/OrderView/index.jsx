import React from "react";
import { Button, Card, Confirm, Table } from "semantic-ui-react";
import { getOrder, getOrderPayments, deleteTransaction } from "../../../services/orderService";
import { formatDate, formatNumber, stringifyOrderStatus } from "../../../helpers/formatters";
import moment from "moment";
import QRCode from "qrcode.react";
import currencyFormatter from "../../../helpers/currencyFormatterPrefix";
import { staticFormOptions } from "../../../helpers/options";
import AddOrderPaymentModal from "src/components/OrderComponents/AddOrderPaymentModal";
import { Link } from "@reach/router";
import QRModal from "src/components/QRModal";
import OrganizationAddr from "src/components/OrganizationAddr";
import { withTranslation } from "react-i18next";
import { measurementValueDisplay, nf } from "src/helpers";

import { Descriptions, Breadcrumb } from 'antd';
import 'antd/dist/antd.css';

import { HomeOutlined, UserOutlined } from '@ant-design/icons';

class OrderViewPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      order: { items: [] },
      trxs: [],
      transactionToEdit: undefined,
      transactionToDelete: undefined,
      shouldShowQR: false,
    };
  }

  fetchTransactions = () => {
    getOrderPayments(this.props.id)
      .then((resp) => this.setState({ trxs: resp.data }, () => console.log(this.state)))
      .catch((err) =>
        this.props.addToast("Could not fetch related transactions", {
          appearance: "error",
        })
      );
  };

  fetchOrderAndTransactions = () => {
    getOrder(this.props.id)
      .then((resp) => this.setState({ order: resp }))
      .catch((err) => this.props.addToast("Could not fetch order", { appearance: "error" }));

    this.fetchTransactions();
  };

  componentDidMount() {
    this.fetchOrderAndTransactions();
  }

  handleEdit = (transaction) => () => {
    this.setState({ transactionToEdit: transaction });
  };

  handleDelete = (transactionId) => () => {
    this.setState({ transactionToDelete: transactionId });
  };

  handleConfirmDelete = () => {
    const { t } = this.props;
    deleteTransaction(this.state.order._id, this.state.transactionToDelete)
      .then((resp) => {
        this.props.addToast(t("Transaction") + " " + t("deleted successfully"), {
          appearance: "success",
        });
        this.closeDeleteConfirmation();
        this.fetchOrderAndTransactions();
      })
      .catch((err) => {
        this.props.addToast(t("Could not delete") + " " + t("transaction"), {
          appearance: "error",
        });
        this.closeDeleteConfirmation();
      });
  };

  closeTransactionEditModal = () => {
    this.setState({ transactionToEdit: undefined });
  };

  handleAfterTransactionSave = () => {
    this.setState({ transactionToEdit: undefined }, this.fetchOrderAndTransactions);
  };

  closeDeleteConfirmation = () => {
    this.setState({ transactionToDelete: undefined });
  };

  showQR = () => {
    this.setState({ shouldShowQR: true });
  };
  hideQR = () => {
    this.setState({ shouldShowQR: false });
  };



  prepareTransactionsTable = (trxs) => {
    const { t } = this.props;
    return (
      <Table.Body>
        {trxs.map((trx) => (
          <Table.Row key={trx._id}>
            <Table.Cell className="noprint">
              {[1, 2].includes(this.props.admin.roleNumber) && (
                <>
                  <Button icon="edit" basic onClick={this.handleEdit(trx)} size="mini" />
                  <Button icon="trash alternate" negative basic onClick={this.handleDelete(trx._id)} size="mini" />
                </>
              )}
            </Table.Cell>
            <Table.Cell>{moment(trx.createdAt * 1000).format("DD/MM/YYYY")}</Table.Cell>
            <Table.Cell>
              {staticFormOptions.paymentOptions.find(({ value }) => value === trx.method)?.text}
              <br />
              {trx.method === 4 && trx.chequeId && <Link to={`/cheques`}>({trx.chequeId})</Link>}
            </Table.Cell>
            <Table.Cell>{currencyFormatter.format(trx.amount)}</Table.Cell>
            <Table.Cell>
              {trx.fileLink && (
                <a target="_blank" href={`/assets/${trx.fileLink}`}>
                  📎 {t("attachment")}
                </a>
              )}
            </Table.Cell>
            <Table.Cell>{trx.comment}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    );
  };

  render() {
    const { order } = this.state;
    const { items: products } = order;
    const { t } = this.props;

    const totalWithoutDiscount = products.reduce((acc, p) => {
      return p.measurementValue.reduce((acc, v) => acc * v, 1) * p.price * p.amount + acc;
    }, 0);

    return (
      <div style={{ display: "grid"}}>
        <div className="container">
        <div className="noprint">    <Breadcrumb>
    <Breadcrumb.Item href="/">
      <HomeOutlined />
    </Breadcrumb.Item>
    <Breadcrumb.Item href="/orders">
      <UserOutlined />
      <span>{t("Orders")}</span>
    </Breadcrumb.Item>
    <Breadcrumb.Item>{t("Detalhes")}</Breadcrumb.Item>
    </Breadcrumb>
    </div>
        <Button primary className="noprint" style={{ marginBottom: 16, float: "right" }} onClick={() => window.print()}>
            <i class="print icon"></i>
            {t("Print")}
          </Button>
          <QRModal className="noprint" style={{ marginBottom: 16, float: "right" }} fileName={this.state.order?._id} />      
    <Descriptions title={t("Invoice")}bordered>
 

    <Descriptions.Item><OrganizationAddr organization={this.state.order.organization} /></Descriptions.Item>

    <Descriptions.Item>
    {t("Order ID")}:&nbsp;<strong>{order.orderId}:</strong>&nbsp;&nbsp;{t("Total Items")}:&nbsp;<strong>{formatNumber(order.totalUnits)}</strong> 
    <br></br>{t("Created At")}:&nbsp;<strong>{formatDate(order.createdAt)}</strong>
    <br></br>{t("Created By")} {order.user?.firstName + " " + order.user?.lastName}
    <br></br>{t("Last Pay date")}:&nbsp;<strong>
                  {this.state.trxs.length > 0
                    ? moment(this.state.trxs.sort((a, b) => b.createdAt - a.createdAt)[0].createdAt * 1000).format("DD/MM/YYYY")
                    : "-"}</strong>
    </Descriptions.Item>
    
    <Descriptions.Item>{t("Bill To")}<h5><strong>{this.state.order.client?.firstName + " " + this.state.order.client?.lastName}</strong></h5>{this.state.order.client?.address}<br></br>{this.state.order.client?.cellNumber}
    <strong>{stringifyOrderStatus(t, order.status)}</strong>
    </Descriptions.Item>
    </Descriptions>
    <br></br>

          <Table celled className="noprint">
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>{t("Property")}</Table.HeaderCell>
                <Table.HeaderCell>{t("Value")}</Table.HeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
            
              <Table.Row>
                <Table.Cell></Table.Cell>
                <Table.Cell></Table.Cell>
              </Table.Row>
              <Table.Row className="noprint">
                <Table.Cell>{t("Total Cost")}</Table.Cell>
                <Table.Cell>{currencyFormatter.format(order.totalCost)}</Table.Cell>
              </Table.Row>
              <Table.Row className="noprint">
                <Table.Cell>{t("Total Paid")}</Table.Cell>
                <Table.Cell>{currencyFormatter.format(order.totalPaid)}</Table.Cell>
              </Table.Row>
              <Table.Row className="noprint">
              </Table.Row>
              <Table.Row className="noprint">
                <Table.Cell>{t("Comment")}</Table.Cell>
                <Table.Cell>{order.comment}</Table.Cell>
              </Table.Row>
              <Table.Row className="noprint">
                <Table.Cell>{t("Est. Conclusion Date")}</Table.Cell>
                <Table.Cell>{order.estConclusionDate ? moment(order.estConclusionDate).format("DD/MM/YYYY") : "-"}</Table.Cell>
              </Table.Row>
              <Table.Row className="noprint">
                <Table.Cell>{t("Client")}</Table.Cell>
                <Table.Cell>{order.client && order.client.firstName + " " + order.client.lastName}</Table.Cell>
              </Table.Row>
              <Table.Row className="noprint">
                <Table.Cell>{t("Documents")}</Table.Cell>
                <Table.Cell>
                  {(order.documents || []).map((url) => (
                    <>
                      <a href={url} target="_blank">
                        {url}
                      </a>
                      <br />
                    </>
                  ))}
                </Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table>

          <h4>{t("Products")}</h4>
          <Table celled>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>{t("Title")}</Table.HeaderCell>
                <Table.HeaderCell>{t("Comment")}</Table.HeaderCell>
                <Table.HeaderCell>{t("Unit Price")}</Table.HeaderCell>
                <Table.HeaderCell>{t("Dimensions")}</Table.HeaderCell>
                <Table.HeaderCell>{t("Quantity")}</Table.HeaderCell>
                <Table.HeaderCell>{t("Total")}</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {this.state.order.items.map((product) => (
                <Table.Row key={product.productId}>
                  <Table.Cell>{product.title}</Table.Cell>
                  <Table.Cell>{product.comment}</Table.Cell>
                  <Table.Cell>{currencyFormatter.format(product.price)}</Table.Cell>
                  <Table.Cell>{measurementValueDisplay(product.measurementValue)}</Table.Cell>
                  <Table.Cell>{nf(product.amount)}</Table.Cell>
                  <Table.Cell>
                    {currencyFormatter.format(
                      product.measurementValue.reduce((acc, v) => acc * v, 1) * product.amount * product.price
                    )}
                  </Table.Cell>
                </Table.Row>
              ))}

              <Table.Row>
                <Table.Cell colspan="5" textAlign="right">
                  <strong>{t("Gross Total")}</strong>
                </Table.Cell>
                <Table.Cell>
                  <strong>{currencyFormatter.format(totalWithoutDiscount)}</strong>
                </Table.Cell>
              </Table.Row>

              <Table.Row>
                <Table.Cell colspan="5" textAlign="right">
                  {t("Discount")}
                </Table.Cell>
                <Table.Cell>
                  - {currencyFormatter.format(totalWithoutDiscount - order.totalCost)} ({this.state.order.discount}%)
                </Table.Cell>
              </Table.Row>

              <Table.Row>
                <Table.Cell colspan="5" textAlign="right">
                  <strong>{t("Total")}</strong>
                </Table.Cell>
                <Table.Cell>
                  <strong>{currencyFormatter.format(this.state.order.totalCost)}</strong>
                </Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table>

          <h4>{t("Transactions")}</h4>
          <Table celled>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell className="noprint">{t("Actions")}</Table.HeaderCell>
                <Table.HeaderCell>{t("Date")}</Table.HeaderCell>
                <Table.HeaderCell>{t("Method")}</Table.HeaderCell>
                <Table.HeaderCell>{t("Amount")}</Table.HeaderCell>
                <Table.HeaderCell>{t("Proof")}</Table.HeaderCell>
                <Table.HeaderCell>{t("Comment")}</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            {this.prepareTransactionsTable(this.state.trxs)}
          </Table>
          {this.state.transactionToEdit && (
            <AddOrderPaymentModal
              order={this.state.order}
              addToast={this.props.addToast}
              initialValues={this.state.transactionToEdit}
              loadOrders={this.fetchTransactions}
              onClose={this.closeTransactionEditModal}
              afterSave={this.handleAfterTransactionSave}
            />
          )}
          {this.state.transactionToDelete && (
            <Confirm
              open
              content={t("Are you sure you want to delete") + " " + t("transaction") + " ?"}
              onCancel={this.closeDeleteConfirmation}
              onConfirm={this.handleConfirmDelete}
              cancelButton={t("No")}
              confirmButton={t("Yes")}
            />
          )}
          <QRCode  style={{ textAlign: "center", marginTop: 5 }} className="printonly" id="qr-canvas" value={window.location.href} size={50}/>
        </div>
        
        <div className="noprint" style={{ padding: "20px 5%" }}>
          {this.props.admin._id === this.state.order.user?._id &&
            this.state.order.user?.roleNumber === 1 &&
            [2, 3, 8].includes(this.state.order.status) && (
              <Card>
                <Card.Content>
                  <Card.Header content={t("Your Commission")} />
                  <Card.Description
                    content={
                      <div style={{ textAlign: "center", marginTop: 16 }}>
                        <span
                          style={{
                            color: "#508cfe",
                            fontSize: 24,
                            fontWeight: "bold",
                            marginRight: 8,
                          }}
                        >
                          {currencyFormatter.format((this.state.order.user?.commission * this.state.order.totalCost) / 100)}
                        </span>
                        <span>({`${this.state.order.user?.commission} %`})</span>
                      </div>
                    }
                  />
                </Card.Content>
              </Card>
            )}
        </div>
      </div>
    );
  }
}

export default withTranslation("translation")(OrderViewPage);
