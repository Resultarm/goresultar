import React, { useState } from "react";
import validator from "validator";
import { Button, Form, Segment } from "semantic-ui-react";

const LoginForm = ({ onSubmit }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isEmailValid, setIsEmailValid] = useState(true);
  const [isPasswordValid, setIsPasswordValid] = useState(true);

  const emailChanged = (data) => {
    setEmail(data);
    setIsEmailValid(true);
  };

  const passwordChanged = (data) => {
    setPassword(data);
    setIsPasswordValid(true);
  };

  const handleLoginClick = async () => {
    const isValid = isEmailValid && isPasswordValid;
    if (!isValid) {
      return;
    }

    onSubmit({ email, password });
  };

  return (
    <Form name="loginForm" size="large" onSubmit={handleLoginClick}>
      <Segment>
        <Form.Input
          fluid
          icon="at"
          iconPosition="left"
          placeholder="Email"
          type="email"
          error={!isEmailValid}
          onChange={(ev) => emailChanged(ev.target.value)}
          onBlur={() => setIsEmailValid(validator.isEmail(email))}
        />
        <Form.Input
          fluid
          icon="lock"
          iconPosition="left"
          placeholder="Password"
          type="password"
          error={!isPasswordValid}
          onChange={(ev) => passwordChanged(ev.target.value)}
          onBlur={() => setIsPasswordValid(Boolean(password))}
        />

        <Button type="submit" color="teal" fluid size="large" primary>
          Login
        </Button>
      </Segment>
    </Form>
  );
};

export default LoginForm;
