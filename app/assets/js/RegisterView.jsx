import React from 'react';
import { Router, withRouter } from 'react-router';
import {FormFragment, MultiModelForm, InputWrapper, SelectWrapper, CheckboxWrapper} from './components/FormComponents';
import _ from 'underscore';
import {Panel, RBInput, ListGroup, ListGroupItem, PageHeader, Modal, ButtonInput, Button, Alert, Well, Fade, Radio} from 'react-bootstrap';
import EventStore from './store/EventStore';
import RegistrationStore from './store/RegistrationStore';
import EventActions from './actions/EventActions';
import RegistrationActions from './actions/RegistrationActions';
import { getShortDateTime } from './utils/dateTime';

const RegisterView = React.createClass({

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
        EventActions.loadEventData(this.props.params.eventId);
        RegistrationActions.getRegistrations(this.props.params.eventId);
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
        window.location = "http://www.teekkariristeily.net";
    },
    addAlert: function(alert) {
        this.state.alerts.push(alert);
        this.setState({alerts: this.state.alerts})
    },
    isRegistrationOpen(event) {
        if(event) {
            const now = new Date();
            const registrationStart = new Date(event.registrationStartDate);
            const registrationEnd = new Date(event.registrationEndDate);
            return registrationStart <= now && registrationEnd >= now;
        }
        return false;
    },

    getEventDateTime(dateTime) {
        return dateTime ? getShortDateTime(dateTime) : "";
    },

    render: function() {
         const eventName = this.state.event != null ? this.state.event.name : "";
         const description = this.state.event != null ? this.state.event.description : "";
         const eventDate = this.state.event != null ? this.getEventDateTime(this.state.event.dateOfEvent) : "";
         const registrationStarts = this.state.event != null ? this.getEventDateTime(this.state.event.registrationStartDate) : "";
         const registrationEnds = this.state.event != null ? this.getEventDateTime(this.state.event.registrationEndDate)  : "";

         let isRegistrationOpen = this.isRegistrationOpen(this.state.event);
         let registrationNotOpenNotification = this.getRegistrationNotOpenNotification(this.state.event,
             isRegistrationOpen);
        let selectCabinComponent = this.getCabinSelectContent(this.state.event, isRegistrationOpen);
        let passengerListComponent = this.getPassengerListComponent(this.state.event,
            this.state.selectedCabin, isRegistrationOpen);
        return (
            <div>
                <h2>Ilmoittaudu tapahtumaan {eventName} </h2>
                <Well bsSize="small">
                    <p>Tapahtuma-aika: {eventDate}</p>
                    <p>Ilmoittautumisaika: {registrationStarts} - {registrationEnds }</p>
                    <pre>{description}</pre>
                </Well>
                { registrationNotOpenNotification }
                { selectCabinComponent }
                { passengerListComponent }
                <SuccessNotification close={this.closeDialog} show={this.state.showNotification}
                    contactPerson={this.state.contactPerson}/>
            </div>
        );
    },
    getCabinSelectContent(event, isRegistrationOpen) {
        if(event && isRegistrationOpen) {
            return <SelectCabinComponent event={event} registrations = {this.state.registrations}
                selectedCabin={this.state.selectedCabin} cabinSelectHandler={this.updateSelectedCabin}/>
        }
        return null;
    },
    getRegistrationNotOpenNotification(event, isRegistrationOpen) {
        if(event && !isRegistrationOpen) {
            return <RegistrationNotOpenNotification event={event} />;
        }
        return null;
    },
    getPassengerListComponent(event, selectedCabin, isRegistrationOpen) {
        if(event && selectedCabin && isRegistrationOpen) {
            let passengerListComponent = <PassengerListComponent selectedCabin={selectedCabin} event={event}
                submitHandler={this.handleSubmit} alertHandler={this.addAlert}/>;
            let alerts = this.getAlertList();
            return (
                <Fade in={this.state.selectedCabin ? true : false}>
                    <div>
                        {passengerListComponent}
                        {alerts}
                    </div>
                </Fade>
            );
        }
        return null;
    },
    getAlertList() {
        return _.map(this.state.alerts, function(alert) {
           return (
               <Alert bsStyle="danger">
                   {alert}
               </Alert>
           );
        });
    }
});

