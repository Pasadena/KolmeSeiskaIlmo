var EventSection = React.createClass({displayName: "EventSection",
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
            React.createElement("div", null, 
                React.createElement(EventForm, {formSubmitHandler: this.submitEventForm}), 
                React.createElement(EventList, {data: this.state.data})
            )
        )
    }

});

var EventForm = React.createClass({displayName: "EventForm",
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
            React.createElement("form", {onSubmit: this.submitForm}, 
                React.createElement(InputComponent, {type: "text", placeholder: "Insert event name", label: "Event name:", id: "nameField", ref: "eventName"}), 
                React.createElement(TextAreaComponent, {placeholder: "Insert event description", label: "Event description:", id: "descriptionField", ref: "eventDescription"}), 
                React.createElement(InputComponent, {type: "date", label: "Event date:", id: "dateField", ref: "eventDate"}), 
                React.createElement(InputComponent, {type: "date", label: "Registration starts:", id: "startField", ref: "regStart"}), 
                React.createElement(InputComponent, {type: "date", label: "Registration ends:", id: "endField", ref: "regEnd"}), 
                React.createElement(ButtonComponent, {type: "submit", value: "Save event", class: "btn btn-success"})
            )
        )
    }

});

var InputComponent = React.createClass({displayName: "InputComponent",
    getValue: function() {
        return this.getDOMNode().querySelector('input').value;
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
            !this.props.data.length ? React.createElement(EmptyTable, null) :React.createElement(EventTable, {data: this.props.data})
        )
    }
});

var EventTable = React.createClass({displayName: "EventTable",
    render: function() {
        return (
            React.createElement("table", {className: "table table-hover"}, 
                React.createElement("th", null, 
                    React.createElement("td", null, "Name"), 
                    React.createElement("td", null, "Date"), 
                    React.createElement("td", null, "Starts"), 
                    React.createElement("td", null, "Ends")
                ), 
                "this.props.data.map(function(event) ", 
                    React.createElement(EventTableRow, {event: event}), 
                ");"
            )
        )
    }
});

var EventTableRow = React.createClass({displayName: "EventTableRow",
    render: function() {
        return (
            React.createElement("tr", null, 
                React.createElement("td", null, "this.props.event.name"), 
                React.createElement("td", null, "this.props.event.eventDate"), 
                React.createElement("td", null, "this.props.event.registrationStarts"), 
                React.createElement("td", null, "this.props.event.registrationEnds")
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