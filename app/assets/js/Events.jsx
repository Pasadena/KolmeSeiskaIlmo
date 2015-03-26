var EventSection = React.createClass({
    getInitialState: function() {
        return {data: []};
    },
    componentDidMount: function() {
        var eventRoute = '/admin/loadEvents';
        $.ajax({
            url: eventRoute,
            dataType: 'json',
            success: function(data) {
                this.setState({data: data});
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
                this.setState({data: data});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
    },
    render: function() {
        return (
            <div>
                <EventForm formSubmitHandler={this.submitEventForm} />
                <EventList data={this.state.data} />
            </div>
        )
    }

});

var EventForm = React.createClass({
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
        return
    },
    render: function() {
        return (
            <form onSubmit={this.submitForm}>
                <InputComponent type="text" placeholder="Insert event name" label="Event name:" id="nameField" ref="eventName"/>
                <TextAreaComponent placeholder="Insert event description" label="Event description:" id="descriptionField" ref="eventDescription"/>
                <InputComponent type="date" label="Event date:" id="dateField" ref="eventDate"/>
                <InputComponent type="date" label="Registration starts:" id="startField" ref="regStart"/>
                <InputComponent type="date" label="Registration ends:" id="endField" ref="regEnd"/>
                <ButtonComponent type="submit" value="Save event" class="btn btn-success" />
            </form>
        )
    }

});

var InputComponent = React.createClass({
    getValue: function() {
        return this.getDOMNode().querySelector('input').value;
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
            !this.props.data.length ? <EmptyTable /> :<EventTable data ={this.props.data} />
        )
    }
});

var EventTable = React.createClass({
    render: function() {
        return (
            <table className="table table-hover">
                <th>
                    <td>Name</td>
                    <td>Date</td>
                    <td>Starts</td>
                    <td>Ends</td>
                </th>
                this.props.data.map(function(event) {
                    <EventTableRow event = {event}/>
                });
            </table>
        )
    }
});

var EventTableRow = React.createClass({
    render: function() {
        return (
            <tr>
                <td>this.props.event.name</td>
                <td>this.props.event.eventDate</td>
                <td>this.props.event.registrationStarts</td>
                <td>this.props.event.registrationEnds</td>
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