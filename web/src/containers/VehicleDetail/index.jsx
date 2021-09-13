import { Descriptions, Button, Table, Card, Col, Row } from "antd";
import React from "react";
import { PrinterOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import NSHandler from "src/components/NSHandler";
import moment from "moment";
import { useVehicle } from "src/hooks";
import QRCode from "qrcode.react";
import { OrganizationAddr } from "src/components";
import { getName, measurementValueDisplay, nf } from "src/helpers";

function VehiclePrintView({ vehicle }) {
  return (
    <div className="printonly printonly-flex space-between">
      <OrganizationAddr organization={vehicle.organization} />
      <QRCode id="qr-canvas" value={window.location.href} size={100} />
    </div>
  );
}

function VehicleDetail({ id }) {
  const { t } = useTranslation(["translation"]);
  const { data: vehicle, getStatus: status } = useVehicle(id);

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
            <VehiclePrintView vehicle={vehicle} />
    <div className="site-card-wrapper">
    <Card style={gridStyle} title={t("Vehicle Details")+ vehicle.task.taskId}>
    <Row gutter={16}>
      <Col span={8}>
        <Card title={t("About the Vehicle")} bordered={false}>
        <h3>{getName(vehicle.type)}</h3> 
        {vehicle.description}<br></br>
        {vehicle.kmNow}<br></br>
        {vehicle.driver}<br></br>
            <b>#: {vehicle.registrationNumber}</b>
        </Card>
      </Col>
      <Col span={8}>
        <Card title={t("Obs")} bordered={false}>
        {getName(vehicle.obs)}
        </Card>
      </Col>
      <Col span={8}>
      <Card title={t("Last Manutences")} bordered={false}>
        <h3>{getName(vehicle.lastManutences)}</h3> 
            <b>{vehicle.assignee} </b>
        </Card>
      </Col>
    </Row>
    </Card>
  </div>
              <Descriptions size="small" bordered style={{ marginBottom: 32 }}>
              <Descriptions.Item label={t("Purchase Price")} span={1.5}>
                {moment.unix(vehicle.purchasePrice)}
              </Descriptions.Item>
              <Descriptions.Item label={t("Purchase Date")} span={1.5}>
                {moment.unix(vehicle.purchaseDate).format("DD/MM/YYYY")}
              </Descriptions.Item>
              <Descriptions.Item label={t("Vin number")}>
                {getName(vehicle.vinNumber)}
              </Descriptions.Item>
              <Descriptions.Item label={t("Purchase Km")}span={2}>
                {vehicle.purchaseKm}
              </Descriptions.Item>
              </Descriptions>

              <Descriptions size="small" bordered style={{ marginBottom: 32 }}>
              <Descriptions.Item label={t("Vehicle")}>
                {getName(vehicle.actualPrice)}
              </Descriptions.Item>
              
              </Descriptions>
            
          </>
        )}
      </NSHandler>
    </div>
  );
}

export default VehicleDetail;
