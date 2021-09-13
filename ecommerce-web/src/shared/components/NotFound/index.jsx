import React from "react";
import { navigate } from "@reach/router";
import { Result, Button } from "antd";

function NotFound() {
  return (
    <Result
      status="404"
      title="404"
      subTitle="Sorry, the page you visited does not exist."
      extra={
        <Button type="primary" onClick={() => navigate("/")}>
          Back Home
        </Button>
      }
    />
  );
}

export default NotFound;
