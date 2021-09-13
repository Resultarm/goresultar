import React from "react";
import { Calendar, Modal } from "antd";
import moment from "moment";
import currencyFormatter from "../../helpers/currencyFormatter";

const colors = ["teal", "blue", "orange"];

function Cell({ cheques }) {
  return (
    <ul>
      {cheques.map((c, i) => (
        <li
          style={{
            fontSize: 10,
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
          }}
          key={c._id}
        >
          <i style={{ color: colors[i % colors.length], marginRight: 4 }}>⦿</i>
          {c.no} ({c.status}) ({currencyFormatter.format(c.amount)})
        </li>
      ))}
    </ul>
  );
}

function ChequeCalenderModal({ cheques, onClose }) {
  const chequeMapByDate = cheques.reduce((acc, cheque) => {
    const date = moment(cheque.date * 1000).format("DD/MM/YYYY");
    const destinationDate = moment(cheque.destinationDate * 1000).format(
      "DD/MM/YYYY"
    );
    const dateOnes = acc[date] || [];
    const destDateOnes = acc[destinationDate] || [];
    dateOnes.push(cheque);
    destDateOnes.push(cheque);
    acc[date] = dateOnes;
    acc[destinationDate] = destDateOnes;
    return acc;
  }, {});

  const chequeMapByMonth = cheques.reduce((acc, cheque) => {
    const date = moment(cheque.date * 1000).format("MM/YYYY");
    const destinationDate = moment(cheque.destinationDate * 1000).format(
      "MM/YYYY"
    );
    const dateOnes = acc[date] || [];
    const destDateOnes = acc[destinationDate] || [];
    dateOnes.push(cheque);
    destDateOnes.push(cheque);
    acc[date] = dateOnes;
    acc[destinationDate] = destDateOnes;
    return acc;
  }, {});

  const dateCellRender = (value) => {
    const filteredCheques = chequeMapByDate[value.format("DD/MM/YYYY")];
    if (!filteredCheques) return null;

    return <Cell cheques={filteredCheques} />;
  };

  const monthCellRender = (value) => {
    const filteredCheques = chequeMapByMonth[value.format("MM/YYYY")];
    if (!filteredCheques) return null;

    return <Cell cheques={filteredCheques} />;
  };
  return (
    <Modal
      visible
      onCancel={onClose}
      width="95%"
      bodyStyle={{ height: "80vh", overflowY: "auto" }}
      footer={null}
    >
      <Calendar
        fullscreen
        dateCellRender={dateCellRender}
        monthCellRender={monthCellRender}
      />
      ,
    </Modal>
  );
}

export default ChequeCalenderModal;
