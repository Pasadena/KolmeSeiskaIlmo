define(['react', 'react-router', 'IndexView', 'AdminPage', 'Cabins', 'Events'], function(React, Router, IndexView, AdminPage, CabinPage, EventPage) {
    var Route = Router.Route


    var App = React.createClass({
        render: function() {
            return (
                <div>
                    <Router.RouteHandler />
                </div>
            );
        }
    });

    var NotFound = React.createClass({
        render: function() {
            return (
                <div>
                    The requested page does not exist sucker!
                </div>
            );
        }
    });


    var routes = (
        <Route handler={App}>
            <Route path="/" handler={IndexView} />
            <Router.NotFoundRoute handler={NotFound} />
            <Route path="/admin" handler={AdminPage} />
            <Route path="/admin/cabins" handler={CabinPage} />
            <Route path="/admin/events" handler={EventPage} />
        </Route>
    );

    var AppRouter = {};
    AppRouter.startRouter = function() {
        Router.run(routes, Router.HistoryLocation, function (Root, state) {
          React.render(<Root/>, document.getElementById('container'));
        });
    }

    return AppRouter;
});