define(['react', 'jquery', 'underscore', 'react-router', 'react-bootstrap', 'IndexView', 'AdminPage', 'Cabins', 'Events', 'RegisterView', 'LoginView'], function(React, $, _, Router, RB, IndexView, AdminPage, CabinPage, EventPage, RegisterView, LoginView) {
    var Route = Router.Route


    var App = React.createClass({displayName: "App",

        getInitialState: function() {
            return {showErrorModal: false, errorMessage: ""};
        },
        componentWillMount: function() {
            var context = this;
            $(document).ajaxStart(function() {
                $('.overlay').show();
            });
            $(document).ajaxComplete(function() {
                $('.overlay').hide();
            });
            $(document).ajaxError(function(event, jqxhr, settings, thrownError) {
                $('.overlay').hide();
                var errorText = jqxhr && jqxhr.responseJSON ? jqxhr.responseJSON.message : "";
                context.setState({showErrorModal: true, errorMessage: errorText});
            });
        },
        render: function() {
            return (
                React.createElement("div", {id: "mainSection"}, 
                    React.createElement("div", {className: "overlay", style: {display: 'none'}}, 
                        React.createElement("div", {id: "spinner", className: "loading"})
                    ), 
                    React.createElement(ErrorNotification, {show: this.state.showErrorModal, errorMessage: this.state.errorMessage}), 
                    React.createElement(Router.RouteHandler, null)
                )
            );
        }
    });

    var NotFound = React.createClass({displayName: "NotFound",
        render: function() {
            return (
                React.createElement("div", null, 
                    "The requested page does not exist sucker!"
                )
            );
        }
    });

    var ErrorNotification = React.createClass({displayName: "ErrorNotification",
        dismiss: function(event) {
            window.location.href="/";
        },
        render: function() {
            return (
                React.createElement(RB.Modal, {onRequestHide: this.dismiss, onHide: this.dismiss, show: this.props.show}, 
                    React.createElement("div", {className: "modal-header"}, "A Unexpected error happened during registration!"), 
                    React.createElement("div", {className: "modal-body"}, 
                        React.createElement("p", null, "WhoopsieDaisies! Something seems to be gone wrong!"), 
                        React.createElement("p", null, "Server returned the following message: ", this.props.errorMessage), 
                        React.createElement("p", {style: {fontWeight: 'bold'}}, "If the problem persists, contact us at  ", 
                            React.createElement("a", {href: "mailto:teekkariristeily@gmail.com"}, "teekkariristeily@gmail.com")
                        )
                    ), 
                    React.createElement("div", {className: "modal-footer"}, React.createElement(RB.Button, {onClick: this.dismiss}, "Back to front page!"))
                )
            );
        }
    });



    var routes = (
        React.createElement(Route, {handler: App}, 
            React.createElement(Route, {path: "/", handler: IndexView}), 
            React.createElement(Route, {path: "/register/:eventId", handler: RegisterView}), 
            React.createElement(Router.NotFoundRoute, {handler: NotFound}), 
            React.createElement(Route, {path: "/admin", handler: AdminPage}), 
            React.createElement(Route, {path: "/admin/cabins", handler: CabinPage}), 
            React.createElement(Route, {path: "/admin/events", handler: EventPage}), 
            React.createElement(Route, {path: "/login", handler: LoginView})
        )
    );

    var AppRouter = {};
    AppRouter.startRouter = function() {
        Router.run(routes, Router.HistoryLocation, function (Root, state) {
          React.render(React.createElement(Root, {params: state.params}), document.getElementById('container'));
        });
    }

    return AppRouter;
});