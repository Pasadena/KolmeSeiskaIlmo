import React from 'react';
import $ from 'jquery';
import _ from 'underscore';
import { browserHistory, Router, Route, IndexRoute, Link } from 'react-router'
import { Modal, Button } from 'react-bootstrap';
import IndexViewComponent from './IndexView';
import AdminLayout from './AdminPage';
import CabinPageView from './Cabins';
import EventSection from './Events';
import RegisterView from './RegisterView';
import LoginView from './LoginView';

class App extends React.Component {

    constructor() {
      super();
      this.state = {
        showErrorModal: false,
        errorMessage: ""
      }
    }

    componentWillMount() {
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
    }

    render() {
        return (
            <div id="content">
                <div className="overlay" style={{display: 'none'}} >
                    <div id="spinner" className="loading"/>
                </div>
                <ErrorNotification show={this.state.showErrorModal} errorMessage={this.state.errorMessage} />
                <Header />
                <div id="main" className="main">
                  {this.props.children}
                </div>
            </div>
        );
    }
}

const NotFound = () => (
  <div>The requested page does not exist sucker!</div>
)

const Header = () => (
  <div className="header">
      <img className="banner" src="/assets/images/teekkariristeily18_kansikuva.png" />
  </div>
)

const ErrorNotification = ({ show, errorMessage }) => {
  let dismiss = () => window.location.href="/";
  return (
      <Modal onHide={dismiss} show={show}>
          <div className="modal-header">A Unexpected error happened during registration!</div>
          <div className="modal-body">
              <p>WhoopsieDaisies! Something seems to be gone wrong!</p>
              <p>Server returned the following message: {errorMessage}</p>
              <p style={{fontWeight: 'bold'}}>If the problem persists, contact us at &nbsp;
                  <a href="mailto:teekkariristeily@gmail.com">teekkariristeily@gmail.com</a>
              </p>
          </div>
          <div className="modal-footer"><Button onClick={dismiss}>Back to front page!</Button></div>
      </Modal>
  );
}

class AppRouter extends React.Component {
      constructor() {
        super();
      }
      render() {
        return (
          <Router history={browserHistory}>
            <Route path="/" component={App}>
              <IndexRoute component={IndexViewComponent}/>
              <Route path="register/:eventId" component={RegisterView} />
              <Route path="/admin" component={AdminLayout}/>
              <Route path="/admin/cabins" component={CabinPageView} />
              <Route path="/admin/events" component={EventSection} />
              <Route path="login" component={LoginView} />
              <Route path='*' component={NotFound} />
            </Route>
          </Router>
        );
      }
    }

export default AppRouter;