const RegistrationNotOpenNotification = ({ event }) => (
    <Panel header={<h2>Rekisteröinti ei käynnissä</h2>} bsStyle="danger">
        <Well bsSize="small">
            <p> Whoa there landlubber! Rekisteröinti tapahtumaan { event.name } ei juuri nyt ole käynnissä.</p>
            <p> Rekisteröiminen tapahtumaan on avoinna { getShortDateTime(event.registrationStartDate) }
            - { getShortDateTime(event.registrationEndDate) } </p>
        </Well>
    </Panel>
)

var SelectCabinComponent = React.createClass({
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
            var label = cabin.cabin.name +", " + cabin.cabin.price +"€ ( " + numberOfAvailableCabins + " vapaana ) ";
            var selected = this.props.selectedCabin && this.props.selectedCabin.id == cabin.cabin.id ? true : false;
            var cabinSelectionDisabled =  numberOfAvailableCabins <= 0 ? true : false;
            var radioClass = cabinSelectionDisabled ? "radio disabled-cabin" : "radio";
            return (
                <ListGroupItem key={cabin.id}>
                  <Radio name={cabin.cabin.name} value={cabin.cabin.name}
                    onChange={this.selectCabin.bind(null, cabin.cabin)} checked={selected}
                    disabled={cabinSelectionDisabled} bsClass={radioClass}>{label}</Radio>
                </ListGroupItem>
                 );
        }, this);
        return (
            <Panel header={<h3>Valitse hyttiluokka</h3>} bsStyle="info">
                <ListGroup>
                    {cabinButtons}
                </ListGroup>
            </Panel>
        );
    }
});

