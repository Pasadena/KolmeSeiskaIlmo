define(['react','react-router', 'jquery', 'components/FormComponents', 'underscore', 'react-bootstrap', 'api/CommonAPI'], function(React, Router, $, FormComponents, _, RB, CommonAPI) {

    var Panel = RB.Panel;
    var Input = FormComponents.InputWrapper;
    var ButtonInput = RB.ButtonInput;
    var Alert = RB.Alert;

    var LoginView = React.createClass({displayName: "LoginView",
        mixins: [Router.Navigation],
        getInitialState: function() {
            return {messages: []};
        },
        onSubmit: function(event) {
            event.preventDefault();
            var credentials = {userName: this.refs.userName.state.value, password: this.refs.password.state.value};
            var callbackContext = this;
            CommonAPI.post(credentials, "/login")
            .then(function(data) {
                callbackContext.transitionTo("/admin");
            }, function(request, status, error) {
                var messages = callbackContext.state.messages
                messages.push(request.responseText);
                callbackContext.setState({messages: messages});
                console.error(status, error.toString());
            });
        },
        render: function() {
            var messageComponents = this.state.messages.map(function(message, index) {
                return (
                    React.createElement(Alert, {bsStyle: "danger", key: index}, message)
                );
            });
            return (
                React.createElement(Panel, {header: "Login", bsStyle: "info"}, 
                    messageComponents, 
                    React.createElement("form", {onSubmit: this.onSubmit, className: "form-horizontal"}, 
                        React.createElement(Input, {type: "text", placeholder: "Insert username", label: "Username:*", id: "userNameField", 
                            name: "userName", labelClassName: "col-sm-2 control-label", wrapperClassName: "col-xs-4", 
                            required: "true", ref: "userName"}), 
                        React.createElement(Input, {type: "password", placeholder: "Insert password", label: "Password:*", id: "passwordField", 
                            name: "firstName", labelClassName: "col-sm-2 control-label", wrapperClassName: "col-xs-4", 
                            required: "true", ref: "password"}), 
                        React.createElement(ButtonInput, {type: "submit", bsStyle: "success", value: "Login"})
                    )
                )
            );
        }
    });

    return LoginView;

});