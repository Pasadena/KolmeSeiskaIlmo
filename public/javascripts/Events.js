var EventSection = React.createClass({displayName: "EventSection",
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
                    React.createElement(EventForm, {formSubmitHandler: this.submitEventForm, availableCabins: this.state.cabins, handleDeleteSelectedCabin: this.handleDeleteSelectedCabin, addCabinHandler: this.handleAddCabinToEvent})
                ), 
                React.createElement("div", null, 
                    React.createElement(EventList, {data: this.state.events, deleteHandler: this.deleteListItem})
                )
            )
        )
    }

});

var EventForm = React.createClass({displayName: "EventForm",
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
        this.props.formSubmitHandler({name: eventName, description: eventDescription, dateOfEvent: eventDate, registrationStartDate: regStart, registrationEndDate: regEnd}, this.state.selectedCabins);

        this.refs.eventName.clear();
        this.refs.eventDescription.clear();
        this.refs.eventDate.clear();
        this.refs.regStart.clear();
        this.refs.regEnd.clear();
        this.setState({selectedCabins: []});
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
                    React.createElement(InputComponent, {type: "text", placeholder: "Insert event name", label: "Event name:", id: "nameField", ref: "eventName"}), 
                    React.createElement(TextAreaComponent, {placeholder: "Insert event description", label: "Event description:", id: "descriptionField", ref: "eventDescription"}), 
                    React.createElement(InputComponent, {type: "date", label: "Event date:", id: "dateField", ref: "eventDate"}), 
                    React.createElement(InputComponent, {type: "date", label: "Registration starts:", id: "startField", ref: "regStart"}), 
                    React.createElement(InputComponent, {type: "date", label: "Registration ends:", id: "endField", ref: "regEnd"})
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
                    React.createElement("input", {type: this.props.type, placeholder: this.props.placeholder, id: this.props.id, ref: this.props.ref}), 
                    React.createElement("span", {className: "help-block"}, this.props.help)
                )
            )
        )
    }
});

var TextAreaComponent = React.createClass({displayName: "TextAreaComponent",
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
                    React.createElement("textarea", {placeholder: this.props.placeholder, id: this.props.id}), 
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
            !this.props.data.length ? React.createElement(EmptyTable, null) :React.createElement(EventTable, {data: this.props.data, deleteHandler: this.props.deleteHandler})
        )
    }
});

var EventTable = React.createClass({displayName: "EventTable",
    render: function() {
        var deleteHandler = this.props.deleteHandler;
        var tableRows = this.props.data.map(function(event) {
            return (
                React.createElement(EventTableRow, {event: event, key: event.id, deleteHandler: deleteHandler})
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
    submitForm: function(event) {
        event.preventDefault();
        this.props.deleteHandler(this.props.event);
    },
    render: function() {
        return (
            React.createElement("tr", null, 
                React.createElement("td", null, this.props.event.name), 
                React.createElement("td", null, this.props.event.dateOfEvent), 
                React.createElement("td", null, this.props.event.registrationStartDate), 
                React.createElement("td", null, this.props.event.registrationEndDate), 
                React.createElement("td", null, 
                    React.createElement("form", {onSubmit: this.submitForm}, 
                        React.createElement(ButtonComponent, {type: "submit", value: "Delete event", class: "btn btn-danger"})
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