define(['react', 'react-router'], function(React, Router) {

    var IndexViewComponent = React.createClass({
        getInitialState: function() {
            return {events: []};
        },
        componentDidMount: function() {
            var eventRoute = '/admin/loadEvents';
            $.ajax({
                url: eventRoute,
                dataType: 'json',
                success: function(data) {
                    this.setState({events: data['events']});
                }.bind(this),
                error: function(xhr, status, err) {
                    console.error(status, err.toString());
                }.bind(this)
            });
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