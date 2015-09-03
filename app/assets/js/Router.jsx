define(['react', 'jquery', 'underscore', 'react-router', 'IndexView', 'AdminPage', 'Cabins', 'Events', 'RegisterView'], function(React, $, _, Router, IndexView, AdminPage, CabinPage, EventPage, RegisterView) {
    var Route = Router.Route


    var App = React.createClass({

        componentDidMount: function() {
            $(document).ajaxStart(_.debounce(function() {
                $('.overlay').show();
            }), 100);
            $(document).ajaxStop(function() {
                $('.overlay').hide();
            });
        },
        render: function() {
            return (
                <div id="mainSection">
                    <div className="overlay" style={{display: 'none'}} >
                        <div id="spinner" className="loading"/>
                    </div>
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
            <Route path="/register/:eventId" handler={RegisterView} />
            <Router.NotFoundRoute handler={NotFound} />
            <Route path="/admin" handler={AdminPage} />
            <Route path="/admin/cabins" handler={CabinPage} />
            <Route path="/admin/events" handler={EventPage} />
        </Route>
    );

    var AppRouter = {};
    AppRouter.startRouter = function() {
        Router.run(routes, Router.HistoryLocation, function (Root, state) {
          React.render(<Root params={state.params}/>, document.getElementById('container'));
        });
    }

    return AppRouter;
});