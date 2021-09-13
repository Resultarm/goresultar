import React from "react";
import { Button, Modal } from "antd";
import QRCode from "qrcode.react";
import { useState } from "react";
import { Button as SButton } from "semantic-ui-react";
import { useTranslation } from "react-i18next";

function QRModal({ fileName, className, style }) {
  const [shouldShow, setShouldShow] = useState(false);
  const { t } = useTranslation("translation");

  const show = () => setShouldShow(true);
  const hide = () => setShouldShow(false);

  const downloadQR = () => {
    const canvas = document.getElementById("qr-canvas");
    const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    let downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `${fileName}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <>
      <SButton className={className} style={style} primary onClick={show}>
        {t("Show QR")}
      </SButton>
      {shouldShow && (
        <Modal visible onCancel={hide} width={300} footer={null}>
          <QRCode id="qr-canvas" value={window.location.href} size={256} includeMargin={true} />
          <Button onClick={downloadQR} type="primary" block>
            Download
          </Button>
        </Modal>
      )}
    </>
  );
}

export default QRModal;
