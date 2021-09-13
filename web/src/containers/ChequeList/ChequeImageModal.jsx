import React from "react";
import { Modal } from "antd";
import { useState } from "react";

function ChequeImageModal({ urls, onClose }) {
  const [selected, setSelected] = useState(urls[0]);

  return (
    <Modal visible onCancel={onClose} footer={null} width={1000}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "80px auto",
          height: 450,
        }}
      >
        <div
          style={{
            textAlign: "center",
            borderRight: "1px solid #aaa",
            paddingRight: 16,
          }}
        >
          {urls.map((url) => (
            <div
              style={{
                borderWidth: selected === url ? 3 : 0,
                borderStyle: "solid",
                marginBottom: 16,
                borderColor: "teal",
              }}
            >
              <img
                key={url}
                style={{
                  maxWidth: "100%",
                  height: 60,
                  objectFit: "contain",
                }}
                src={url}
                onClick={() => setSelected(url)}
              />
            </div>
          ))}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            minHeight: 0,
            justifyContent: "center",
            padding: 16,
          }}
        >
          <img
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
            }}
            src={selected}
          />
        </div>
      </div>
    </Modal>
  );
}

export default ChequeImageModal;
