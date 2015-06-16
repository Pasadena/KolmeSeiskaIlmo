define(['react','react-router', 'jquery', 'components/FormComponents', 'underscore'], function(React, Router, $, FormComponents, _) {

    var InputComponent = FormComponents.InputComponent;
    var Form = FormComponents.Form;
    var ButtonComponent = FormComponents.ButtonComponent;

    var RegisterView = React.createClass({
        mixins: [Router.State],
        getInitialState: function() {
            return {event: null, cabins: null, selectedCabin: null};
        },
        componentWillMount: function() {

        },
        componentDidMount: function() {
            this.loadEventData();
            {/*this.togglePersonInfoComponent();*/}
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
        togglePersonInfoComponent: function() {
            $('#personList').slideDown();
        },
        updateSelectedCabin: function(selectedCabin) {
            this.setState({selectedCabin: selectedCabin});
            {/*this.togglePersonInfoComponent();*/}
        },
        render: function() {
            var passengerListComponent;
             if(this.state.selectedCabin) {
                passengerListComponent = <PassengerListComponent selectedCabin={this.state.selectedCabin}/>;
             }
            return (
                <div>
                    <SelectCabinComponent cabins={this.state.cabins} selectedCabin={this.state.selectedCabin} cabinSelectHandler={this.updateSelectedCabin}/>
                    {passengerListComponent}
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
                    <li key={cabin.id}><input type="radio" name={cabin.name} value={cabin.name} onChange={this.selectCabin.bind(null, cabin)} checked={selected} /> <span>{cabin.name}</span> </li>
                     );
            }, this);
            return (
                <div>
                    <h2>Select cabin:</h2>
                    <ul>
                        {cabinButtons}
                    </ul>
                </div>
            );
        }
    });

    var PassengerListComponent = React.createClass({
        saveRegistration: function() {
            alert("TODO: Make this do something");
        },
        render: function() {
            var placesInCabin = [], i = 0, len = !this.props.selectedCabin ? 1 : this.props.selectedCabin.capacity;
            while(++i <= len) placesInCabin.push(i)
            var items = placesInCabin.map(function(order) {
                return (
                    <fieldset key={order}>
                        <legend>{order}</legend>
                        <InputComponent type="text" placeholder="Insert first name" label="First name:" id="firstNameField" name="firstName"/>
                        <InputComponent type="text" placeholder="Insert last name" label="Last name:" id="lastNameField" name="lastName"/>
                        <InputComponent type="email" placeholder="Insert email" label="Email:" id="emailField" name="email"/>
                        <InputComponent type="email" placeholder="Insert date of birth" label="Date Of Birth:" id="dobField" name="dateOfBirth"/>
                        <InputComponent type="text" placeholder="Insert Club-number" label="Club-number:" id="clubNumberField" name="clubNumber"/>
                        <select>
                            <option key={1} value="1">Dinner, first serving</option>
                            <option key={2} value="2">Dinner, second serving</option>
                            <option key={3} value="3">Breakfast</option>
                            <option key={4} value="4">Lunch</option>
                        </select>
                    </fieldset>
                );
            });
            return (
                <div id="personList">
                    <h2>Fill passenger details: </h2>
                    {/*<Form onSubmit={this.saveRegistration}>*/}
                        {items}
                        <ButtonComponent type="submit" value="Save registration" class="btn btn-success" />
                    {/*</Form>*/}
                </div>
            );
        }
    });


    var PassengerInfoComponent = React.createClass({
        render: function() {
            return (
                <div>

                    <InputComponent type="text" placeholder="Insert first name" label="First name:" id="firstNameField" name="firstName"/>
                    <InputComponent type="text" placeholder="Insert last name" label="Last name:" id="lastNameField" name="lastName"/>
                    <InputComponent type="email" placeholder="Insert email" label="Email:" id="emailField" name="email"/>
                    <InputComponent type="email" placeholder="Insert date of birth" label="Date Of Birth:" id="dobField" name="dateOfBirth"/>
                    <InputComponent type="text" placeholder="Insert Club-number" label="Club-number:" id="clubNumberField" name="clubNumber"/>
                    <select>
                        <option key={1} value="1">Dinner, first serving</option>
                        <option key={2} value="2">Dinner, second serving</option>
                        <option key={3} value="3">Breakfast</option>
                        <option key={4} value="4">Lunch</option>
                    </select>
                    <ButtonComponent type="submit" value="Save registration" class="btn btn-success" />

                </div>
            );
        }
    });

    return RegisterView;

});