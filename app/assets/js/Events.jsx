var EventSection = React.createClass({
    getInitialState: function() {
        return {events: [], message: '', messageClass: '', cabins: [], selectedEvent: null};
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
                this.setState({events: data['events'], cabins: data['cabins']});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(status, err.toString());
            }.bind(this)
        });
    },
    submitEventForm: function(eventData, selectedCabins) {
        $.ajax({
            url: '/admin/events/',
            contentType: 'application/json',
            dataType: 'json',
            type: 'POST',
            data: JSON.stringify([eventData, selectedCabins]),
            success: function(data) {
                this.setStatusMessage(data);
                var existingEvents = this.state.events
                existingEvents.push(data['event']);
                this.setState({events: existingEvents});
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
                this.setStatusMessage(data);
                this.loadEvents();
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
                this.setState({selectedEvent: data});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(status, err.toString());
            }.bind(this)
        });
    },
    setStatusMessage: function(messageData) {
        if(messageData['status'] == 'Ok') {
            this.setState({messageClass: 'alert alert-success'});
        }
        if(messageData['status'] == 'Error') {
            this.setState({messageClass: 'alert alert-danger'});
        }
        this.setState({message: messageData['message']});
    },
    handleDeleteSelectedCabin: function(cabin) {
        var availableCabins = this.state.cabins
        availableCabins.push(cabin);
        this.setState({cabins: availableCabins});
    },
    handleAddCabinToEvent: function(cabin) {
        var availableCabins = this.state.cabins.filter(function(item) { return item.id != cabin.id });
        this.setState({cabins: availableCabins});
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
                    <EventForm event={this.state.selectedEvent} formSubmitHandler={this.submitEventForm} availableCabins={this.state.cabins} handleDeleteSelectedCabin={this.handleDeleteSelectedCabin} addCabinHandler={this.handleAddCabinToEvent}/>
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
        return {
        eventName: '',
        eventDescription: '',
        eventDate: '',
        regStart: '',
        regEnd: '',
        selectedCabins: []};
    },
    componentWillReceiveProps: function(nextProps) {
        if(nextProps.event) {
            var editEvent = nextProps.event;
            this.setState({eventName: editEvent.name, eventDescription: editEvent.description, eventDate: editEvent.dateOfEvent, regStart: editEvent.registrationStartDate,
            regEnd: editEvent.registrationEndDate});
        }
    },
    submitForm: function(event) {
        event.preventDefault();
        var eventName = this.refs.eventName.getValue();
        var eventDescription = this.refs.eventDescription.getValue();
        var eventDate = this.refs.eventDate.getValue();
        var regStart = this.refs.regStart.getValue();
        var regEnd = this.refs.regEnd.getValue();

        if(!eventName || !eventDate || !regStart || !regEnd) {
            return;
        }
        this.props.formSubmitHandler({name: eventName, description: eventDescription, dateOfEvent: eventDate, registrationStartDate: regStart, registrationEndDate: regEnd}, this.state.selectedCabins);

        this.refs.eventName.clear();
        this.refs.eventDescription.clear();
        this.refs.eventDate.clear();
        this.refs.regStart.clear();
        this.refs.regEnd.clear();

        return
    },
    selectCabin: function(cabin) {
        var cabins =  this.state.selectedCabins;
        cabins.push(cabin);
        this.setState({selectedCabins: cabins});
        this.props.addCabinHandler(cabin);
    },
    deleteCabin: function(cabin) {
        var cabinIndex = this.state.selectedCabins.indexOf(cabin);
        this.state.selectedCabins.splice(cabinIndex, 1);
        this.props.handleDeleteSelectedCabin(cabin);
    },
    render: function() {

        var cabinElements = this.props.availableCabins.map(function(cabin) {
            return (
                <li className="event-cabin-list-item" key={cabin.id}>
                    <span onClick={this.selectCabin.bind(null, cabin)}>{cabin.name} ({cabin.capacity} persons)</span>
                </li>
            );
        }, this);
        var selectedCabinElements = this.state.selectedCabins.map(function(cabin) {
            return (
                <div className="event-cabin-list-selected-item" key={cabin.id}>
                    <div className="event-cabin-list-selected-item-column">{cabin.name} ( {cabin.capacity} ) </div>
                    <div className="event-cabin-list-selected-item-column"><InputComponent type="text" label="Amount:" id="nameField"/></div>
                    <div className="event-cabin-list-selected-item-column"><span onClick={this.deleteCabin.bind(null, cabin)} > <i className="glyphicon glyphicon-remove"/></span></div>
                </div>
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
                {tableRows}
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
                    <form onSubmit={this.deleteEvent}>
                        <ButtonComponent type="submit" value="Delete" class="btn btn-danger" />
                    </form>
                    <form onSubmit={this.editEvent}>
                        <ButtonComponent type="submit" value="Edit" class="btn btn-default" />
                    </form>
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