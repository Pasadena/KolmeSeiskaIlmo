define(['react', 'react-router', 'store/EventStore', 'actions/EventActions'], function(React, Router, EventStore, EventActions) {

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
            EventActions.loadEvents();
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
        mixins: [Router.Navigation],
        registerToEvent: function() {
            window.location = "/register/" +this.props.event.id;
            {/*this.transitionTo("/register/", {id: this.props.event.id});*/}
        },
        isEventInThePast: function() {
            var now = new Date();
            var registrationEnd = $.datepicker.parseDate('dd.mm.yy', this.props.event.registrationEndDate);
            return (registrationEnd - now < 0);
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
                                Päivä: {this.props.event.dateOfEvent}
                            </li>
                            <li>
                                Ilmoittautumisaika {this.props.event.registrationStartDate} - {this.props.event.registrationEndDate}
                            </li>
                        </ul>
                    </div>
                </div>
            );
        }
    });

    return IndexViewComponent;
});