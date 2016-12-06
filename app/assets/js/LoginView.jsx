import React from 'react';
import { withRouter } from 'react-router';
import $ from 'jquery';
import {InputWrapper} from './components/FormComponents';
import _ from 'underscore';
import {Panel, Button, Alert, Form, FormGroup, Col} from 'react-bootstrap';
import CommonAPI from './api/CommonAPI';

class LoginView extends React.Component {
  constructor() {
    super();
    this.state = {messages: []};
    this.onSubmit = this.onSubmit.bind(this);
  }
  onSubmit(event) {
      event.preventDefault();
      var credentials = {userName: this.usernameField.state.value, password: this.passwordField.state.value};
      let callbackContext = this;
      CommonAPI.post(credentials, "/login")
      .then(function(data) {
        callbackContext.props.router.push("/admin");
      }, function(request, status, error) {
          var messages = this.state.messages
          messages.push(request.responseText);
          this.setState({messages: messages});
          console.error(status, error.toString());
      });
  }
  render() {
      const messageComponents = this.state.messages.map(function(message, index) {
          return (
              <Alert bsStyle="danger" key={index}>{message}</Alert>
          );
      });
      return (
          <Panel header="Login" bsStyle="info">
              {messageComponents}
              <Form horizontal onSubmit={this.onSubmit}>
                  <InputWrapper type="text" placeholder="Insert username" label="Username:*" id="userNameField"
                      name="userName" labelClassName="col-sm-2 control-label" wrapperClassName="col-xs-4"
                      required="true" ref={(input) => { this.usernameField = input; }}/>
                  <InputWrapper type="password" placeholder="Insert password" label="Password:*" id="passwordField"
                      name="firstName" labelClassName="col-sm-2 control-label" wrapperClassName="col-xs-4"
                      required="true" ref={(input) => { this.passwordField = input; }}/>
                  <FormGroup>
                    <Col smOffset={2} sm={10}>
                      <Button type="submit" bsStyle="primary">
                        Login
                      </Button>
                    </Col>
                  </FormGroup>
              </Form>
          </Panel>
      );
  }
}

export default withRouter(LoginView);
