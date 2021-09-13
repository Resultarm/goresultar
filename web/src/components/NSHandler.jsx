import React from "react";
import { Loader } from "semantic-ui-react";
import NS from "src/helpers/NS";

const combineStatuses = (statuses) => {
  let hasData = false,
    errorCaught = false;
  for (let i = 0; i < statuses.length; i++) {
    const status = statuses[i];
    hasData &= status.hasData;
    errorCaught &= status.errorCaught;
  }

  const code = statuses.every((s) => s.isSuccess)
    ? "SUCCESS" // [SUCCESS, SUCCESS, SUCCESS]
    : statuses.find((s) => s.isError)
    ? "ERROR" // [SUCCESS, ERROR] or [LOADING, ERROR]
    : statuses.find((s) => s.isLoading)
    ? "LOADING" // [SUCCESS, LOADING] or [LOADING, INIT] or [LOADING, LOADING]
    : statuses.find((s) => s.isSuccess)
    ? "LOADING" // [SUCCESS, INIT]
    : "INIT"; // [INIT, INIT]
  console.log("code :>> ", code);
  const overallStatus = new NS(code, undefined);
  overallStatus.hasData = hasData;
  overallStatus.errorCaught = errorCaught;
  return overallStatus;
};

function StyleWrapper({ children, style }) {
  return (
    <div
      style={{
        display: "flex",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        color: "inherit",
        padding: 16,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export default function NSHandler({ status: statuses, children, style, noDataMessage }) {
  const status = statuses instanceof Array ? combineStatuses(statuses) : statuses;

  if (status.isInit) return null;

  if (status.isSuccess) {
    if (!status.hasData && noDataMessage) return <StyleWrapper style={style}>{noDataMessage}</StyleWrapper>;
    return children();
  }

  if (status.isLoading || status.isError) {
    return (
      <StyleWrapper style={style}>
        {status.isLoading && <Loader active inline />}
        {status.isError && "Oops! Something went wrong."}
        {status.isSuccess && !status.hasData && noDataMessage}
      </StyleWrapper>
    );
  }

  return null;
}
