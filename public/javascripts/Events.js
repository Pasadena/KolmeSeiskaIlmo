define(['react', 'jquery', 'components/FormComponents', 'store/EventStore', 'store/CabinStore', 'actions/EventActions', 'react-bootstrap', 'actions/CabinActions'],
function(React, $, FormComponents, EventStore, CabinStore, EventActions, RB, CabinActions) {

    var ButtonComponent = FormComponents.ButtonComponent;
    var InputComponent = FormComponents.InputComponent;
    var TextAreaComponent = FormComponents.TextAreaComponent;
    var Form = FormComponents.Form;
    var Input = FormComponents.InputWrapper;
    var DateField = FormComponents.DateInputWrapper;

    function getEventPageState() {
        var messageData = EventStore.getMessageData();
        return {
            events: EventStore.getEvents(),
            selectedEvent: EventStore.getSelectedEvent(),
            message: messageData.message,
            messageStatus: messageData.messageStatus,
            modalOpen: EventStore.getModalState(),
            availableCabins: CabinStore.getCabins()
        };
    }

    var EventSection = React.createClass({displayName: "EventSection",
        getInitialState: function() {
            return getEventPageState();
        },
        componentWillMount: function() {
            EventActions.loadEvents();
            CabinActions.fetchCabins();
        },
        componentDidMount: function() {
            EventStore.addChangeListener(this._onChange);
            CabinStore.addChangeListener(this._onChange);
        },
        componentWillUnmount: function() {
            EventStore.removeChangeListener(this._onChange);
            CabinStore.removeChangeListener(this._onChange);
        },
        _onChange: function() {
            this.setState(this.getInitialState());
        },
        submitEventForm: function(eventData, selectedCabins) {
            var url = eventData.id != null ? ('/admin/events/' + eventData.id) : '/admin/events/';
            EventActions.saveEvent({data: [eventData, selectedCabins], url: url});
            this.setState(this.getInitialState());
        },
        deleteListItem: function(eventData) {
            if(confirm('Delete event! Are you sure mate?')) {
                EventActions.deleteEvent(eventData.id);
            }
            {/**
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
            });**/}
        },
        loadEvent: function(eventData) {
            EventActions.loadEventData(eventData.id)
        },
        getStatusMessageClass: function() {
            if(this.state.messageStatus == 'Ok') {
                return 'alert alert-success';
            }
            if(this.state.messageStatus == 'Error') {
                return 'alert alert-danger';
            }
            return '';
        },
        createEvent: function(event) {
            event.preventDefault();
            this.setState({modalOpen: true});
        },
        closeDialog: function() {
            EventActions.closeDialog();
        },
        render: function() {
            return (
                React.createElement("div", null, 
                    React.createElement(RB.PageHeader, null, "Events:"), 
                    React.createElement("div", {className: this.getStatusMessageClass(), role: "alert"}, 
                        this.state.message
                    ), 
                    React.createElement(RB.Panel, {header: "Available events", bsStyle: "info"}, 
                        React.createElement(EventList, {data: this.state.events, deleteHandler: this.deleteListItem, editHandler: this.loadEvent}), 
                        React.createElement("a", {className: "btn btn-success", onClick: this.createEvent}, "Create a new event")
                    ), 
                    React.createElement(EventForm, {event: this.state.selectedEvent, formSubmitHandler: this.submitEventForm, show: this.state.modalOpen, closeDialog: this.closeDialog, cabins: this.state.availableCabins})
                )
            )
        }

    });

    var EventForm = React.createClass({displayName: "EventForm",
        getInitialState: function() {
            return { selectedEvent: {}, availableCabins: [], selectedCabins: []};
        },
        componentWillReceiveProps: function(nextProps) {
            if(nextProps.event) {
                this.setState({selectedEvent: nextProps.event, selectedCabins: nextProps.event.cabins, availableCabins: nextProps.cabins});
            } else {
                this.setState({selectedEvent: {}, selectedCabins: [], availableCabins: nextProps.cabins});
            }
        },
        submitForm: function(model) {
            var eventCabins = _.map(this.refs.cabinSelect.state.selectedCabins, function(cabin) {
                return {id: cabin.id, eventId: cabin.eventId, cabinId: cabin.cabin.id, amount: cabin.cabinCount};
            });
            var eventId = this.props.event ? this.props.event.id : null;
            model.id = eventId;

            this.props.formSubmitHandler(model, eventCabins);
            this.setState({selectedEvent: {}, availableCabins: this.state.availableCabins, selectedCabins: []});
        },
        dismiss: function() {
            this.props.close();
        },
        closeDialog: function(event) {
            event.preventDefault();
            this.props.closeDialog();
        },
        render: function() {
            var modalTitle = this.props.event ? "Edit event" : "Create event";
            return (
                React.createElement(RB.Modal, {onRequestHide: this.dismiss, onHide: this.dismiss, show: this.props.show, bsStyle: "primary", dialogClassName: "modal-large"}, 
                    React.createElement(Form, {onSubmit: this.submitForm, model: this.props.event}, 
                        React.createElement(RB.ModalHeader, null, 
                            React.createElement(RB.Modal.Title, null, modalTitle)
                        ), 
                        React.createElement(RB.Modal.Body, null, 
                            React.createElement(Input, {type: "text", name: "name", placeholder: "Insert event name", label: "Event name:", id: "nameField", errorMessage: "Name is mandatory", required: "true", labelClassName: "col-sm-3 control-label", wrapperClassName: "col-xs-6"}), 
                            React.createElement(Input, {type: "text", name: "description", placeholder: "Insert event description", label: "Event description:", id: "descriptionField", labelClassName: "col-sm-3 control-label", wrapperClassName: "col-xs-6"}), 
                            React.createElement(DateField, {type: "text", name: "dateOfEvent", label: "Event date:", id: "eventDate", errorMessage: "Event date is mandatory", required: "true", labelClassName: "col-sm-3 control-label", wrapperClassName: "col-xs-6"}), 
                            React.createElement(DateField, {type: "text", name: "registrationStartDate", label: "Registration starts:", id: "startField", errorMessage: "Start date is mandatory", required: "true", labelClassName: "col-sm-3 control-label", wrapperClassName: "col-xs-6"}), 
                            React.createElement(DateField, {type: "text", name: "registrationEndDate", label: "Registration ends:", id: "endField", errorMessage: "End date is mandatory", required: "true", labelClassName: "col-sm-3 control-label", wrapperClassName: "col-xs-6"}), 
                            React.createElement("h4", null, "Event's cabins"), 
                            React.createElement(EventCabinsView, {cabins: this.props.cabins, selectedCabins: this.state.selectedCabins, event: this.props.event, ref: "cabinSelect"})
                        ), 
                        React.createElement(RB.Modal.Footer, null, 
                            React.createElement(RB.ButtonGroup, null, 
                                React.createElement(RB.ButtonInput, {type: "submit", value: "Save event", className: "btn btn-success"}), 
                                React.createElement(RB.ButtonInput, {type: "button", value: "Cancel", className: "btn", onClick: this.closeDialog})
                            )
                        )
                    )
                )
            )
        }
    });

    var EventCabinsView = React.createClass({displayName: "EventCabinsView",
        getInitialState: function() {
            return {selectedCabins: []};
        },
        componentDidMount: function() {
            this.componentWillReceiveProps(this.props);
        },
        componentWillReceiveProps: function(nextProps) {
            this.setState({selectedCabins: nextProps.selectedCabins});
        },
        selectCabin: function(cabin, event) {
            var selectedCabins = this.state.selectedCabins;
            if(this._isCabinSelected(cabin)) {
                this.setState({selectedCabins: _.filter(selectedCabins, function(selectedCabin) { return selectedCabin.cabin.id != cabin.id })});
            } else {
                selectedCabins.push({id: null, eventId: (this.props.event ? this.props.event.id : null), cabin: cabin, cabinCount: 0});
                this.setState({selectedCabins: selectedCabins});
            }
        },
        _isCabinSelected: function(cabin) {
            var selectedCabinMatchingCabin = this._getSelectedCabin(cabin);
            return selectedCabinMatchingCabin ? true : false;
        },
        _getSelectedCabin: function(cabin) {
            return _.find(this.state.selectedCabins, function(selectedCabin) {
                return selectedCabin.cabin.id == cabin.id;
            });
        },
        updateValue: function(cabin, event) {
            var selectedCabin = this._getSelectedCabin(cabin);
            selectedCabin.cabinCount = parseInt(event.target.value, 10);
            this.setState({selectedCabins: this.state.selectedCabins});
        },
        render: function() {
            var cabinElements = this.props.cabins.map(function(cabin) {
                var selectedCabinMatchingCabin = this._getSelectedCabin(cabin);
                var cabinSelected = selectedCabinMatchingCabin ? true : false;
                return (
                    React.createElement("tr", {ref: cabin.id}, 
                        React.createElement("td", null, React.createElement(RB.Input, {type: "checkbox", value: cabin.id, checked: cabinSelected, onChange: this.selectCabin.bind(null, cabin)})), 
                        React.createElement("td", null, cabin.name, " (", cabin.capacity, " persons)"), 
                        React.createElement("td", null, React.createElement(RB.Input, {type: "text", value: cabinSelected ? selectedCabinMatchingCabin.cabinCount : null, disabled: !cabinSelected, onChange: this.updateValue.bind(null, cabin), wrapperClassName: "col-xs-4"}))
                    )
                );
            }, this);
            return (
                React.createElement(RB.Table, {style: {width: "80%", margin: "0 auto"}}, 
                    React.createElement("thead", null, 
                        React.createElement("tr", null, 
                            React.createElement("td", null, "#"), 
                            React.createElement("td", null, "Cabin"), 
                            React.createElement("td", null, "Amount")
                        )
                    ), 
                    React.createElement("tbody", null, 
                        cabinElements
                    )
                )
            );
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
                    React.createElement("tbody", null, 
                        tableRows
                    )
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
                        React.createElement("div", {className: "list-form"}, 
                            React.createElement("form", {onSubmit: this.deleteEvent}, 
                                React.createElement(ButtonComponent, {type: "submit", value: "Delete", class: "btn btn-danger"})
                            )
                        ), 
                        React.createElement("div", {className: "list-form"}, 
                            React.createElement("form", {onSubmit: this.editEvent}, 
                                React.createElement(ButtonComponent, {type: "submit", value: "Edit", class: "btn btn-default"})
                            )
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

    return EventSection;
});