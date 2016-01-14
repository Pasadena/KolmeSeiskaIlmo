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

    var RegisterView = React.createClass({
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
                passengerListComponent = <PassengerListComponent selectedCabin={this.state.selectedCabin} event={this.state.event} submitHandler={this.handleSubmit} alertHandler={this.addAlert}/>;
             }
             var eventName = this.state.event != null ? this.state.event.name : "";
             var description = this.state.event != null ? this.state.event.description : "";
             var eventDate = this.state.event != null ? this.state.event.dateOfEvent : "";
             var registrationStarts = this.state.event != null ? this.state.event.registrationStartDate : "";
             var registrationEnds = this.state.event != null ? this.state.event.registrationEndDate : "";
             var selectCabinComponent, registrationSummaryComponent;
             if(this.state.event) {
                selectCabinComponent = (<SelectCabinComponent event={this.state.event} registrations = {this.state.registrations} selectedCabin={this.state.selectedCabin} cabinSelectHandler={this.updateSelectedCabin}/>);
                registrationSummaryComponent = (<RegistrationSummaryView event={this.state.event} registrations={this.state.registrations}/>);
             }
             var alerts = _.map(this.state.alerts, function(alert) {
                return (
                    <RB.Alert bsStyle="danger">
                        {alert}
                    </RB.Alert>
                );
             });
            return (
                <div>
                    <h2>Ilmoittaudu tapahtumaan {eventName} </h2>
                    <RB.Well bsSize="small">
                        <p>Tapahtuma-aika: {eventDate}</p>
                        <p>Ilmoittautumisaika: {registrationStarts} - {registrationEnds }</p>
                        <p>{description}</p>
                    </RB.Well>
                    {selectCabinComponent}

                    <RB.Fade in={this.state.selectedCabin ? true : false}>
                        <div>
                            {passengerListComponent}
                            {alerts}
                        </div>
                    </RB.Fade>
                    <SuccessNotification close={this.closeDialog} show={this.state.showNotification}
                        contactPerson={this.state.contactPerson}/>
                </div>
            );
        }
    });

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
                var label = cabin.cabin.name +" ( " + numberOfAvailableCabins + " vapaana ) ";
                var selected = this.props.selectedCabin && this.props.selectedCabin.id == cabin.id ? true : null;
                var cabinSelectionDisabled =  numberOfAvailableCabins <= 0 ? true : false;
                var radioClass = cabinSelectionDisabled ? "disabled-cabin" : null;
                return (
                    <ListGroupItem key={cabin.id}>
                        <RBInput type="radio" name={cabin.cabin.name} value={cabin.cabin.name} onChange={this.selectCabin.bind(null, cabin.cabin)} checked={selected}
                            label={label} disabled={cabinSelectionDisabled} labelClassName={radioClass}/>
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
                var headerName = <h3>{order}. henkilö:</h3>
                var contactPersonId = "contactPerson" +order;
                return (
                    <FormFragment key={order} ref={order}>
                        <Panel header={headerName} bsStyle="info">
                            <RB.Well bsSize="large" bsStyle="danger">* = pakollinen tieto</RB.Well>
                            <Input type="text" placeholder="Etunimi" label="Etunimi:*" id="firstNameField" name="firstName" labelClassName="col-sm-2 control-label" wrapperClassName="col-xs-4"
                                required="true" maxlength="254"/>
                            <Input type="text" placeholder="Sukunimi" label="Sukunimi:*" id="lastNameField" name="lastName" labelClassName="col-sm-2 control-label" wrapperClassName="col-xs-4" required="true" maxlength="254"/>
                            <Input type="email" placeholder="Sähköpostiosoite" label="Sähköpostiosoite:*" id="emailField" name="email" labelClassName="col-sm-2 control-label" wrapperClassName="col-xs-4" required="true" maxlength="254"/>
                            <Input type="text" placeholder="pp.kk.vvvv" label="Syntymäaika (pp.kk.vvvv):*" id="dobField" name="dateOfBirth" labelClassName="col-sm-2 control-label" wrapperClassName="col-xs-4" required="true" maxlength="10"/>
                            <Input type="text" placeholder="Kansallisuus" label="Kansallisuus:" id="nationalityField" name="nationality" labelClassName="col-sm-2 control-label" wrapperClassName="col-xs-4" required="true" maxlength="254"/>
                            <Input type="text" placeholder="Club One-numero" label="Club One-numero:" id="clubNumberField" name="clubNumber" labelClassName="col-sm-2 control-label" wrapperClassName="col-xs-4" maxlength="254"/>
                            <Input type="select" name="selectedDining" label="Ruokailu:*" placeholder="Valitse ruokailu:" labelClassName="col-sm-2 control-label" wrapperClassName="col-xs-4" required="true">
                                <option key={1} value="0">Buffet-illallinen, 1. kattaus</option>
                                <option key={2} value="1">Buffet-illallinen, 2. kattaus</option>
                                <option key={3} value="2">Meriaamiainen</option>
                                <option key={4} value="3">Buffet-lounas</option>
                            </Input>
                            <Input type="checkbox" label="Hytin vastuuhenkilö:" id={contactPersonId} name="contactPerson" ref="name" labelClassName="col-sm-6 control-label" wrapperClassName="col-xs-6"/>
                            <Input type="checkbox" label="Jätä paikka tyhjäksi" id="emptyPerson" name="emptyPerson" labelClassName="col-sm-6 control-label" wrapperClassName="col-xs-6" disableForm="true"/>
                        </Panel>
                    </FormFragment>
                );
            }, this);
            var flattenedItems = _.flatten(items);
            return (
                <div id="personList">
                    <h2>Täytä henkilötiedot: </h2>
                    <MultiModelForm onSubmit={this.saveRegistration} uniqueFormFields={["contactPerson"]}>
                        {flattenedItems}
                        <div style={{marginLeft: "15px"}}>
                            <ButtonInput type="submit" bsStyle="success" value="Ilmoittaudu!"/>
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
                <RB.Modal onRequestHide={this.dismiss} onHide={this.dismiss} show={this.props.show}>
                    <div className="modal-header">Homma done!</div>
                    <div className="modal-body">
                        <p>Onneksi olkoon! Ilmoittautumisesi on vastaanotettu! </p>
                        <p>Saat pian vahvistusviestin ja maksuohjeet seuraavaan sähköpostiosoitteeseen: {contactPersonEmail}</p>
                        <p>Mikäli et saa vahvistusviestiä vuorokauden kuluessa, ota yhteyttä osoitteeseen &nbsp;
                         <a href="mailto:teekkariristeily@gmail.com">teekkariristeily@gmail.com</a></p>
                    </div>
                    <div className="modal-footer"><Button bsStyle="success" onClick={this.dismiss}>Okey dokey!</Button></div>
                </RB.Modal>
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

    return RegisterView;

});