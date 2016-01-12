define(['react', 'react-router', 'store/EventStore', 'actions/EventActions'], function(React, Router, EventStore, EventActions) {

    function getIndexPageState() {
        return {
            events: EventStore.getEvents(),
            selectedEvent: null
        };
    }

    var IndexViewComponent = React.createClass({displayName: "IndexViewComponent",
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
                    React.createElement(AvailableEventCard, {event: event, ref: event.id, key: event.id})
                );
            });
            var eventList = !this.state.events.length ? React.createElement("div", null, "There are no events to display!") : eventComponents;
            return (
                React.createElement("section", null, 
                    React.createElement("hgroup", null, 
                        React.createElement("h2", null, "Avoimet ilmoittautumiset: ")
                    ), 
                    React.createElement("div", null, 
                        eventList
                    )
                )
            );
        }
    });

    var AvailableEventCard = React.createClass({displayName: "AvailableEventCard",
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
                React.createElement("div", {className: cardClasses, ref: this.props.event.id, onClick: this.registerToEvent, title: tooltip}, 
                    React.createElement("div", {className: "card-header"}, 
                        React.createElement("span", null, this.props.event.name)
                    ), 
                    React.createElement("div", {className: "card-body"}, 
                        React.createElement("ul", null, 
                            React.createElement("li", null, 
                                "Päivä: ", this.props.event.dateOfEvent
                            ), 
                            React.createElement("li", null, 
                                "Ilmoittautumisaika ", this.props.event.registrationStartDate, " - ", this.props.event.registrationEndDate
                            )
                        )
                    )
                )
            );
        }
    });

    return IndexViewComponent;
});