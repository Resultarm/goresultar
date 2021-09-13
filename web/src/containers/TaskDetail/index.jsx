import { Descriptions, Button, Table, Card, Col, Row } from "antd";
import React from "react";
import { PrinterOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import NSHandler from "src/components/NSHandler";
import moment from "moment";
import { useTask } from "src/hooks";
import QRCode from "qrcode.react";
import { OrganizationAddr } from "src/components";
import { getName, measurementValueDisplay, nf } from "src/helpers";

function TaskPrintView({ task }) {
  return (
    <div className="printonly printonly-flex space-between">
      <OrganizationAddr organization={task.organization} />
      <QRCode id="qr-canvas" value={window.location.href} size={100} />
    </div>
  );
}

function TaskDetail({ id }) {
  const { t } = useTranslation(["translation"]);
  const { data: task, getStatus: status } = useTask(id);

  const gridStyle = {
    width: '100%',
    textAlign: 'center',
  };

  return (
    <div className="container">
      <div className="text-right margin-bottom noprint">
        <Button icon={<PrinterOutlined />} onClick={() => window.print()}>
        {t("Print")}
        </Button>
      </div>
      <NSHandler status={status}>
        {() => (
          <>
            <TaskPrintView task={task} />
    <div className="site-card-wrapper">
    <Card style={gridStyle} title={t("Service order")+ task.order.orderId}>
    <Row gutter={16}>
      <Col span={8}>
        <Card title={t("Delivery or Job Site")} bordered={false}>
        <h3>{getName(task.client)}</h3> 
        {task.workAddress}<br></br>
            <b>#: {task.client.mobileNumber}</b>
        </Card>
      </Col>
      <Col span={8}>
        <Card title={t("Seller")} bordered={false}>
        {getName(task.assignee)}
        </Card>
      </Col>
      <Col span={8}>
      <Card title={t("Client")} bordered={false}>
        <h3>{getName(task.client)}</h3> 
            {task.client.address} - {task.client.zipCode}<br></br>
            <b>#: {task.client.mobileNumber}</b>
        </Card>
      </Col>
    </Row>
    </Card>
  </div>
              <Descriptions size="small" bordered style={{ marginBottom: 32 }}>
              <Descriptions.Item label={t("Start Date")} span={1.5}>
                {moment.unix(task.startDate).format("DD/MM/YYYY")}
              </Descriptions.Item>
              <Descriptions.Item label={t("Conlusion Date")} span={1.5}>
                {moment.unix(task.estConclusionDate).format("DD/MM/YYYY")}
              </Descriptions.Item>
              <Descriptions.Item label={t("Leader")}>
                {getName(task.leader)}
              </Descriptions.Item>
              <Descriptions.Item label={t("Helpers")}span={2}>
                {task.helpers.map(getName).join(",")}
              </Descriptions.Item>
              </Descriptions>

              <Row gutter={16}>
              <Col span={8}> 
              <Card title={t("host")}>
              {task.host}
              </Card>
              </Col>
      <Col span={8}>
        <Card title={t("lunch")}>
        {task.lunch}
        </Card>
      </Col>
      <Col span={8}>
        <Card title={t("Vehicle")}>
        {task.vehicle}
        <b>{getName(task.drivers)}</b>
        </Card>
      </Col>
      </Row>
             
              <Descriptions size="small" bordered style={{ marginBottom: 32 }}>
              </Descriptions>
              <Card title={t("Rota")}>
            {task.rute}
            </Card>
            <Card title={t("Description")}>
            {task.description}
            </Card>
            
            {task.order && (
              <Descriptions size="small" bordered title={__("Order")}>
              <div>
                    <Table size="small" dataSource={task.order?.items} rowKey="productId" pagination={false} bordered={false}>
                      <Table.Column title={__("Title")} dataIndex="title"></Table.Column>
                      <Table.Column title={__("Quantity")} dataIndex="amount" width="95px" render={nf}></Table.Column>
                      <Table.Column
                        title={__("Dimensions")}
                        dataIndex="measurementValue"
                        render={measurementValueDisplay}
                        width="180px"
                      ></Table.Column>
                      <Table.Column title={__("Comment")} dataIndex="comment"></Table.Column>
                    </Table>
                    </div>
                  <br></br>          
              <Card title={t("Comment")}>
              {task.order.comment}
            </Card>
            <Card title={t("Obs")}>
            {task.obs}
            </Card>
              </Descriptions>
            )}
            
          </>
        )}
      </NSHandler>
    </div>
  );
}

export default TaskDetail;
