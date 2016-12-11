import React from 'react';
import { Router } from 'react-router';
import { Button, PageHeader, Panel, Modal, ButtonToolbar, Table, Checkbox, FormControl } from 'react-bootstrap';
import $ from 'jquery';
import _ from 'underscore';
import {ButtonComponent, InputComponent, TextAreaComponent, Form, DateInputWrapper, InputWrapper, CheckboxWrapper} from './components/FormComponents';
import EventStore from './store/EventStore';
import CabinStore from './store/CabinStore';
import RegistrationStore from './store/RegistrationStore';
import EventActions from './actions/EventActions';
import CabinActions from './actions/CabinActions';
import RegistrationActions from './actions/RegistrationActions'
import moment from 'moment';

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

var EventSection = React.createClass({
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
            <div>
                <PageHeader>
                    <span style={{'marginRight': '20px'}}>Events</span>
                    <Button bsStyle="primary" onClick={this.backToIndex}>Back</Button>
                </PageHeader>
                <div className={this.getStatusMessageClass()} role="alert">
                    {this.state.message}
                </div>
                <Panel header="Available events" bsStyle="info">
                    <EventList data={this.state.events} deleteHandler={this.deleteListItem} editHandler={this.loadEvent} viewRegistrationDataHandler={this.viewEventRegistrations}/>
                    <a className="btn btn-success" onClick={this.createEvent}>Create a new event</a>
                </Panel>
                <EventForm event={this.state.selectedEvent} formSubmitHandler={this.submitEventForm} show={this.state.modalOpen} closeDialog={this.closeDialog} cabins={this.state.availableCabins}/>
                <EventRegistrationList show={this.state.viewRegistrationsModalOpen} close={this.closeRegistrationListDialog} registrations = {this.state.registrationList} />
            </div>
        )
    }
});

var EventForm = React.createClass({
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

        model.dateOfEvent = this.getFormattedDate(model.dateOfEvent);
        model.registrationEndDate = this.getFormattedDate(model.registrationEndDate);
        model.registrationStartDate = this.getFormattedDate(model.registrationStartDate);

        this.props.formSubmitHandler(model, eventCabins);
        this.setState({selectedEvent: {}, availableCabins: this.state.availableCabins, selectedCabins: []});
    },
    getFormattedDate(dateToFormat) {
        if(dateToFormat.toDate) {
            return dateToFormat.toDate();
        } else {
            return moment(dateToFormat, "DD.MM.YYYY HH:mm").toDate();
        }
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
            <Modal onHide={this.dismiss} show={this.props.show} bsStyle="primary" dialogClassName="modal-large">
                <Form onSubmit={this.submitForm} model={this.props.event}>
                    <Modal.Header>
                        <Modal.Title>{modalTitle}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <InputWrapper type="text" name="name" placeholder="Insert event name" label="Event name:" id="nameField"
                          errorMessage='Name is mandatory' required='true' labelClassName="col-sm-3 control-label" wrapperClassName="col-xs-6"/>
                        <InputWrapper type="textarea" name="description" placeholder="Insert event description"
                          label="Event description:" id="descriptionField" labelClassName="col-sm-3 control-label" wrapperClassName="col-xs-6"/>
                        <DateInputWrapper type="text" name="dateOfEvent" label="Event date:" id="eventDate"
                          errorMessage='Event date is mandatory' required='true' labelClassName="col-sm-3 control-label" wrapperClassName="col-xs-6"/>
                        <DateInputWrapper type="text" name="registrationStartDate" label="Registration starts:" id="startField"
                          errorMessage='Start date is mandatory' required='true' labelClassName="col-sm-3 control-label" wrapperClassName="col-xs-6"/>
                        <DateInputWrapper type="text" name="registrationEndDate" label="Registration ends:" id="endField"
                          errorMessage='End date is mandatory' required='true' labelClassName="col-sm-3 control-label" wrapperClassName="col-xs-6"/>
                        <CheckboxWrapper label="Is dining optional:" name="diningOptional"/>
                        <h4>Event's cabins</h4>
                        <EventCabinsView cabins={this.props.cabins} selectedCabins={this.state.selectedCabins} event={this.props.event} ref="cabinSelect"/>
                    </Modal.Body>
                    <Modal.Footer>
                        <ButtonToolbar>
                            <Button type="submit" bsStyle="success">Save event</Button>
                            <Button type="button" onClick={this.closeDialog}>Cancel</Button>
                        </ButtonToolbar>
                    </Modal.Footer>
                </Form>
            </Modal>
        )
    }
});

var EventCabinsView = React.createClass({
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
                <tr ref={cabin.id} key={cabin.id}>
                    <td><Checkbox value={cabin.id} checked={cabinSelected} onChange={this.selectCabin.bind(null, cabin)}/></td>
                    <td>{cabin.name} ({cabin.capacity} persons)</td>
                    <td><FormControl type="number" value={cabinSelected ? selectedCabinMatchingCabin.cabinCount : 0}
                      disabled={!cabinSelected} onChange={this.updateValue.bind(null, cabin)}/></td>
                </tr>
            );
        }, this);
        return (
            <Table style={{width: "80%", margin: "0 auto"}}>
                <thead>
                    <tr>
                        <td>#</td>
                        <td>Cabin</td>
                        <td>Amount</td>
                    </tr>
                </thead>
                <tbody>
                    {cabinElements}
                </tbody>
            </Table>
        );
    }
});

