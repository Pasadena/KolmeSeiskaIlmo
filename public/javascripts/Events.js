var EventSection = React.createClass({displayName: "EventSection",
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
                this.loadEvents();
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
            React.createElement("div", {className: "panel panel-default"}, 
                React.createElement("div", {className: this.state.messageClass, role: "alert"}, 
                    this.state.message
                ), 
                React.createElement("div", {className: "panel-heading"}, 
                    React.createElement("h3", {className: "panel-title"}, "Events")
                ), 
                React.createElement("div", {style: {padding: '10px'}}, 
                    React.createElement(EventForm, {event: this.state.selectedEvent, formSubmitHandler: this.submitEventForm, availableCabins: this.state.cabins, handleDeleteSelectedCabin: this.handleDeleteSelectedCabin, addCabinHandler: this.handleAddCabinToEvent})
                ), 
                React.createElement("div", null, 
                    React.createElement(EventList, {data: this.state.events, deleteHandler: this.deleteListItem, editHandler: this.loadEvent})
                )
            )
        )
    }

});

var EventForm = React.createClass({displayName: "EventForm",
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

        this.setState(this.getInitialState());
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
                React.createElement("li", {className: "event-cabin-list-item", key: cabin.id}, 
                    React.createElement("span", {onClick: this.selectCabin.bind(null, cabin)}, cabin.name, " (", cabin.capacity, " persons)")
                )
            );
        }, this);
        var selectedCabinElements = this.state.selectedCabins.map(function(cabin) {
            return (
                React.createElement("div", {className: "event-cabin-list-selected-item", key: cabin.id}, 
                    React.createElement("div", {className: "event-cabin-list-selected-item-column"}, cabin.name, " ( ", cabin.capacity, " ) "), 
                    React.createElement("div", {className: "event-cabin-list-selected-item-column"}, React.createElement(InputComponent, {type: "text", label: "Amount:", id: "nameField"})), 
                    React.createElement("div", {className: "event-cabin-list-selected-item-column"}, React.createElement("span", {onClick: this.deleteCabin.bind(null, cabin)}, " ", React.createElement("i", {className: "glyphicon glyphicon-remove"})))
                )
            );
        }, this);
        return (
            React.createElement("form", {onSubmit: this.submitForm}, 
                React.createElement("fieldset", null, 
                    React.createElement(InputComponent, {type: "text", placeholder: "Insert event name", label: "Event name:", id: "nameField", ref: "eventName", value: this.state.eventName}), 
                    React.createElement(TextAreaComponent, {placeholder: "Insert event description", label: "Event description:", id: "descriptionField", ref: "eventDescription", value: this.state.eventDescription}), 
                    React.createElement(InputComponent, {type: "datepicker", label: "Event date:", id: "eventDate", ref: "eventDate", value: this.state.eventDate}), 
                    React.createElement(InputComponent, {type: "datepicker", label: "Registration starts:", id: "startField", ref: "regStart", value: this.state.regStart}), 
                    React.createElement(InputComponent, {type: "datepicker", label: "Registration ends:", id: "endField", ref: "regEnd", value: this.state.regEnd})
                ), 
                React.createElement("h3", null, "Event's cabins"), 
                    React.createElement("div", {className: "event-cabin-list-container"}, 
                        React.createElement("div", {className: "event-cabin-list-available"}, 
                            React.createElement("h5", null, "Available cabins"), 
                            React.createElement("ul", null, 
                                cabinElements
                            )
                        ), 
                        React.createElement("div", {className: "event-cabin-list-selected"}, 
                            React.createElement("h5", null, "Selected cabins"), 
                            selectedCabinElements
                        )
                    ), 
                React.createElement(ButtonComponent, {type: "submit", value: "Save event", class: "btn btn-success"})
            )
        )
    }

});

