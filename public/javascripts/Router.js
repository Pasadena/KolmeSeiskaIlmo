define(['react', 'jquery', 'underscore', 'react-router', 'IndexView', 'AdminPage', 'Cabins', 'Events', 'RegisterView', 'LoginView'], function(React, $, _, Router, IndexView, AdminPage, CabinPage, EventPage, RegisterView, LoginView) {
    var Route = Router.Route


    var App = React.createClass({displayName: "App",

        componentWillMount: function() {
            $(document).ajaxStart(function() {
                $('.overlay').show();
            });
            $(document).ajaxComplete(function() {
                $('.overlay').hide();
            });
        },
        render: function() {
            return (
                React.createElement("div", {id: "mainSection"}, 
                    React.createElement("div", {className: "overlay", style: {display: 'none'}}, 
                        React.createElement("div", {id: "spinner", className: "loading"})
                    ), 
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