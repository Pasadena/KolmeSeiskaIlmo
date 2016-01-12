define(['react', 'react-router', 'jquery', 'components/FormComponents', 'store/EventStore', 'store/CabinStore', 'store/RegistrationStore', 'actions/EventActions', 'react-bootstrap', 'actions/CabinActions', 'actions/RegistrationActions'],
function(React, Router, $, FormComponents, EventStore, CabinStore, RegistrationStore, EventActions, RB, CabinActions, RegistrationActions) {

    var ButtonComponent = FormComponents.ButtonComponent;
    var InputComponent = FormComponents.InputComponent;
    var TextAreaComponent = FormComponents.TextAreaComponent;
    var Form = FormComponents.Form;
    var Input = FormComponents.InputWrapper;
    var DateField = FormComponents.DateInputWrapper;
    var Button = RB.Button;

    function getEventPageState() {
        var messageData = EventStore.getMessageData();
        return {
            events: EventStore.getEvents(),
            selectedEvent: EventStore.getSelectedEvent(),
            message: messageData.message,
            messageStatus: messageData.messageStatus,
            modalOpen: EventStore.getModalState(),
            availableCabins: CabinStore.getCabins(),
            registrationList: RegistrationStore.getEventRegistrations(),
            viewRegistrationsModalOpen: RegistrationStore.getRegistrationListModalStatus()
        };
    }

    var EventSection = React.createClass({displayName: "EventSection",
        mixins: [Router.Navigation],
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
            RegistrationStore.addChangeListener(this._onChange);
        },
        componentWillUnmount: function() {
            EventStore.removeChangeListener(this._onChange);
            CabinStore.removeChangeListener(this._onChange);
            RegistrationStore.removeChangeListener(this._onChange);
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
        closeRegistrationListDialog: function() {
            RegistrationActions.closeRegistrationListDialog();
        },
        viewEventRegistrations: function(event) {
            RegistrationActions.getEventRegistrationList(event.id);
        },
        backToIndex: function(event) {
            event.preventDefault();
            window.location.href="/admin";
            {/*this.transitionTo("/admin");*/}
        },
        render: function() {
            return (
                React.createElement("div", null, 
                    React.createElement(RB.PageHeader, null, 
                        React.createElement("span", {style: {'marginRight': '20px'}}, "Events"), 
                        React.createElement(Button, {bsStyle: "primary", onClick: this.backToIndex}, "Back")
                    ), 
                    React.createElement("div", {className: this.getStatusMessageClass(), role: "alert"}, 
                        this.state.message
                    ), 
                    React.createElement(RB.Panel, {header: "Available events", bsStyle: "info"}, 
                        React.createElement(EventList, {data: this.state.events, deleteHandler: this.deleteListItem, editHandler: this.loadEvent, viewRegistrationDataHandler: this.viewEventRegistrations}), 
                        React.createElement("a", {className: "btn btn-success", onClick: this.createEvent}, "Create a new event")
                    ), 
                    React.createElement(EventForm, {event: this.state.selectedEvent, formSubmitHandler: this.submitEventForm, show: this.state.modalOpen, closeDialog: this.closeDialog, cabins: this.state.availableCabins}), 
                    React.createElement(EventRegistrationList, {show: this.state.viewRegistrationsModalOpen, close: this.closeRegistrationListDialog, registrations: this.state.registrationList})
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
                            React.createElement(Input, {type: "textarea", name: "description", placeholder: "Insert event description", label: "Event description:", id: "descriptionField", labelClassName: "col-sm-3 control-label", wrapperClassName: "col-xs-6"}), 
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
                !this.props.data.length ? React.createElement(EmptyTable, null) :React.createElement(EventTable, {data: this.props.data, deleteHandler: this.props.deleteHandler, editHandler: this.props.editHandler, 
                viewRegistrationDataHandler: this.props.viewRegistrationDataHandler})
            )
        }
    });

    var EventTable = React.createClass({displayName: "EventTable",
        render: function() {
            var deleteHandler = this.props.deleteHandler;
            var editHandler = this.props.editHandler;
            var tableRows = this.props.data.map(function(event) {
                return (
                    React.createElement(EventTableRow, {event: event, key: event.id, deleteHandler: deleteHandler, editHandler: editHandler, viewRegistrationDataHandler: this.props.viewRegistrationDataHandler})
                );
            }, this);
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
        viewRegistrationData: function(event) {
            event.preventDefault();
            this.props.viewRegistrationDataHandler(this.props.event);
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
                                React.createElement(RB.ButtonInput, {type: "submit", value: "Delete", className: "btn btn-danger"})
                            )
                        ), 
                        React.createElement("div", {className: "list-form"}, 
                            React.createElement("form", {onSubmit: this.editEvent}, 
                                React.createElement(RB.ButtonInput, {type: "submit", value: "Edit", className: "btn btn-primary"})
                            )
                        ), 
                        React.createElement("div", {className: "list-form"}, 
                            React.createElement("form", null, 
                                React.createElement(RB.ButtonToolbar, null, 
                                React.createElement(RB.Button, {type: "button", value: "View registrations", className: "btn btn-primary", onClick: this.viewRegistrationData}, "View registrations")
                                )
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

    var EventRegistrationList = React.createClass({displayName: "EventRegistrationList",
        closeDialog: function(event) {
            event.preventDefault();
            this.dismiss();
        },
        dismiss: function() {
            this.props.close();
        },
        render: function() {
            var registrationItems = this.props.registrations.map(function(registration) {
                return (
                    React.createElement(EventRegistrationRow, {key: 'registration ' +registration.registration.id, registration: registration})
                );
            }, this);
            return (
                React.createElement(RB.Modal, {onRequestHide: this.dismiss, onHide: this.dismiss, show: this.props.show, bsStyle: "primary", dialogClassName: "modal-large"}, 
                    React.createElement(RB.ModalHeader, null, 
                        React.createElement(RB.Modal.Title, null, "View registrations")
                    ), 
                    React.createElement(RB.Modal.Body, null, 
                        React.createElement("ul", null, 
                            registrationItems
                        )
                    ), 
                    React.createElement(RB.ModalFooter, null, 
                        React.createElement(RB.ButtonInput, {type: "button", value: "Cancel", className: "btn", onClick: this.closeDialog})
                    )
                )
            );
        }
    });

    var EventRegistrationRow = React.createClass({displayName: "EventRegistrationRow",
        getInitialState: function() {
            return {expanded: false};
        },
        getResponsiblePerson: function(registration) {
            return _.find(registration.persons, function(person) {
                return person.contactPerson == 1;
            });
        },
        viewPersons: function() {
            this.setState({expanded: !this.state.expanded});
        },
        render: function() {
            var registrationData = this.props.registration;
            var responsiblePerson = this.getResponsiblePerson(registrationData);
            var timeStampDate = new Date(registrationData.registration.timestamp);
            var personInfoRows = (!this.state.expanded ? [] :  registrationData.persons).map(function(person, order) {
                return (
                    React.createElement(EventRegistrationPersonListRow, {key: 'person ' +person.id, person: person, order: (order +1)})
                );
            });
            var arrowClass = this.state.expanded ? "glyphicon glyphicon-arrow-down" : "glyphicon glyphicon-arrow-right";
            return (
                React.createElement("li", {key: registrationData.registration.id, style: {listStyle: 'none'}}, 
                    React.createElement("div", {style: {display: 'flex', flexDirection: 'row', borderBottom: '1px solid black'}}, 
                       React.createElement("div", {style: {flex: '0.1 1 auto'}}, 
                            React.createElement("span", {className: arrowClass, onClick: this.viewPersons, style: {cursor: 'pointer'}})
                        ), 
                        React.createElement("div", {style: {flex: '1 1 auto', width: '45%'}}, 
                            React.createElement("span", {style: {fontWeight: 'bold'}}, "Responsible person:"), " ", responsiblePerson.firstName + ' ' + responsiblePerson.lastName
                        ), 
                        React.createElement("div", {style: {flex: '1 1 auto', width: '15%'}}, 
                            React.createElement("span", {style: {fontWeight: 'bold'}}, "Cabin:"), " ", registrationData.cabin.name
                        ), 
                        React.createElement("div", {style: {flex: '1 1 auto', width: '40%'}}, 
                            React.createElement("span", {style: {fontWeight: 'bold'}}, "Registration time:"), " ", timeStampDate.toLocaleDateString() + ' ' + timeStampDate.toLocaleTimeString()
                        )
                    ), 
                    React.createElement("div", null, 
                    React.createElement("ul", {style: {paddingLeft: '10px'}}, 
                        personInfoRows
                    )
                    )
                )
            );
        }
    });

    var EventRegistrationPersonListRow = React.createClass({displayName: "EventRegistrationPersonListRow",
        getInitialState: function() {
            return {dinnerMap: {
                    0: 'Päivällinen, 1. kattaus',
                    1: 'Päivällinen, 2. kattaus',
                    2: 'Meriaamiainen',
                    3: 'Lounas'
                }
            };
        },
        render: function() {
            return (
                React.createElement("li", {key: this.props.person.id, style: {display: 'flex', flexDirection: 'row'}}, 
                    React.createElement("div", {style: {flex: '0.5 1 auto', fontWeight: 'bold'}}, 
                        this.props.order, ":"
                    ), 
                    React.createElement("div", {style: {flex: '1 1 auto', width: '30%'}}, 
                        React.createElement("span", {style: {fontWeight: 'bold'}}, "Name: "), this.props.person.firstName + ' ' + this.props.person.lastName
                    ), 
                    React.createElement("div", {style: {flex: '1 1 auto', width: '25%'}}, 
                        React.createElement("span", {style: {fontWeight: 'bold'}}, "Email: "), this.props.person.email
                    ), 
                    React.createElement("div", {style: {flex: '1 1 auto', width: '15%'}}, 
                        React.createElement("span", {style: {fontWeight: 'bold'}}, "DoB: "), this.props.person.dateOfBirth
                    ), 
                    React.createElement("div", {style: {flex: '1 1 auto', width: '25%'}}, 
                        React.createElement("span", {style: {fontWeight: 'bold'}}, "Dinner: "), this.state.dinnerMap[this.props.person.selectedDining]
                    )
                )
            );
        }
    });

    return EventSection;
});