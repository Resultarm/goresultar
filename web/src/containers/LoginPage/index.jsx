import React, { useContext, useEffect } from "react";
import Logo from "src/components/Logo";
import { Header, Message } from "semantic-ui-react";
import { Link, navigate } from "@reach/router";
import LoginForm from "src/components/LoginForm/";
import { useLogin } from "src/hooks";
import { UserContext } from "src/contexts";
import "./styles.scss";
import { message } from "antd";

const LoginPage = ({ onLogin }) => {
  const { token } = useContext(UserContext);
  const { data: { token: newToken } = {}, login, status } = useLogin();

  useEffect(() => {
    if (status.isSuccess) {
      onLogin(newToken);
    } else if (status.isError) {
      message.error(status.message || "failed to login");
    }
  }, [status, newToken, onLogin]);

  useEffect(() => {
    if (token) navigate("/");
  }, [token]);

  return (
    <div style={{ height: "100%" }}>
      <div className="login-container">
        <div style={{ maxWidth: "90%", margin: "10% auto auto auto", width: 400 }}>
          <Logo />
          <Header as="h2" color="teal" textAlign="center">
            Acessar Sua Conta
          </Header>
          <LoginForm onSubmit={login} />
          <Message>
            Encontrou algum problema?{" "}
            <Link exact to="/registration">
              Fale com o suporte
            </Link>
          </Message>
        </div>
        <div className="aside">
          <div
            style={{
              backgroundImage: 'url("/login-cover-bg.jpg")',
              backgroundRepeat: "no-repeat",
              backgroundSize: "cover",
              height: "100%",
            }}
          >
            <div class="text-right" style={{ padding: 16 }}>
              <h2>GR</h2>
            </div>
            <div class="ant-row ant-row-center">
              <div class="ant-col ant-col-xs-0 ant-col-sm-0 ant-col-md-0 ant-col-lg-20">
                <img class="img-fluid mb-5" style={{ maxWidth: "100%", marginBottom: 32 }} src="/login-cover.png" alt="" />
                <h1 class="text-white" style={{ fontWeight: "bold" }}>
                  Bem vindo ao GR
                </h1>
                {/* <p class="text-white">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus
                ullamcorper nisl erat, vel convallis elit fermentum
                pellentesque.
              </p> */}
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", padding: 32 }}>
              <a class="text-white" href="/#">
                Termo &amp; Condições
              </a>
              <span class="text-white" style={{ margin: "0 8px" }}>
                {" "}
                |{" "}
              </span>
              <a class="text-white" href="/#">
                Privacidade &amp; Política
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