var EventList = React.createClass({
    render: function() {
        return (
            !this.props.data.length ? <EmptyTable /> :<EventTable data ={this.props.data} deleteHandler={this.props.deleteHandler} editHandler={this.props.editHandler}
            viewRegistrationDataHandler = {this.props.viewRegistrationDataHandler}/>
        )
    }
});

var EventTable = React.createClass({
    render: function() {
        var deleteHandler = this.props.deleteHandler;
        var editHandler = this.props.editHandler;
        var tableRows = this.props.data.map(function(event) {
            return (
                <EventTableRow event = {event} key={event.id} deleteHandler={deleteHandler} editHandler={editHandler} viewRegistrationDataHandler = {this.props.viewRegistrationDataHandler}/>
            );
        }, this);
        return (
            <table className="table table-condensed">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Date</th>
                        <th>Starts</th>
                        <th>Ends</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {tableRows}
                </tbody>
            </table>
        )
    }
});

var EventTableRow = React.createClass({
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
            <tr>
                <td>{this.props.event.name}</td>
                <td>{this.props.event.dateOfEvent}</td>
                <td>{this.props.event.registrationStartDate}</td>
                <td>{this.props.event.registrationEndDate}</td>
                <td>
                    <ButtonToolbar>
                        <Button type="submit" bsStyle="danger" onClick={this.deleteEvent}>Delete</Button>
                        <Button type="submit" bsStyle="primary" onClick={this.editEvent}>Edit</Button>
                        <Button type="button" value="View registrations" bsStyle="primary"
                            onClick={this.viewRegistrationData}>View registrations</Button>
                        <Button type="button" value="Download registrations" bsStyle="primary"
                            href={'/admin/event/excel/' +this.props.event.id}>Get Excel</Button>
                    </ButtonToolbar>
                </td>
            </tr>
        )
    }
});


var EmptyTable = React.createClass({displayName: "EmptyTable",
    render: function() {
        return (
            <div>There are no events to display!</div>
        )
    }
});

var EventRegistrationList = React.createClass({
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
                <EventRegistrationRow key={'registration ' +registration.registration.id} registration={registration} />
            );
        }, this);
        return (
            <Modal  onHide={this.dismiss} show={this.props.show} bsStyle="primary" dialogClassName="modal-large">
                <Modal.Header>
                    <Modal.Title>View registrations</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <ul>
                        {registrationItems}
                    </ul>
                </Modal.Body>
                <Modal.Footer>
                    <Button type="button" onClick={this.closeDialog}>Cancel</Button>
                </Modal.Footer>
            </ Modal>
        );
    }
});

var EventRegistrationRow = React.createClass({
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
                <EventRegistrationPersonListRow key = {'person ' +person.id} person={person} order={(order +1)}/>
            );
        });
        var arrowClass = this.state.expanded ? "glyphicon glyphicon-arrow-down" : "glyphicon glyphicon-arrow-right";
        return (
            <li key={registrationData.registration.id} style={{listStyle: 'none'}}>
                <div style={{display: 'flex', flexDirection: 'row', borderBottom: '1px solid black'}}>
                   <div style={{flex: '0.1 1 auto'}}>
                        <span className={arrowClass} onClick={this.viewPersons} style={{cursor: 'pointer'}}></span>
                    </div>
                    <div style={{flex: '1 1 auto', width: '45%'}}>
                        <span style={{fontWeight: 'bold'}}>Responsible person:</span> {responsiblePerson.firstName + ' ' + responsiblePerson.lastName}
                    </div>
                    <div style={{flex: '1 1 auto', width: '15%'}}>
                        <span style={{fontWeight: 'bold'}}>Cabin:</span> {registrationData.cabin.name}
                    </div>
                    <div style={{flex: '1 1 auto', width: '40%'}}>
                        <span style={{fontWeight: 'bold'}}>Registration time:</span> {timeStampDate.toLocaleDateString() + ' ' + timeStampDate.toLocaleTimeString()}
                    </div>
                </div>
                <div>
                <ul style={{paddingLeft: '10px'}}>
                    {personInfoRows}
                </ul>
                </div>
            </li>
        );
    }
});

var EventRegistrationPersonListRow = React.createClass({
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
            <li key={this.props.person.id} style={{display: 'flex', flexDirection: 'row'}}>
                <div style={{flex: '0.5 1 auto', fontWeight: 'bold'}}>
                    {this.props.order}:
                </div>
                <div style={{flex: '1 1 auto', width: '30%'}}>
                    <span style={{fontWeight: 'bold'}}>Name: </span>{this.props.person.firstName + ' ' + this.props.person.lastName}
                </div>
                <div style={{flex: '1 1 auto', width: '25%'}}>
                    <span style={{fontWeight: 'bold'}}>Email: </span>{this.props.person.email}
                </div>
                <div style={{flex: '1 1 auto', width: '15%'}}>
                    <span style={{fontWeight: 'bold'}}>DoB: </span>{this.props.person.dateOfBirth}
                </div>
                <div style={{flex: '1 1 auto', width: '25%'}}>
                    <span style={{fontWeight: 'bold'}}>Dinner: </span>{this.state.dinnerMap[this.props.person.selectedDining]}
                </div>
            </li>
        );
    }
});
export default EventSection;