var InputComponent = React.createClass({displayName: "InputComponent",
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
        return this.getDOMNode().querySelector('input').value;
    },
    clear: function() {
        this.getDOMNode().querySelector('input').value='';
    },
    render: function() {
        return (
            React.createElement("div", {className: "form-group"}, 
                React.createElement("label", {className: "col-sm-2 control-label", htmlFor: this.props.id}, this.props.label), 
                React.createElement("div", {className: "col-sm-10"}, 
                    React.createElement("input", {type: this.props.type, placeholder: this.props.placeholder, id: this.props.id, ref: this.props.ref, value: this.state.value, onChange: this.handleChange}), 
                    React.createElement("span", {className: "help-block"}, this.props.help)
                )
            )
        )
    }
});

var TextAreaComponent = React.createClass({displayName: "TextAreaComponent",
    getInitialState: function() {
        return {value: ''};
    },
    handleChange: function(event) {
        this.setState({value: event.target.value});
    },
    getValue: function() {
        return this.getDOMNode().querySelector('textarea').value;
    },
    clear: function() {
        this.getDOMNode().querySelector('textarea').value = '';
    },
    render: function() {
        return (
            React.createElement("div", {className: "form-group"}, 
                React.createElement("label", {className: "col-sm-2 control-label", htmlFor: this.props.id}, this.props.label), 
                React.createElement("div", {className: "col-sm-10"}, 
                    React.createElement("textarea", {placeholder: this.props.placeholder, id: this.props.id, onChange: this.handleChange, value: this.state.value}), 
                    React.createElement("span", {className: "help-block"}, this.props.help)
                )
            )
        )
    }
});

var ButtonComponent = React.createClass({displayName: "ButtonComponent",
    render: function() {
        return (
            React.createElement("div", {className: "form-group"}, 
                React.createElement("div", {className: "col-sm-offset-2 col-sm-10"}, 
                    React.createElement("button", {type: this.props.type, className: this.props.class}, this.props.value)
                )
            )
        )
    }

});

var EventList = React.createClass({displayName: "EventList",
    render: function() {
        return (
            !this.props.data.length ? React.createElement(EmptyTable, null) :React.createElement(EventTable, {data: this.props.data, deleteHandler: this.props.deleteHandler, editHandler: this.props.editHandler})
        )
    }
});

var EventTable = React.createClass({displayName: "EventTable",
    render: function() {
        var deleteHandler = this.props.deleteHandler;
        var editHandler = this.props.editHandler;
        var tableRows = this.props.data.map(function(event) {
            return (
                React.createElement(EventTableRow, {event: event, key: event.id, deleteHandler: deleteHandler, editHandler: editHandler})
            );
        });
        return (
            React.createElement("table", {className: "table table-condensed"}, 
                React.createElement("thead", null, 
                    React.createElement("tr", null, 
                        React.createElement("th", null, "Name"), 
                        React.createElement("th", null, "Date"), 
                        React.createElement("th", null, "Starts"), 
                        React.createElement("th", null, "Ends"), 
                        React.createElement("th", null)
                    )
                ), 
                tableRows
            )
        )
    }
});

var EventTableRow = React.createClass({displayName: "EventTableRow",
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
            React.createElement("tr", null, 
                React.createElement("td", null, this.props.event.name), 
                React.createElement("td", null, this.props.event.dateOfEvent), 
                React.createElement("td", null, this.props.event.registrationStartDate), 
                React.createElement("td", null, this.props.event.registrationEndDate), 
                React.createElement("td", null, 
                    React.createElement("form", {onSubmit: this.deleteEvent}, 
                        React.createElement(ButtonComponent, {type: "submit", value: "Delete", class: "btn btn-danger"})
                    ), 
                    React.createElement("form", {onSubmit: this.editEvent}, 
                        React.createElement(ButtonComponent, {type: "submit", value: "Edit", class: "btn btn-default"})
                    )
                )
            )
        )
    }
});


var EmptyTable = React.createClass({displayName: "EmptyTable",
    render: function() {
        return (
            React.createElement("div", null, "There are no events to display!")
        )
    }
});

React.render(React.createElement(EventSection, null), document.getElementById('events'))