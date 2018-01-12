import React from "react";
import { Router } from "react-router";
import moment from 'moment';
import EventStore from "./store/EventStore";
import EventActions from "./actions/EventActions";
import { getShortDateTime } from './utils/dateTime';

function getIndexPageState() {
  return {
      events: EventStore.getEvents(),
      selectedEvent: null
  };
}

var IndexViewComponent = React.createClass({
  getInitialState: function() {
      return getIndexPageState();
  },
  componentWillMount: function() {

  },
  componentDidMount: function() {
      EventActions.loadEvents(true);
      EventStore.addChangeListener(this._onChange);

  },
  componentWillUnmount: function() {
      EventStore.removeChangeListener(this._onChange);
  },
  _onChange: function() {
      this.setState(this.getInitialState());
  },
  render: function() {
      var eventComponents = this.state.events.map(function(event) {
          return (
              <AvailableEventCard event={event} ref={event.id} key={event.id}/>
          );
      });
      var eventList = !this.state.events.length ? <div>There are no events to display!</div> : eventComponents;
      return (
          <section>
              <hgroup>
                  <h2>Avoimet ilmoittautumiset: </h2>
              </hgroup>
              <div>
                  {eventList}
              </div>
          </section>
      );
  }
});

var AvailableEventCard = React.createClass({
  registerToEvent: function() {
      window.location = "/register/" +this.props.event.id;
  },
  isEventInThePast: function() {
      let now = moment().toDate();
      let registrationStart = moment(this.props.event.registrationStartDate, "DD.MM.YYYY HH:mm").toDate();
      let registrationEnd = moment(this.props.event.registrationEndDate, "DD.MM.YYYY HH:mm").toDate();
      return registrationStart > now || registrationEnd < now;
  },
  render: function() {
      var cardDisabled = this.isEventInThePast();
      var cardClasses = cardDisabled ? "card card-disabled" : "card";
      var tooltip = cardDisabled ? "Registration period for this event has ended" : " ";
      return (
          <div className={cardClasses} ref={this.props.event.id} onClick={this.registerToEvent} title={tooltip}>
              <div className="card-header">
                  <span>{this.props.event.name}</span>
              </div>
              <div className="card-body">
                  <ul>
                      <li>
                          Päivä: { getShortDateTime(this.props.event.dateOfEvent) }
                      </li>
                      <li>
                          Ilmoittautuminen alkaa: { getShortDateTime(this.props.event.registrationStartDate) }
                      </li>
                      <li>
                          Ilmoittautuminen päättyy: { getShortDateTime(this.props.event.registrationEndDate) }
                      </li>
                  </ul>
              </div>
          </div>
      );
  }
});

export default IndexViewComponent;
