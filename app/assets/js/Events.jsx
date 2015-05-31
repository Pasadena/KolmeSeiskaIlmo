var EventSection = React.createClass({
    getInitialState: function() {
        return {events: [], message: '', messageClass: '', selectedEvent: null};
    },
    componentDidMount: function() {
        this.loadEvents();
    },
    loadEvents: function() {
        var eventRoute = '/admin/loadEvents';
        $.ajax({
            url: eventRoute,
            dataType: 'json',
            success: function(data) {
                this.setState({events: data['events'], selectedEvent: null});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(status, err.toString());
            }.bind(this)
        });
    },
    submitEventForm: function(eventData, selectedCabins) {
        var url = eventData.id != null ? ('/admin/events/' + eventData.id) : '/admin/events/';
        $.ajax({
            url: url,
            contentType: 'application/json',
            dataType: 'json',
            type: 'POST',
            data: JSON.stringify([eventData, selectedCabins]),
            success: function(data) {
                var existingEvents = this.state.events;
                if(eventData.id == null) {
                    existingEvents.push(data['event']);
                } else {
                    var updatedEventInList = _.find(existingEvents, function(event) { return event.id == eventData.id});
                    var existingEventIndex = existingEvents.indexOf(updatedEventInList);
                    existingEvents[existingEventIndex] = eventData;
                }
                this.setState({events: existingEvents, message: data['message'], messageClass: this.getStatusMessageClass(data), selectedEvent: null});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
    },
    deleteListItem: function(eventData) {
        var url = '/admin/events/delete/' +eventData.id;
        $.ajax({
            url: url,
            type: 'POST',
            success: function(data) {
                var messageClass = this.getStatusMessageClass(data);
                var existingEventsWithoutDeleted = _.filter(this.state.events, function(event) {return event.id != eventData.id});
                this.setState({events: existingEventsWithoutDeleted, message: data['message'], messageClass: messageClass});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(status, err.toString());
            }.bind(this)
        });
    },
    loadEvent: function(eventData) {
        var url = '/admin/events/' +eventData.id;
        $.ajax({
            url: url,
            dataType: 'json',
            success: function(data) {
                var selectedEvent = data['event'];
                selectedEvent.cabins = data['cabins']
                this.setState({selectedEvent: selectedEvent});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(status, err.toString());
            }.bind(this)
        });
    },
    getStatusMessageClass: function(messageData) {
        if(messageData['status'] == 'Ok') {
            return 'alert alert-success';
        }
        if(messageData['status'] == 'Error') {
            return 'alert alert-danger';
        }
        return '';
    },
    render: function() {
        return (
            <div className="panel panel-default">
                <div className={this.state.messageClass} role="alert">
                    {this.state.message}
                </div>
                <div className="panel-heading">
                    <h3 className="panel-title">Events</h3>
                </div>
                <div style={{padding: '10px'}}>
                    <EventForm event={this.state.selectedEvent} formSubmitHandler={this.submitEventForm}/>
                </div>
                <div>
                    <EventList data={this.state.events} deleteHandler={this.deleteListItem} editHandler={this.loadEvent}/>
                </div>
            </div>
        )
    }

});

var EventForm = React.createClass({
    getInitialState: function() {
        return { eventName: '',
                eventDescription: '',
                eventDate: '',
                regStart: '',
                regEnd: '',
                availableCabins: [],
                selectedCabins: []};
    },
    componentDidMount: function() {
        $.ajax({
            url: '/admin/cabins',
            dataType: 'json',
            success: function(data) {
                this.setState({availableCabins: data});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(status, err.toString());
            }.bind(this)
        });
    },
    componentWillReceiveProps: function(nextProps) {
        if(nextProps.event) {
            var editEvent = nextProps.event;
            var availableCabinMap = _.indexBy(this.state.availableCabins, "id");
            _.each(editEvent.cabins, function(eventCabin) {
                eventCabin.underlyingCabin = availableCabinMap[eventCabin.cabinId];
            });
            var selectedCabinIds = _.pluck(editEvent.cabins, 'cabinId');
            var unSelectedCabins = _.filter(this.state.availableCabins, function(cabin) {return !_.contains(selectedCabinIds, cabin.id);});
            this.setState({eventName: editEvent.name, eventDescription: editEvent.description, eventDate: editEvent.dateOfEvent, regStart: editEvent.registrationStartDate,
            regEnd: editEvent.registrationEndDate, availableCabins: unSelectedCabins, selectedCabins: editEvent.cabins});
        }
    },
    submitForm: function(event) {
        event.preventDefault();
        var eventName = this.refs.eventName.getValue();
        var eventDescription = this.refs.eventDescription.getValue();
        var eventDate = this.refs.eventDate.getValue();
        var regStart = this.refs.regStart.getValue();
        var regEnd = this.refs.regEnd.getValue();

        var eventId = this.props.event != null ? this.props.event.id : null;
        var eventCabins = [];
        for (index in this.state.selectedCabins) {
            var cabin = this.state.selectedCabins[index];
            var cabinAmount = parseInt(this.refs[cabin.cabinId].getValue(), 10);
            eventCabins.push({"cabinId": cabin.cabinId, "amount": cabinAmount, "eventId": eventId})
            this.state.availableCabins.push(cabin.underlyingCabin)
        }

        if(!eventName || !eventDate || !regStart || !regEnd) {
            return;
        }

        this.props.formSubmitHandler({id: eventId, name: eventName, description: eventDescription, dateOfEvent: eventDate, registrationStartDate: regStart, registrationEndDate: regEnd}, eventCabins);

        this.refs.eventName.clear();
        this.refs.eventDescription.clear();
        this.refs.eventDate.clear();
        this.refs.regStart.clear();
        this.refs.regEnd.clear();

        this.setState({ eventName: '', eventDescription: '', eventDate: '', regStart: '', regEnd: '', availableCabins: this.state.availableCabins, selectedCabins: []});
    },
    selectCabin: function(cabin) {
        var cabins =  this.state.selectedCabins;
        cabins.push({"cabinId": cabin.id, "underlyingCabin": cabin, eventId: -1});
        var availableCabinsWithoutSelected = _.filter(this.state.availableCabins, function(availableCabin) {
            return availableCabin.id != cabin.id;
        });
        this.setState({availableCabins: availableCabinsWithoutSelected, selectedCabins: cabins});
    },
    deleteCabin: function(cabin) {
        var selectedCabinsWithoutDeleted = _.filter(this.state.selectedCabins, function(selectedCabin) { return selectedCabin.cabinId != cabin.cabinId; });
        this.state.availableCabins.push(cabin.underlyingCabin)
        this.setState({availableCabins: this.state.availableCabins, selectedCabins: selectedCabinsWithoutDeleted});
    },
    render: function() {

        var cabinElements = this.state.availableCabins.map(function(cabin) {
            return (
                <li className="event-cabin-list-item" key={cabin.id}>
                    <span onClick={this.selectCabin.bind(null, cabin)}>{cabin.name} ({cabin.capacity} persons)</span>
                </li>
            );
        }, this);
        var selectedCabinElements = this.state.selectedCabins.map(function(cabin) {
            return (
                <SelectedCabinComponent cabin={cabin} deleteCabinHandler={this.deleteCabin} ref={cabin.cabinId} key={cabin.cabinId}/>
            );
        }, this);
        return (
            <form onSubmit={this.submitForm}>
                <fieldset>
                    <InputComponent type="text" placeholder="Insert event name" label="Event name:" id="nameField" ref="eventName" value={this.state.eventName}/>
                    <TextAreaComponent placeholder="Insert event description" label="Event description:" id="descriptionField" ref="eventDescription" value={this.state.eventDescription}/>
                    <InputComponent type="datepicker" label="Event date:" id="eventDate" ref="eventDate" value={this.state.eventDate}/>
                    <InputComponent type="datepicker" label="Registration starts:" id="startField" ref="regStart" value={this.state.regStart}/>
                    <InputComponent type="datepicker" label="Registration ends:" id="endField" ref="regEnd" value={this.state.regEnd}/>
                </fieldset>
                <h3>Event's cabins</h3>
                    <div className="event-cabin-list-container">
                        <div className='event-cabin-list-available'>
                            <h5>Available cabins</h5>
                            <ul>
                                {cabinElements}
                            </ul>
                        </div>
                        <div className="event-cabin-list-selected">
                            <h5>Selected cabins</h5>
                            {selectedCabinElements}
                        </div>
                    </div>
                <ButtonComponent type="submit" value="Save event" class="btn btn-success" />
            </form>
        )
    }
});

var SelectedCabinComponent = React.createClass({
    getInitialState: function() {
        return {amount: 0};
    },
    componentDidMount: function() {
        this.setState({amount: this.props.cabin.amount})
    },
    getValue: function() {
        return this.refs.amountField.getValue();
    },
    deleteCabin: function(cabin) {
        this.props.deleteCabinHandler(cabin);
    },
    render: function() {
        return (
            <div className="event-cabin-list-selected-item">
                <div className="event-cabin-list-selected-item-column">{this.props.cabin.underlyingCabin.name} ( {this.props.cabin.underlyingCabin.capacity} ) </div>
                <div className="event-cabin-list-selected-item-column"><InputComponent type="text" label="Amount:" id="cabinAmountField" value={this.state.amount} ref="amountField"/></div>
                <div className="event-cabin-list-selected-item-column"><span onClick={this.deleteCabin.bind(null, this.props.cabin)} > <span className="glyphicon glyphicon-remove" aria-hidden="true"/></span></div>
            </div>
        );
    }

});


var InputComponent = React.createClass({
    getInitialState: function() {
        return {value: ''};
    },
    componentDidMount: function() {
        if(this.props.type && this.props.type == 'datepicker') {
            var id = this.props.id;
            $('#' +id).datepicker({
                dateFormat: 'd.m.yy',
                onSelect: function(date) {
                    this.setState({value: date});
                }.bind(this)
            });
        }
    },
    componentWillReceiveProps: function(nextProps) {
        if(nextProps.value) {
            this.setState({value: nextProps.value});
        }
    },
    handleChange: function(event) {
        this.setState({value: event.target.value});
    },
    getValue: function() {
        return this.state.value;
    },
    clear: function() {
        this.setState(this.getInitialState());
    },
    render: function() {
        return (
            <div className="form-group">
                <label className="col-sm-2 control-label" htmlFor={this.props.id}>{this.props.label}</label>
                <div className="col-sm-10">
                    <input type={this.props.type} placeholder={this.props.placeholder} id={this.props.id} ref={this.props.ref} value={this.state.value} onChange={this.handleChange}/>
                    <span className="help-block">{this.props.help}</span>
                </div>
            </div>
        )
    }
});

var TextAreaComponent = React.createClass({
    getInitialState: function() {
        return {value: ''};
    },
    componentWillReceiveProps: function(nextProps) {
        if(nextProps.value) {
            this.setState({value: nextProps.value});
        }
    },
    handleChange: function(event) {
        this.setState({value: event.target.value});
    },
    getValue: function() {
        return this.state.value;
    },
    clear: function() {
        this.setState(this.getInitialState());
    },
    render: function() {
        return (
            <div className="form-group">
                <label className="col-sm-2 control-label" htmlFor={this.props.id}>{this.props.label}</label>
                <div className="col-sm-10">
                    <textarea placeholder={this.props.placeholder} id={this.props.id} onChange={this.handleChange} value={this.state.value} />
                    <span className="help-block">{this.props.help}</span>
                </div>
            </div>
        )
    }
});

var ButtonComponent = React.createClass({
    render: function() {
        return (
            <div className="form-group">
                <div className="col-sm-offset-2 col-sm-10">
                    <button type={this.props.type} className={this.props.class}>{this.props.value}</button>
                </div>
            </div>
        )
    }

});

var EventList = React.createClass({
    render: function() {
        return (
            !this.props.data.length ? <EmptyTable /> :<EventTable data ={this.props.data} deleteHandler={this.props.deleteHandler} editHandler={this.props.editHandler}/>
        )
    }
});

var EventTable = React.createClass({
    render: function() {
        var deleteHandler = this.props.deleteHandler;
        var editHandler = this.props.editHandler;
        var tableRows = this.props.data.map(function(event) {
            return (
                <EventTableRow event = {event} key={event.id} deleteHandler={deleteHandler} editHandler={editHandler}/>
            );
        });
        return (
            <table className="table table-condensed">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Date</th>
                        <th>Starts</th>
                        <th>Ends</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {tableRows}
                </tbody>
            </table>
        )
    }
});

var EventTableRow = React.createClass({
    deleteEvent: function(event) {
        event.preventDefault();
        this.props.deleteHandler(this.props.event);
    },
    editEvent: function(event) {
        event.preventDefault();
        this.props.editHandler(this.props.event)
    },
    render: function() {
        return (
            <tr>
                <td>{this.props.event.name}</td>
                <td>{this.props.event.dateOfEvent}</td>
                <td>{this.props.event.registrationStartDate}</td>
                <td>{this.props.event.registrationEndDate}</td>
                <td>
                    <div className="list-form">
                        <form onSubmit={this.deleteEvent}>
                            <ButtonComponent type="submit" value="Delete" class="btn btn-danger" />
                        </form>
                    </div>
                    <div className="list-form">
                        <form onSubmit={this.editEvent}>
                            <ButtonComponent type="submit" value="Edit" class="btn btn-default" />
                        </form>
                    </div>
                </td>
            </tr>
        )
    }
});


var EmptyTable = React.createClass({displayName: "EmptyTable",
    render: function() {
        return (
            <div>There are no events to display!</div>
        )
    }
});

React.render(<EventSection />, document.getElementById('events'))