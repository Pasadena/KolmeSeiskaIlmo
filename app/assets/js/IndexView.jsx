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
            EventActions.loadEvents();
        },
        componentDidMount: function() {
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
                        <h1>Available events </h1>
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
        render: function() {
            return (
                <div className="card" ref={this.props.event.id} onClick={this.registerToEvent}>
                    <div className="card-header">
                        <span>{this.props.event.name}</span>
                    </div>
                    <div className="card-body">
                        <ul>
                            <li>
                                Event date: {this.props.event.dateOfEvent}
                            </li>
                            <li>
                                Registration open: {this.props.event.registrationStartDate} - {this.props.event.registrationEndDate}
                            </li>
                        </ul>
                    </div>
                </div>
            );
        }
    });

    return IndexViewComponent;
});