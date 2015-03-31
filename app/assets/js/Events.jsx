var EventSection = React.createClass({
    getInitialState: function() {
        return {events: [], message: '', messageClass: '', cabins: []};
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
    submitEventForm: function(eventData) {
        $.ajax({
            url: '/admin/events/',
            contentType: 'application/json',
            dataType: 'json',
            type: 'POST',
            data: JSON.stringify(eventData),
            success: function(data) {
                this.setStatusMessage(data);
                this.loadEvents();
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
    },
    deleteListItem: function(eventData) {
        var url = '/admin/events/' +eventData.id;
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
    setStatusMessage: function(messageData) {
        if(messageData['status'] == 'Ok') {
            this.setState({messageClass: 'alert alert-success'});
        }
        if(messageData['status'] == 'Error') {
            this.setState({messageClass: 'alert alert-danger'});
        }
        this.setState({message: messageData['message']});
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
                    <EventForm formSubmitHandler={this.submitEventForm} availableCabins={this.state.cabins} />
                </div>
                <div>
                    <EventList data={this.state.events} deleteHandler={this.deleteListItem} />
                </div>
            </div>
        )
    }

});

var EventForm = React.createClass({
    getInitialState: function() {
        return {selectedCabins: []};
    },
    submitForm: function(event) {
        event.preventDefault();
        var eventName = this.refs.eventName.getValue();
        var eventDescription = this.refs.eventDescription.getValue();
        var eventDate = this.refs.eventDate.getValue();
        var regStart = this.refs.regStart.getValue();
        var regEnd = this.refs.regEnd.getValue();

        if(!eventName || !eventDescription || !eventDate || !regStart || !regEnd) {
            return;
        }
        this.props.formSubmitHandler({name: eventName, description: eventDescription, dateOfEvent: eventDate, registrationStartDate: regStart, registrationEndDate: regEnd});

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
                <li className="event-cabin-list-item" key={cabin.id}>
                    <div style={{width: '50%'}}>{cabin.name} ( {cabin.capacity} ) </div>
                    <div style={{width: '50%'}}><InputComponent type="text" label="Amount:" id="nameField"/></div>
                </li>
            );
        });
        return (
            <form onSubmit={this.submitForm}>
                <fieldset>
                    <InputComponent type="text" placeholder="Insert event name" label="Event name:" id="nameField" ref="eventName"/>
                    <TextAreaComponent placeholder="Insert event description" label="Event description:" id="descriptionField" ref="eventDescription"/>
                    <InputComponent type="date" label="Event date:" id="dateField" ref="eventDate"/>
                    <InputComponent type="date" label="Registration starts:" id="startField" ref="regStart"/>
                    <InputComponent type="date" label="Registration ends:" id="endField" ref="regEnd"/>
                </fieldset>
                <h3>Event's cabins</h3>
                    <fieldset>
                        <div className='event-cabin-list'>
                            <h5>Available cabins</h5>
                            <ul>
                                {cabinElements}
                            </ul>
                        </div>
                        <div className='event-cabin-list'>
                            <h5>Selected cabins</h5>
                            <ul>
                                {selectedCabinElements}
                            </ul>
                        </div>
                    </fieldset>
                <ButtonComponent type="submit" value="Save event" class="btn btn-success" />
            </form>
        )
    }

});

var InputComponent = React.createClass({
    getValue: function() {
        return this.getDOMNode().querySelector('input').value;
    },
    clear: function() {
        this.getDOMNode().querySelector('input').value='';
    },
    render: function() {
        return (
            <div className="form-group">
                <label className="col-sm-2 control-label" htmlFor={this.props.id}>{this.props.label}</label>
                <div className="col-sm-10">
                    <input type={this.props.type} placeholder={this.props.placeholder} id={this.props.id} ref={this.props.ref}/>
                    <span className="help-block">{this.props.help}</span>
                </div>
            </div>
        )
    }
});

var TextAreaComponent = React.createClass({
    getValue: function() {
        return this.getDOMNode().querySelector('textarea').value;
    },
    clear: function() {
        this.getDOMNode().querySelector('textarea').value = '';
    },
    render: function() {
        return (
            <div className="form-group">
                <label className="col-sm-2 control-label" htmlFor={this.props.id}>{this.props.label}</label>
                <div className="col-sm-10">
                    <textarea placeholder={this.props.placeholder} id={this.props.id} />
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
            !this.props.data.length ? <EmptyTable /> :<EventTable data ={this.props.data} deleteHandler={this.props.deleteHandler}/>
        )
    }
});

var EventTable = React.createClass({
    render: function() {
        var deleteHandler = this.props.deleteHandler;
        var tableRows = this.props.data.map(function(event) {
            return (
                <EventTableRow event = {event} key={event.id} deleteHandler={deleteHandler}/>
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
    submitForm: function(event) {
        event.preventDefault();
        this.props.deleteHandler(this.props.event);
    },
    render: function() {
        return (
            <tr>
                <td>{this.props.event.name}</td>
                <td>{this.props.event.dateOfEvent}</td>
                <td>{this.props.event.registrationStartDate}</td>
                <td>{this.props.event.registrationEndDate}</td>
                <td>
                    <form onSubmit={this.submitForm}>
                        <ButtonComponent type="submit" value="Delete event" class="btn btn-danger" />
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