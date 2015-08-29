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
            return {event: event, selectedCabin: null, registrations: registrations, showNotification: RegistrationStore.getNotificationState()};
        },
        componentWillMount: function() {
            EventActions.loadEventData(this.getParams().eventId);
            RegistrationActions.getRegistrations(this.getParams().eventId);
        },
        componentDidMount: function() {
            EventStore.addChangeListener(this._onChange);
            RegistrationStore.addChangeListener(this._onChange);
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
                passengerListComponent = <PassengerListComponent selectedCabin={this.state.selectedCabin} event={this.state.event} submitHandler={this.handleSubmit}/>;
             }
             var eventName = this.state.event != null ? this.state.event.name : "";
             var selectCabinComponent, registrationSummaryComponent;
             if(this.state.event) {
                selectCabinComponent = (<SelectCabinComponent event={this.state.event} registrations = {this.state.registrations} selectedCabin={this.state.selectedCabin} cabinSelectHandler={this.updateSelectedCabin}/>);
                registrationSummaryComponent = (<RegistrationSummaryView event={this.state.event} registrations={this.state.registrations}/>);
             }
            return (
                <div>
                    <PageHeader>Register to event: {eventName} </PageHeader>
                    {selectCabinComponent}
                    {passengerListComponent}
                    {registrationSummaryComponent}
                    <SuccessNotification close={this.closeDialog} show={this.state.showNotification}/>
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
                var label = cabin.cabin.name +" ( " + numberOfAvailableCabins + " available ) ";
                var selected = this.props.selectedCabin && this.props.selectedCabin.id == cabin.id ? true : null;
                return (
                    <ListGroupItem key={cabin.id}>
                        <RBInput type="radio" name={cabin.cabin.name} value={cabin.cabin.name} onChange={this.selectCabin.bind(null, cabin.cabin)} checked={selected} label={label}/>
                    </ListGroupItem>
                     );
            }, this);
            return (
                <Panel header={<h3>Available cabins</h3>} bsStyle="info">
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
            _.each(registrations, function(registration) {
                registration["selectedDining"] = registration["selectedDining"] ? parseInt(registration[dinner]) : 0;
                registration["contactPerson"] = 0;
                registration["registrationId"] = -1;
            }, this);

            var registration = {cabinId: this.props.selectedCabin.id, eventId: this.props.event.id};
            this.props.submitHandler([registrations, registration]);
        },
        render: function() {
            var placesInCabin = [], i = 0, len = !this.props.selectedCabin ? 1 : this.props.selectedCabin.capacity;
            while(++i <= len) placesInCabin.push(i)
            var items = placesInCabin.map(function(order) {
                var headerName = <h3>{order}. person:</h3>
                return (
                    <FormFragment key={order} ref={order}>
                        <Panel header={headerName} bsStyle="info">
                            <Input type="text" placeholder="Insert first name" label="First name:*" id="firstNameField" name="firstName" labelClassName="col-sm-2 control-label" wrapperClassName="col-xs-4" required="true"/>
                            <Input type="text" placeholder="Insert last name" label="Last name:*" id="lastNameField" name="lastName" labelClassName="col-sm-2 control-label" wrapperClassName="col-xs-4" required="true"/>
                            <Input type="email" placeholder="Insert email" label="Email:*" id="emailField" name="email" labelClassName="col-sm-2 control-label" wrapperClassName="col-xs-4" required="true"/>
                            <Input type="text" placeholder="Insert date of birth" label="Date Of Birth:*" id="dobField" name="dateOfBirth" labelClassName="col-sm-2 control-label" wrapperClassName="col-xs-4" required="true"/>
                            <Input type="text" placeholder="Insert Club-number" label="Club-number:" id="clubNumberField" name="clubNumber" labelClassName="col-sm-2 control-label" wrapperClassName="col-xs-4"/>
                            <Input type="select" name="selectedDining" label="Dining:*" placeholder="Select the type of dining:" labelClassName="col-sm-2 control-label" wrapperClassName="col-xs-4" required="true">
                                <option key={1} value="1">Dinner, first serving</option>
                                <option key={2} value="2">Dinner, second serving</option>
                                <option key={3} value="3">Breakfast</option>
                                <option key={4} value="4">Lunch</option>
                            </Input>
                            <Input type="checkbox" label="Contact person:" id="contactPerson" name="contactPerson" labelClassName="col-sm-2 control-label" wrapperClassName="col-xs-4"/>
                        </Panel>
                    </FormFragment>
                );
            });
            var flattenedItems = _.flatten(items);
            return (
                <div id="personList">
                    <h2>Fill passenger details: </h2>
                    <MultiModelForm onSubmit={this.saveRegistration}>
                        {flattenedItems}
                        <ButtonInput type="submit" bsStyle="success" value="Save registration"/>
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
            return (
                <RB.Modal onRequestHide={this.dismiss} onHide={this.dismiss} show={this.props.show}>
                    <div className="modal-header">Registration successfull!</div>
                    <div className="modal-body"><p>Congratulations! You have successfully registered to this event. Enjoy! </p></div>
                    <div className="modal-footer"><Button onClick={this.dismiss}>Okey dokey!</Button></div>
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
                <Panel header="Registration counts:" bsStyle="info">
                    <ul>
                        {(this.props.event.cabins ? this.props.event.cabins : []).map(function(cabin) {
                            return (
                                <li>{cabin.cabin.name} : {registrationForCabinTypes[cabin.cabin.id]} </li>
                            );
                        })}
                    </ul>
                </Panel>
            );
        }
    });

    return RegisterView;

});