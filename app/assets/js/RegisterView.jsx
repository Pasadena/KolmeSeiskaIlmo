define(['react','react-router', 'jquery', 'components/FormComponents', 'underscore', 'react-bootstrap'], function(React, Router, $, FormComponents, _, RB) {
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
            return {event: null, cabins: null, selectedCabin: null};
        },
        componentWillMount: function() {

        },
        componentDidMount: function() {
            this.loadEventData();
        },
        loadEventData: function() {
            var url = "/register/loadEvent/" +this.getParams().eventId;
            $.ajax({
                url: url,
                dataType: 'json',
                success: function(data) {
                    this.setState({event: data['event'], cabins: data['cabins']});
                }.bind(this),
                error: function(xhr, status, err) {
                    console.error(status, err.toString());
                }.bind(this)
            });
        },
        updateSelectedCabin: function(selectedCabin) {
            this.setState({selectedCabin: selectedCabin});
        },
        render: function() {
            var passengerListComponent;
             if(this.state.selectedCabin) {
                passengerListComponent = <PassengerListComponent selectedCabin={this.state.selectedCabin} event={this.state.event}/>;
             }
             var eventName = this.state.event != null ? this.state.event.name : "";
            return (
                <div>
                    <PageHeader>Register to event: {eventName} </PageHeader>
                    <SelectCabinComponent cabins={this.state.cabins} selectedCabin={this.state.selectedCabin} cabinSelectHandler={this.updateSelectedCabin}/>
                    {passengerListComponent}
                    <div id="notificationDiv"/>
                </div>
            );
        }
    });

    var SelectCabinComponent = React.createClass({
        selectCabin: function(selectedCabin) {
            this.props.cabinSelectHandler(selectedCabin);
        },
        render: function() {
            var cabinButtons = !this.props.cabins ? [] : this.props.cabins.map(function(cabin) {
                var selected = this.props.selectedCabin && this.props.selectedCabin.id == cabin.id ? true : null;
                return (
                    <ListGroupItem key={cabin.id}>
                        <RBInput type="radio" name={cabin.name} value={cabin.name} onChange={this.selectCabin.bind(null, cabin)} checked={selected} label={cabin.name}/>
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
            var that = this;
            var closeDialog = function() {
                $('#notificationDiv').hide();
                that.context.router.transitionTo("/");
            }
            _.each(registrations, function(registration) {
                registration["selectedDining"] = registration["selectedDining"] ? parseInt(registration[dinner]) : 0;
                registration["contactPerson"] = 0;
                registration["registrationId"] = -1;
            }, this);

            var registration = {cabinId: this.props.selectedCabin.id, eventId: this.props.event.id};
            $.ajax({
                url: "/register",
                contentType: 'application/json',
                dataType: 'json',
                type: "POST",
                data: JSON.stringify([registrations, registration]),
                success: function(data) {
                    $('#notificationDiv').show();
                    var notificationElement = <SuccessNotification close={closeDialog}/>;
                    React.render(notificationElement, document.getElementById('notificationDiv'));
                }.bind(this),
                error: function(xhr, status, err) {
                    console.error(status, err.toString());
                }.bind(this)
            });
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
                <RB.Modal onRequestHide={this.dismiss}>
                    <div className="modal-header">Registration successfull!</div>
                    <div className="modal-body"><p>Congratulations! You have successfully registered to this event. Enjoy! </p></div>
                    <div className="modal-footer"><Button onClick={this.dismiss}>Okey dokey!</Button></div>
                </RB.Modal>
            );
        }
    });

    return RegisterView;

});