var PassengerListComponent = React.createClass({
    saveRegistration: function(registrations) {
        var filledRegistrations = _.filter(registrations, function(item) {
            return item.emptyPerson != 1;
        });
        if(filledRegistrations.length == 0) {
            this.props.alertHandler("Ahoy! Ilmoittautumisen tulee sisältää vähintää yhden henkilön tiedot.");
            return false;
        }
        _.each(filledRegistrations, function(registration) {
            registration["selectedDining"] = registration["selectedDining"] ? parseInt(registration["selectedDining"]) : -1;
            if(registration.contactPerson) {
                registration["contactPerson"] = 1;
            } else {
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
            var headerName = <h3>{order}. henkilö:</h3>
            var contactPersonId = "contactPerson" +order;
            return (
                <FormFragment key={order} ref={order}>
                    <Panel header={headerName} bsStyle="info">
                        <Well bsSize="large" bsStyle="danger">* = pakollinen tieto</Well>
                        <InputWrapper type="text" placeholder="Etunimi" label="Etunimi:*" id="firstNameField" name="firstName" labelClassName="col-sm-2 control-label" wrapperClassName="col-xs-4"
                            required="true" maxlength="254"/>
                        <InputWrapper type="text" placeholder="Sukunimi" label="Sukunimi:*" id="lastNameField" name="lastName" labelClassName="col-sm-2 control-label" wrapperClassName="col-xs-4" required="true" maxlength="254"/>
                        <InputWrapper type="email" placeholder="Sähköpostiosoite" label="Sähköpostiosoite:*" id="emailField" name="email" labelClassName="col-sm-2 control-label" wrapperClassName="col-xs-4" required="true" maxlength="254"/>
                        <InputWrapper type="text" placeholder="pp.kk.vvvv" label="Syntymäaika (pp.kk.vvvv):*" id="dobField" name="dateOfBirth" labelClassName="col-sm-2 control-label" wrapperClassName="col-xs-4" required="true" maxlength="10"/>
                        <InputWrapper type="text" placeholder="Kansallisuus" label="Kansallisuus:*" id="nationalityField" name="nationality" labelClassName="col-sm-2 control-label" wrapperClassName="col-xs-4" required="true" maxlength="254"/>
                        <InputWrapper type="text" placeholder="Club One-numero" label="Club One-numero:" id="clubNumberField" name="clubNumber" labelClassName="col-sm-2 control-label" wrapperClassName="col-xs-4" maxlength="254"/>
                        <SelectWrapper name="selectedDining" label="Ruokailu:" placeholder="Valitse ruokailu:" labelClassName="col-sm-2 control-label" wrapperClassName="col-xs-4">
                            <option key={-1} value="-1">Ei ruokailua</option>
                            <option key={1} value="0">Buffet-illallinen, 1. kattaus (35€)</option>
                            <option key={2} value="1">Buffet-illallinen, 2. kattaus (35€)</option>
                            <option key={3} value="2">Meriaamiainen (10,50€)</option>
                            <option key={4} value="3">Buffet-lounas (31€)</option>
                        </SelectWrapper>
                        <CheckboxWrapper label="Hytin vastuuhenkilö:" id={contactPersonId} name="contactPerson"/>
                        <CheckboxWrapper label="Jätä paikka tyhjäksi" id="emptyPerson" name="emptyPerson" disableForm="true"/>
                    </Panel>
                </FormFragment>
            );
        }, this);
        var flattenedItems = _.flatten(items);
        return (
            <div id="personList">
                <h2>Täytä hytin {this.props.selectedCabin.name} henkilötiedot: </h2>
                <MultiModelForm onSubmit={this.saveRegistration} uniqueFormFields={["contactPerson"]}>
                    {flattenedItems}
                    <div style={{marginLeft: "15px", marginBottom: "1%"}}>
                        <Button type="submit" bsStyle="success">Ilmoittaudu!</Button>
                    </div>
                </MultiModelForm>
            </div>
        );
    }
});

var SuccessNotification = React.createClass({
    dismiss: function(event) {
        event.preventDefault();
        this.props.close();
    },
    render: function() {
        var contactPersonEmail = this.props.contactPerson != null ? this.props.contactPerson.email : "";
        return (
            <Modal onHide={this.dismiss} show={this.props.show}>
                <div className="modal-header">Homma done!</div>
                <div className="modal-body">
                    <p>Onneksi olkoon! Ilmoittautumisesi on vastaanotettu! </p>
                    <p>Saat pian vahvistusviestin ja maksuohjeet seuraavaan sähköpostiosoitteeseen: {contactPersonEmail}</p>
                    <p>Mikäli et saa vahvistusviestiä vuorokauden kuluessa, ota yhteyttä osoitteeseen &nbsp;
                     <a href="mailto:teekkariristeily@gmail.com">teekkariristeily@gmail.com</a></p>
                </div>
                <div className="modal-footer"><Button bsStyle="success" onClick={this.dismiss}>Okey dokey!</Button></div>
            </Modal>
        );
    }
});

var RegistrationSummaryView = React.createClass({
    getInitialState: function() {
        return {registrationCounts: []};
    },
    render: function() {
        var registrationForCabinTypes = _.countBy(this.props.registrations, function(item) { return item.cabinId; });
        return (
            <Panel header={<h3>Registrations so far:</h3>} bsStyle="info">
                <ul style={{"listStyle": "none"}}>
                    {(this.props.event.cabins ? this.props.event.cabins : []).map(function(cabin, index) {
                        return (
                            <li key={index}>{cabin.cabin.name} : {registrationForCabinTypes[cabin.cabin.id]} </li>
                        );
                    })}
                </ul>
            </Panel>
        );
    }
});

export default withRouter(RegisterView);
