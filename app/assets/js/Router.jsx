define(['react', 'jquery', 'underscore', 'react-router', 'react-bootstrap', 'IndexView', 'AdminPage', 'Cabins', 'Events', 'RegisterView', 'LoginView'], function(React, $, _, Router, RB, IndexView, AdminPage, CabinPage, EventPage, RegisterView, LoginView) {
    var Route = Router.Route


    var App = React.createClass({

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
                <div id="mainSection">
                    <div className="overlay" style={{display: 'none'}} >
                        <div id="spinner" className="loading"/>
                    </div>
                    <ErrorNotification show={this.state.showErrorModal} errorMessage={this.state.errorMessage} />
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

    var ErrorNotification = React.createClass({
        dismiss: function(event) {
            window.location.href="/";
        },
        render: function() {
            return (
                <RB.Modal onRequestHide={this.dismiss} onHide={this.dismiss} show={this.props.show}>
                    <div className="modal-header">A Unexpected error happened during registration!</div>
                    <div className="modal-body">
                        <p>WhoopsieDaisies! Something seems to be gone wrong!</p>
                        <p>Server returned the following message: {this.props.errorMessage}</p>
                        <p style={{fontWeight: 'bold'}}>If the problem persists, contact us at &nbsp;
                            <a href="mailto:teekkariristeily@gmail.com">teekkariristeily@gmail.com</a>
                        </p>
                    </div>
                    <div className="modal-footer"><RB.Button onClick={this.dismiss}>Back to front page!</RB.Button></div>
                </RB.Modal>
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
            <Route path="/login" handler={LoginView} />
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