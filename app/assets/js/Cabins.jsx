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
    createCabin: function(event) {
        event.preventDefault();
        this.openDialog();
    },
    openDialog: function(cabin) {
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
        React.render(<CabinDialog closeDialog={closeDialog} onSuccess={this.addCabinToList} cabin={cabin}/>, dialog[0]);
    },
    addCabinToList: function(response) {
        var cabinData = response['cabin'];
        var updatedCabinInList = _.find(this.state.cabins, function(cabin) { return cabin.id == cabinData.id});
        if(!updatedCabinInList) {
            this.state.cabins.push(cabinData);
        } else {
            var existingCabinIndex = this.state.cabins.indexOf(updatedCabinInList);
            this.state.cabins[existingCabinIndex] = cabinData;
        }
        this.setState({cabins: this.state.cabins});
        this.refs.alerts.addAlert(response['message'], response['status']);
    },
    loadSelectedCabin: function (cabin) {
        var url = '/admin/cabins/' +cabin.id;
        $.ajax({
            url: url,
            dataType: 'json',
            success: function(data) {
                var fetchedCabin = data['cabin'];
                this.openDialog(fetchedCabin);
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(status, err.toString());
            }.bind(this)
        });
    },
    deleteSelectedCabin: function(cabin) {
        if(confirm('Delete cabin! Really?')) {
            this.ajaxDelete(cabin);
        }
    },
    ajaxDelete: function(cabinData) {
        var url = '/admin/cabins/delete/' +cabinData.id;
        $.ajax({
            url: url,
            type: 'POST',
            success: function(data) {
                var cabinsWithoutDeleted = _.filter(this.state.cabins, function(cabin) {return cabin.id != cabinData.id});
                this.setState({cabins: cabinsWithoutDeleted});
                this.refs.alerts.addAlert(data['message'], data['status']);
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(status, err.toString());
            }.bind(this)
        });
    },
    render: function() {
        return (
            <div>
                <Alerts ref='alerts' />
                <div className="panel panel-default">
                    <div className="panel-heading">
                        <h3 className="panel-title">Cabins</h3>
                    </div>
                    <CabinListView cabins={this.state.cabins} editCabinHandler={this.openDialog} deleteCabinHandler={this.deleteSelectedCabin}/>
                </div>
                <a className="btn btn-success" onClick={this.createCabin}>Create cabin</a>

            </div>
        );
    }
});

var Alerts = React.createClass({
    getInitialState: function() {
        return {alertItems: []};
    },
    addAlert: function(message, status) {
        var item = React.createElement(AlertItem, {message: message, levelClass: this.parseClassFromStatus(status)});
        item.ref = "item";
        this.state.alertItems.push(item);
        this.setState({alertItems: this.state.alertItems});
        setTimeout(function() {
            var element = document.getElementById('foo');
            React.unmountComponentAtNode(element);
            $(element).fadeOut(500, function() { $(element).remove() });
        }, 3000);
    },
    parseClassFromStatus: function(status) {
        if(status == 'Ok') {
            return "success";
        } else {
            return "error";
        }
    },
    render: function() {
        var items = this.state.alertItems.map(function(item) {
            return (item);
        });
        return (
            <div className="alerts">
                {items}
            </div>
        );
    }
});

var AlertItem = React.createClass({
    render: function() {
        var classNameWithLevel = "alert alert-".concat(this.props.levelClass);
        return (
            <div id="foo" className = {classNameWithLevel} role="alert">
                {this.props.message}
            </div>
        );
    }
});

var CabinListView = React.createClass({
    editCabin: function(event, cabin) {
        event.preventDefault();
        this.props.editCabinHandler(cabin);
    },
    deleteCabin: function(event, cabin) {
        event.preventDefault();
        this.props.deleteCabinHandler(cabin);
    },
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
                        </tr>
                    </th>
                </thead>
                <tbody>
                    {this.props.cabins.map(function(cabin) {
                        return (
                            <tr key={cabin.id}>
                                <td>{cabin.name}</td>
                                <td>{cabin.description}</td>
                                <td>{cabin.capacity}</td>
                                <td>{cabin.price}</td>
                                <td>
                                    <div className="list-form">
                                        <ButtonComponent type="submit" value="Edit cabin" class="btn btn-success" onClick={this.editCabin.bind(null, event, cabin)} />
                                    </div>
                                    <div className="list-form">
                                        <ButtonComponent type="submit" value="Delete" class="btn btn-danger" onClick={this.deleteCabin.bind(null, event, cabin)}/>
                                    </div>
                                </td>
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
    componentDidMount: function() {
        if(this.props.cabin) {
            this.setState({cabinName: this.props.cabin.name, description: this.props.cabin.description, capacity: this.props.cabin.capacity, price: this.props.cabin.price});
        }
    },
    saveCabin: function(event) {
        event.preventDefault();
        if(!this.validate()) {
            this.setState({formValid: false});
        } else {
            var capacity = parseInt(this.refs.cabinCapacity.getValue(), 10);
            var price = parseFloat(this.refs.cabinPrice.getValue());
            var cabinId = this.props.cabin != null ? this.props.cabin.id : null;
            this.saveToDb({id: cabinId, name: this.refs.cabinName.getValue(), description: this.refs.cabinDescription.getValue(), capacity: capacity, price: price});
            this.setState(this.getInitialState());
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
    saveToDb: function(cabin) {
        var url = cabin.id != null ? ('/admin/cabins/' + cabin.id) : '/admin/cabins';
        $.ajax({
            url: url,
            contentType: 'application/json',
            dataType: 'json',
            type: "POST",
            data: JSON.stringify(cabin),
            success: function(data) {
                this.props.onSuccess(data);
                this.props.closeDialog(event);
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(status, err.toString());
            }.bind(this)
        });
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