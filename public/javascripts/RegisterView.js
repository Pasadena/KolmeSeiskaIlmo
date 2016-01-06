define(['react','react-router', 'jquery', 'components/FormComponents', 'underscore', 'react-bootstrap', 'store/EventStore', 'store/RegistrationStore', 'actions/EventActions', 'actions/RegistrationActions'], function(React, Router, $, FormComponents, _, RB, EventStore, RegistrationStore, EventActions, RegistrationActions) {
    var Panel = RB.Panel;
    var Input = FormComponents.InputWrapper;
    var RBInput = RB.Input;
    var ListGroup = RB.ListGroup;
    var ListGroupItem = RB.ListGroupItem;
    var PageHeader = RB.PageHeader;
    var Modal = RB.Modal;
    var Form = FormComponents.Form;
    var ButtonInput = RB.ButtonInput;
    var Button = RB.Button;
    var FormFragment = FormComponents.FormFragment;
    var MultiModelForm = FormComponents.MultiModelForm;

    var RegisterView = React.createClass({displayName: "RegisterView",
        mixins: [Router.State],

        childContextTypes: {
            router: React.PropTypes.func
        },
        getInitialState: function() {
            var event = EventStore.getSelectedEvent();
            var registrations = RegistrationStore.getRegistrations();
            return {event: event, selectedCabin: null, registrations: registrations, showNotification: RegistrationStore.getNotificationState()};
        },
        componentWillMount: function() {

        },
        componentDidMount: function() {
            EventStore.addChangeListener(this._onChange);
            RegistrationStore.addChangeListener(this._onChange);
            EventActions.loadEventData(this.getParams().eventId);
            RegistrationActions.getRegistrations(this.getParams().eventId);
        },
        componentWillUnmount: function() {
            EventStore.removeChangeListener(this._onChange);
            RegistrationStore.addChangeListener(this._onChange);
        },
        _onChange: function() {
            this.setState(this.getInitialState());
        },
        updateSelectedCabin: function(selectedCabin) {
            this.setState({selectedCabin: selectedCabin});
        },
        handleSubmit: function(registrationData) {
            RegistrationActions.saveRegistration({data: registrationData, url: "/register"})
        },
        closeDialog: function() {
            this.setState({showNotification: false});
            this.context.router.transitionTo("/");
        },
        render: function() {
            var passengerListComponent;
             if(this.state.selectedCabin) {
                passengerListComponent = React.createElement(PassengerListComponent, {selectedCabin: this.state.selectedCabin, event: this.state.event, submitHandler: this.handleSubmit});
             }
             var eventName = this.state.event != null ? this.state.event.name : "";
             var description = this.state.event != null ? this.state.event.description : "";
             var selectCabinComponent, registrationSummaryComponent;
             if(this.state.event) {
                selectCabinComponent = (React.createElement(SelectCabinComponent, {event: this.state.event, registrations: this.state.registrations, selectedCabin: this.state.selectedCabin, cabinSelectHandler: this.updateSelectedCabin}));
                registrationSummaryComponent = (React.createElement(RegistrationSummaryView, {event: this.state.event, registrations: this.state.registrations}));
             }
            return (
                React.createElement("div", null, 
                    React.createElement(PageHeader, null, "Register to event: ", eventName, " "), 
                    React.createElement(RB.Well, {bsSize: "small"}, description), 
                    selectCabinComponent, 
                    React.createElement(RB.Fade, {in: this.state.selectedCabin ? true : false}, 
                        React.createElement("div", null, 
                            passengerListComponent
                        )
                    ), 
                    registrationSummaryComponent, 
                    React.createElement(SuccessNotification, {close: this.closeDialog, show: this.state.showNotification})
                )
            );
        }
    });

    var SelectCabinComponent = React.createClass({displayName: "SelectCabinComponent",
        selectCabin: function(selectedCabin) {
            this.props.cabinSelectHandler(selectedCabin);
        },
        render: function() {
            var cabinButtons = !this.props.event.cabins ? [] : this.props.event.cabins.map(function(cabin) {
                var totalAmountOfCabins = cabin.cabinCount;
                var totalAmountOfOccupiedCabins = _.reduce(this.props.registrations, function(memo, item) {
                    return item.cabinId == cabin.cabin.id ? memo + 1 : memo;
                }, 0);
                var numberOfAvailableCabins = totalAmountOfCabins - totalAmountOfOccupiedCabins;
                var label = cabin.cabin.name +" ( " + numberOfAvailableCabins + " available ) ";
                var selected = this.props.selectedCabin && this.props.selectedCabin.id == cabin.id ? true : null;
                var cabinSelectionDisabled =  numberOfAvailableCabins <= 0 ? true : false;
                var radioClass = cabinSelectionDisabled ? "disabled-cabin" : null;
                return (
                    React.createElement(ListGroupItem, {key: cabin.id}, 
                        React.createElement(RBInput, {type: "radio", name: cabin.cabin.name, value: cabin.cabin.name, onChange: this.selectCabin.bind(null, cabin.cabin), checked: selected, 
                            label: label, disabled: cabinSelectionDisabled, labelClassName: radioClass})
                    )
                     );
            }, this);
            return (
                React.createElement(Panel, {header: React.createElement("h3", null, "Available cabins"), bsStyle: "info"}, 
                    React.createElement(ListGroup, null, 
                        cabinButtons
                    )
                )
            );
        }
    });

    var PassengerListComponent = React.createClass({displayName: "PassengerListComponent",
        contextTypes: {
            router: React.PropTypes.func
        },
        saveRegistration: function(registrations) {
            _.each(registrations, function(registration) {
                registration["selectedDining"] = registration["selectedDining"] ? parseInt(registration["selectedDining"]) : 0;
                if(registration.contactPerson != '1') {
                    registration["contactPerson"] = 0;
                }
                registration["registrationId"] = -1;
            }, this);
            this.updateContactPersonIfNoneSelected(registrations);

            var registration = {cabinId: this.props.selectedCabin.id, eventId: this.props.event.id};
            this.props.submitHandler([registrations, registration]);
        },
        updateContactPersonIfNoneSelected: function(registrations) {
            var selectedContactPerson = _.findWhere(registrations, {contactPerson: '1'});
            if(!selectedContactPerson) {
                _.first(registrations).contactPerson = 1;
            }
        },
        render: function() {
            var placesInCabin = [], i = 0, len = !this.props.selectedCabin ? 1 : this.props.selectedCabin.capacity;
            while(++i <= len) placesInCabin.push(i)
            var items = placesInCabin.map(function(order) {
                var headerName = React.createElement("h3", null, order, ". person:")
                return (
                    React.createElement(FormFragment, {key: order, ref: order}, 
                        React.createElement(Panel, {header: headerName, bsStyle: "info"}, 
                            React.createElement(RB.Well, {bsSize: "large", bsStyle: "danger"}, "* marks required field"), 
                            React.createElement(Input, {type: "text", placeholder: "Insert first name", label: "First name:*", id: "firstNameField", name: "firstName", labelClassName: "col-sm-2 control-label", wrapperClassName: "col-xs-4", required: "true"}), 
                            React.createElement(Input, {type: "text", placeholder: "Insert last name", label: "Last name:*", id: "lastNameField", name: "lastName", labelClassName: "col-sm-2 control-label", wrapperClassName: "col-xs-4", required: "true"}), 
                            React.createElement(Input, {type: "email", placeholder: "Insert email", label: "Email:*", id: "emailField", name: "email", labelClassName: "col-sm-2 control-label", wrapperClassName: "col-xs-4", required: "true"}), 
                            React.createElement(Input, {type: "text", placeholder: "Insert date of birth", label: "Date Of Birth:*", id: "dobField", name: "dateOfBirth", labelClassName: "col-sm-2 control-label", wrapperClassName: "col-xs-4", required: "true"}), 
                            React.createElement(Input, {type: "text", placeholder: "Insert Club-number", label: "Club-number:", id: "clubNumberField", name: "clubNumber", labelClassName: "col-sm-2 control-label", wrapperClassName: "col-xs-4"}), 
                            React.createElement(Input, {type: "select", name: "selectedDining", label: "Dining:*", placeholder: "Select the type of dining:", labelClassName: "col-sm-2 control-label", wrapperClassName: "col-xs-4", required: "true"}, 
                                React.createElement("option", {key: 1, value: "1"}, "Dinner, first serving"), 
                                React.createElement("option", {key: 2, value: "2"}, "Dinner, second serving"), 
                                React.createElement("option", {key: 3, value: "3"}, "Breakfast"), 
                                React.createElement("option", {key: 4, value: "4"}, "Lunch")
                            ), 
                            React.createElement(Input, {type: "checkbox", label: "Contact person:", id: "contactPerson", name: "contactPerson", labelClassName: "col-sm-2 control-label", wrapperClassName: "col-xs-4"})
                        )
                    )
                );
            });
            var flattenedItems = _.flatten(items);
            return (
                React.createElement("div", {id: "personList"}, 
                    React.createElement("h2", null, "Fill passenger details: "), 
                    React.createElement(MultiModelForm, {onSubmit: this.saveRegistration}, 
                        flattenedItems, 
                        React.createElement(ButtonInput, {type: "submit", bsStyle: "success", value: "Save registration"})
                    )
                )
            );
        }
    });

    var SuccessNotification = React.createClass({displayName: "SuccessNotification",
        dismiss: function(event) {
            event.preventDefault();
            this.props.close();
        },
        render: function() {
            return (
                React.createElement(RB.Modal, {onRequestHide: this.dismiss, onHide: this.dismiss, show: this.props.show}, 
                    React.createElement("div", {className: "modal-header"}, "Registration successfull!"), 
                    React.createElement("div", {className: "modal-body"}, React.createElement("p", null, "Congratulations! You have successfully registered to this event. Enjoy! ")), 
                    React.createElement("div", {className: "modal-footer"}, React.createElement(Button, {onClick: this.dismiss}, "Okey dokey!"))
                )
            );
        }
    });

    var RegistrationSummaryView = React.createClass({displayName: "RegistrationSummaryView",
        getInitialState: function() {
            return {registrationCounts: []};
        },
        render: function() {
            var registrationForCabinTypes = _.countBy(this.props.registrations, function(item) { return item.cabinId; });
            return (
                React.createElement(Panel, {header: "Registrations so far:", bsStyle: "info"}, 
                    React.createElement("ul", {style: {"listStyle": "none"}}, 
                        (this.props.event.cabins ? this.props.event.cabins : []).map(function(cabin) {
                            return (
                                React.createElement("li", null, cabin.cabin.name, " : ", registrationForCabinTypes[cabin.cabin.id], " ")
                            );
                        })
                    )
                )
            );
        }
    });

    return RegisterView;

});