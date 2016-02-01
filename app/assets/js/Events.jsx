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

    var EventSection = React.createClass({
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
                <div>
                    <RB.PageHeader>
                        <span style={{'marginRight': '20px'}}>Events</span>
                        <Button bsStyle="primary" onClick={this.backToIndex}>Back</Button>
                    </RB.PageHeader>
                    <div className={this.getStatusMessageClass()} role="alert">
                        {this.state.message}
                    </div>
                    <RB.Panel header="Available events" bsStyle="info">
                        <EventList data={this.state.events} deleteHandler={this.deleteListItem} editHandler={this.loadEvent} viewRegistrationDataHandler={this.viewEventRegistrations}/>
                        <a className="btn btn-success" onClick={this.createEvent}>Create a new event</a>
                    </RB.Panel>
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
                <RB.Modal onRequestHide={this.dismiss} onHide={this.dismiss} show={this.props.show} bsStyle="primary" dialogClassName="modal-large">
                    <Form onSubmit={this.submitForm} model={this.props.event}>
                        <RB.ModalHeader>
                            <RB.Modal.Title>{modalTitle}</RB.Modal.Title>
                        </RB.ModalHeader>
                        <RB.Modal.Body>
                            <Input type="text" name="name" placeholder="Insert event name" label="Event name:" id="nameField" errorMessage='Name is mandatory' required='true' labelClassName="col-sm-3 control-label" wrapperClassName="col-xs-6"/>
                            <Input type="textarea" name="description" placeholder="Insert event description" label="Event description:" id="descriptionField" labelClassName="col-sm-3 control-label" wrapperClassName="col-xs-6"/>
                            <DateField type="text" name="dateOfEvent" label="Event date:" id="eventDate" errorMessage='Event date is mandatory' required='true' labelClassName="col-sm-3 control-label" wrapperClassName="col-xs-6"/>
                            <DateField type="text" name="registrationStartDate" label="Registration starts:" id="startField" errorMessage='Start date is mandatory' required='true' labelClassName="col-sm-3 control-label" wrapperClassName="col-xs-6"/>
                            <DateField type="text" name="registrationEndDate" label="Registration ends:" id="endField" errorMessage='End date is mandatory' required='true' labelClassName="col-sm-3 control-label" wrapperClassName="col-xs-6"/>
                            <h4>Event's cabins</h4>
                            <EventCabinsView cabins={this.props.cabins} selectedCabins={this.state.selectedCabins} event={this.props.event} ref="cabinSelect"/>
                        </RB.Modal.Body>
                        <RB.Modal.Footer>
                            <RB.ButtonGroup>
                                <RB.ButtonInput type="submit" value="Save event" className="btn btn-success" />
                                <RB.ButtonInput type="button" value="Cancel" className="btn" onClick={this.closeDialog}/>
                            </RB.ButtonGroup>
                        </RB.Modal.Footer>
                    </Form>
                </RB.Modal>
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
                    <tr ref={cabin.id}>
                        <td><RB.Input type="checkbox" value={cabin.id} checked={cabinSelected} onChange={this.selectCabin.bind(null, cabin)}/></td>
                        <td>{cabin.name} ({cabin.capacity} persons)</td>
                        <td><RB.Input type="text" value={cabinSelected ? selectedCabinMatchingCabin.cabinCount : null} disabled={!cabinSelected} onChange={this.updateValue.bind(null, cabin)} wrapperClassName="col-xs-4"/></td>
                    </tr>
                );
            }, this);
            return (
                <RB.Table style={{width: "80%", margin: "0 auto"}}>
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
                </RB.Table>
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
                        <div className="list-form">
                            <form onSubmit={this.deleteEvent}>
                                <RB.ButtonInput type="submit" value="Delete" className="btn btn-danger" />
                            </form>
                        </div>
                        <div className="list-form">
                            <form onSubmit={this.editEvent}>
                                <RB.ButtonInput type="submit" value="Edit" className="btn btn-primary" />
                            </form>
                        </div>
                        <div className="list-form">
                            <form>
                                <RB.ButtonToolbar>
                                <RB.Button type="button" value="View registrations" className="btn btn-primary" onClick={this.viewRegistrationData}>View registrations</RB.Button>
                                </RB.ButtonToolbar>
                            </form>
                        </div>
                        <div className="list-form">
                            <form>
                                <RB.ButtonToolbar>
                                    <RB.Button type="button" value="Download registrations" className="btn btn-primary"
                                    href={'/admin/event/excel/' +this.props.event.id}>Get Excel</RB.Button>
                                </RB.ButtonToolbar>
                            </form>
                        </div>
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
                <RB.Modal onRequestHide={this.dismiss} onHide={this.dismiss} show={this.props.show} bsStyle="primary" dialogClassName="modal-large">
                    <RB.ModalHeader>
                        <RB.Modal.Title>View registrations</RB.Modal.Title>
                    </RB.ModalHeader>
                    <RB.Modal.Body>
                        <ul>
                            {registrationItems}
                        </ul>
                    </RB.Modal.Body>
                    <RB.ModalFooter>
                        <RB.ButtonInput type="button" value="Cancel" className="btn" onClick={this.closeDialog}/>
                    </RB.ModalFooter>
                </RB.Modal>
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

    return EventSection;
});