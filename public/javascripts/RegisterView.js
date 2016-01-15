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
            return {event: event, selectedCabin: null, registrations: registrations,
                showNotification: RegistrationStore.getNotificationState(), contactPerson: this.contactPerson, alerts: []};
        },
        componentWillMount: function() {
            this.contactPerson = null;
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
            this.setState({selectedCabin: selectedCabin, alerts: []});
        },
        handleSubmit: function(registrationData, contactPerson) {
            RegistrationActions.saveRegistration({data: registrationData, url: "/register"})
            this.contactPerson = contactPerson;
        },
        closeDialog: function() {
            this.setState({showNotification: false});
            {/**this.context.router.transitionTo("/");**/}
            window.location = "http://teekkariristeily.net";
        },
        addAlert: function(alert) {
            this.state.alerts.push(alert);
            this.setState({alerts: this.state.alerts})
        },
        render: function() {
            var passengerListComponent;
             if(this.state.selectedCabin) {
                passengerListComponent = React.createElement(PassengerListComponent, {selectedCabin: this.state.selectedCabin, event: this.state.event, submitHandler: this.handleSubmit, alertHandler: this.addAlert});
             }
             var eventName = this.state.event != null ? this.state.event.name : "";
             var description = this.state.event != null ? this.state.event.description : "";
             var eventDate = this.state.event != null ? this.state.event.dateOfEvent : "";
             var registrationStarts = this.state.event != null ? this.state.event.registrationStartDate : "";
             var registrationEnds = this.state.event != null ? this.state.event.registrationEndDate : "";
             var selectCabinComponent, registrationSummaryComponent;
             if(this.state.event) {
                selectCabinComponent = (React.createElement(SelectCabinComponent, {event: this.state.event, registrations: this.state.registrations, selectedCabin: this.state.selectedCabin, cabinSelectHandler: this.updateSelectedCabin}));
                registrationSummaryComponent = (React.createElement(RegistrationSummaryView, {event: this.state.event, registrations: this.state.registrations}));
             }
             var alerts = _.map(this.state.alerts, function(alert) {
                return (
                    React.createElement(RB.Alert, {bsStyle: "danger"}, 
                        alert
                    )
                );
             });
            return (
                React.createElement("div", null, 
                    React.createElement("h2", null, "Ilmoittaudu tapahtumaan ", eventName, " "), 
                    React.createElement(RB.Well, {bsSize: "small"}, 
                        React.createElement("p", null, "Tapahtuma-aika: ", eventDate), 
                        React.createElement("p", null, "Ilmoittautumisaika: ", registrationStarts, " - ", registrationEnds ), 
                        React.createElement("p", null, React.createElement("pre", null, description))
                    ), 
                    selectCabinComponent, 

                    React.createElement(RB.Fade, {in: this.state.selectedCabin ? true : false}, 
                        React.createElement("div", null, 
                            passengerListComponent, 
                            alerts
                        )
                    ), 
                    React.createElement(SuccessNotification, {close: this.closeDialog, show: this.state.showNotification, 
                        contactPerson: this.state.contactPerson})
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
                var label = cabin.cabin.name +" ( " + numberOfAvailableCabins + " vapaana ) ";
                var selected = this.props.selectedCabin && this.props.selectedCabin.id == cabin.id ? true : false;
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
                React.createElement(Panel, {header: React.createElement("h3", null, "Valitse hyttiluokka"), bsStyle: "info"}, 
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
            var filledRegistrations = _.filter(registrations, function(item) {
                return item.emptyPerson != 1;
            });
            if(filledRegistrations.length == 0) {
                this.props.alertHandler("Ahoy! Ilmoittautumisen tulee sisältää vähintää yhden henkilön tiedot.");
                return false;
            }
            _.each(filledRegistrations, function(registration) {
                registration["selectedDining"] = registration["selectedDining"] ? parseInt(registration["selectedDining"]) : 0;
                if(registration.contactPerson != '1') {
                    registration["contactPerson"] = 0;
                }
                registration["registrationId"] = -1;
            }, this);
            var contactPerson = this.getContactPersonFromList(filledRegistrations);

            var registration = {cabinId: this.props.selectedCabin.id, eventId: this.props.event.id};
            this.props.submitHandler([filledRegistrations, registration], contactPerson);
        },
        getContactPersonFromList: function(registrations) {
            var selectedContactPerson = _.findWhere(registrations, {contactPerson: 1});
            if(selectedContactPerson) {
               return selectedContactPerson;
            } else {
                return this.createContactPersonFromListHead(registrations);
            }
        },
        createContactPersonFromListHead: function(registrations) {
            var firstPerson = _.first(registrations);
            firstPerson.contactPerson = 1;
            return firstPerson;
        },
        render: function() {
            var placesInCabin = [], i = 0, len = !this.props.selectedCabin ? 1 : this.props.selectedCabin.capacity;
            while(++i <= len) placesInCabin.push(i)
            var items = placesInCabin.map(function(order) {
                var headerName = React.createElement("h3", null, order, ". henkilö:")
                var contactPersonId = "contactPerson" +order;
                return (
                    React.createElement(FormFragment, {key: order, ref: order}, 
                        React.createElement(Panel, {header: headerName, bsStyle: "info"}, 
                            React.createElement(RB.Well, {bsSize: "large", bsStyle: "danger"}, "* = pakollinen tieto"), 
                            React.createElement(Input, {type: "text", placeholder: "Etunimi", label: "Etunimi:*", id: "firstNameField", name: "firstName", labelClassName: "col-sm-2 control-label", wrapperClassName: "col-xs-4", 
                                required: "true", maxlength: "254"}), 
                            React.createElement(Input, {type: "text", placeholder: "Sukunimi", label: "Sukunimi:*", id: "lastNameField", name: "lastName", labelClassName: "col-sm-2 control-label", wrapperClassName: "col-xs-4", required: "true", maxlength: "254"}), 
                            React.createElement(Input, {type: "email", placeholder: "Sähköpostiosoite", label: "Sähköpostiosoite:*", id: "emailField", name: "email", labelClassName: "col-sm-2 control-label", wrapperClassName: "col-xs-4", required: "true", maxlength: "254"}), 
                            React.createElement(Input, {type: "text", placeholder: "pp.kk.vvvv", label: "Syntymäaika (pp.kk.vvvv):*", id: "dobField", name: "dateOfBirth", labelClassName: "col-sm-2 control-label", wrapperClassName: "col-xs-4", required: "true", maxlength: "10"}), 
                            React.createElement(Input, {type: "text", placeholder: "Kansallisuus", label: "Kansallisuus:", id: "nationalityField", name: "nationality", labelClassName: "col-sm-2 control-label", wrapperClassName: "col-xs-4", required: "true", maxlength: "254"}), 
                            React.createElement(Input, {type: "text", placeholder: "Club One-numero", label: "Club One-numero:", id: "clubNumberField", name: "clubNumber", labelClassName: "col-sm-2 control-label", wrapperClassName: "col-xs-4", maxlength: "254"}), 
                            React.createElement(Input, {type: "select", name: "selectedDining", label: "Ruokailu:*", placeholder: "Valitse ruokailu:", labelClassName: "col-sm-2 control-label", wrapperClassName: "col-xs-4", required: "true"}, 
                                React.createElement("option", {key: 1, value: "0"}, "Buffet-illallinen, 1. kattaus"), 
                                React.createElement("option", {key: 2, value: "1"}, "Buffet-illallinen, 2. kattaus"), 
                                React.createElement("option", {key: 3, value: "2"}, "Meriaamiainen"), 
                                React.createElement("option", {key: 4, value: "3"}, "Buffet-lounas")
                            ), 
                            React.createElement(Input, {type: "checkbox", label: "Hytin vastuuhenkilö:", id: contactPersonId, name: "contactPerson", ref: "name", labelClassName: "col-sm-6 control-label", wrapperClassName: "col-xs-6"}), 
                            React.createElement(Input, {type: "checkbox", label: "Jätä paikka tyhjäksi", id: "emptyPerson", name: "emptyPerson", labelClassName: "col-sm-6 control-label", wrapperClassName: "col-xs-6", disableForm: "true"})
                        )
                    )
                );
            }, this);
            var flattenedItems = _.flatten(items);
            return (
                React.createElement("div", {id: "personList"}, 
                    React.createElement("h2", null, "Täytä henkilötiedot: "), 
                    React.createElement(MultiModelForm, {onSubmit: this.saveRegistration, uniqueFormFields: ["contactPerson"]}, 
                        flattenedItems, 
                        React.createElement("div", {style: {marginLeft: "15px"}}, 
                            React.createElement(ButtonInput, {type: "submit", bsStyle: "success", value: "Ilmoittaudu!"})
                        )
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
            var contactPersonEmail = this.props.contactPerson != null ? this.props.contactPerson.email : "";
            return (
                React.createElement(RB.Modal, {onRequestHide: this.dismiss, onHide: this.dismiss, show: this.props.show}, 
                    React.createElement("div", {className: "modal-header"}, "Homma done!"), 
                    React.createElement("div", {className: "modal-body"}, 
                        React.createElement("p", null, "Onneksi olkoon! Ilmoittautumisesi on vastaanotettu! "), 
                        React.createElement("p", null, "Saat pian vahvistusviestin ja maksuohjeet seuraavaan sähköpostiosoitteeseen: ", contactPersonEmail), 
                        React.createElement("p", null, "Mikäli et saa vahvistusviestiä vuorokauden kuluessa, ota yhteyttä osoitteeseen  ", 
                         React.createElement("a", {href: "mailto:teekkariristeily@gmail.com"}, "teekkariristeily@gmail.com"))
                    ), 
                    React.createElement("div", {className: "modal-footer"}, React.createElement(Button, {bsStyle: "success", onClick: this.dismiss}, "Okey dokey!"))
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
                React.createElement(Panel, {header: React.createElement("h3", null, "Registrations so far:"), bsStyle: "info"}, 
                    React.createElement("ul", {style: {"listStyle": "none"}}, 
                        (this.props.event.cabins ? this.props.event.cabins : []).map(function(cabin, index) {
                            return (
                                React.createElement("li", {key: index}, cabin.cabin.name, " : ", registrationForCabinTypes[cabin.cabin.id], " ")
                            );
                        })
                    )
                )
            );
        }
    });

    return RegisterView;

});