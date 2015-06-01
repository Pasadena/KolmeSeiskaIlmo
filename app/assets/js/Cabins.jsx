//var formComponents = require('./FormComponents.jsx');

//InputComponent = formComponents.InputComponent;
//TextAreaComponent = formComponents.TextAreaComponent;
//ButtonComponent = formComponents.ButtonComponent;
//ButtonComponent = formComponents.ButtonComponent;

var CabinPageView = React.createClass({
    getInitialState: function() {
        return {cabins: []};
    },
    componentDidMount: function() {
        $.ajax({
            url: '/admin/loadCabins',
            dataType: 'json',
            success: function(data) {
                this.setState({cabins: data});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(status, err.toString());
            }.bind(this)
        });
    },
    openDialog: function(event) {
        event.preventDefault();
        var dialog = $('<div>').dialog({
            width: 700,
            height: 500,
            modal: true,
            title: 'Create cabin',
            close: function(e) {
                React.unmountComponentAtNode(this);
                $(this).remove();
            }
        });


        var closeDialog = function(event) {
            event.preventDefault();
            dialog.dialog('close');
        }
        React.render(<CabinDialog closeDialog={closeDialog} />, dialog[0]);
    },
    render: function() {
        return (
            <div>
                <div className="panel panel-default">
                    <div className="panel-heading">
                        <h3 className="panel-title">Cabins</h3>
                    </div>
                    <CabinListView cabins={this.state.cabins} />
                </div>
                <a className="btn btn-success" onClick={this.openDialog}>Create cabin</a>
            </div>
        );
    }
});

var CabinListView = React.createClass({
    render: function() {
        return (
            <table className="table table-striped">
                <thead>
                    <th>
                        <tr>
                            <td>Nimi</td>
                            <td>Kuvaus</td>
                            <td>Koko</td>
                            <td>Hinta</td>
                            <td></td>
                            <td></td>
                        </tr>
                    </th>
                </thead>
                <tbody>
                    {this.props.cabins.map(function(cabin) {
                        return (
                            <tr>
                                <td>{cabin.name}</td>
                                <td>{cabin.description}</td>
                                <td>{cabin.capacity}</td>
                                <td>{cabin.price}</td>
                                <td></td>
                                <td></td>
                            </tr>
                        );
                     }, this)}
                </tbody>
            </table>
        );
    }
});

var CabinDialog = React.createClass({
    getInitialState: function() {
        return {
            cabinName: '',
            description: '',
            capacity: null,
            price: null,
            formValid: true
        };
    },
    saveCabin: function(event) {
        event.preventDefault();
        if(!this.validate()) {
            this.setState({formValid: false});
        } else {
            this.props.closeDialog(event);
        }
    },
    validate: function() {
        var fieldsValid = true;
        _.each(this.refs, function(field) {
            if(field.props.required && (!field.getValue() || field.getValue() == '')) {
                field.state.isValid = false;
                fieldsValid = false;
            }
        });
        return fieldsValid;
    },
    closeCabinDialog: function(event) {
        this.props.closeDialog(event);
    },
    render: function() {
        return (
            <div id='cabinDialog'>
                <form onSubmit={this.saveCabin} className='form-horizontal'>
                    <InputComponent type="text" placeholder="Insert cabin name" label="Cabin name:" id="nameField" ref="cabinName" value={this.state.cabinName} errorMessage='Name is mandatory' required='true'/>
                    <TextAreaComponent placeholder="Insert cabin description" label="Cabin description:" id="descriptionField" ref="cabinDescription" value={this.state.description} />
                    <InputComponent type="number" placeholder="Insert cabin capacity" label="Cabin capacity:" id="capacityField" ref="cabinCapacity" value={this.state.capacity} errorMessage='Capacity is mandatory' required='true'/>
                    <InputComponent type="number" placeholder="Insert cabin price" label="Cabin price:" id="priceField" ref="cabinPrice" value={this.state.price} errorMessage='Price is mandatory' required='true'/>
                    <ButtonComponent type="submit" value="Save cabin" class="btn btn-success" />
                    <ButtonComponent type="button" value="Cancel" class="btn" onClick={this.closeCabinDialog}/>
                </form>
            </div>
        );
    }

});

React.render(<CabinPageView />, document.getElementById('cabins'));