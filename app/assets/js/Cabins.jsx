import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import _ from 'underscore';
import {ButtonComponent, InputComponent, TextAreaComponent, Form, InputWrapper} from './components/FormComponents';
import { Button, Modal, ButtonToolbar } from 'react-bootstrap';

var CabinPageView = React.createClass({
    getInitialState: function() {
        return {cabins: [], selectedCabin: null, modalOpen: false};
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
    closeDialog: function() {
        this.setState({modalOpen: false});
    },
    editSelectedCabin: function(cabin) {
        this.setState({selectedCabin: cabin, modalOpen: true});
    },
    createCabin: function(event) {
        event.preventDefault();
        this.setState({modalOpen: true});
    },
    backToIndex: function(event) {
        event.preventDefault();
        window.location.href="/admin";
    },
    render: function() {
        return (
            <div>
                <Alerts ref='alerts' />
                <Button bsStyle="primary" onClick={this.backToIndex}>Back</Button>
                <div className="panel panel-default">
                    <div className="panel-heading">
                        <h3 className="panel-title">Cabins</h3>
                    </div>
                    <CabinListView cabins={this.state.cabins} editCabinHandler={this.editSelectedCabin} deleteCabinHandler={this.deleteSelectedCabin}/>
                </div>
                <a className="btn btn-success" onClick={this.createCabin}>Create cabin</a>
                <CabinDialog closeDialog={this.closeDialog} onSuccess={this.addCabinToList} cabin={this.state.selectedCabin} show={this.state.modalOpen}/>
            </div>
        );
    }
});

var Alerts = React.createClass({
    getInitialState: function() {
        return {alertItems: []};
    },
    addAlert: function(message, status) {
        var item = React.createElement(AlertItem, {message: message, key: this.state.alertItems.length +1,
          levelClass: this.parseClassFromStatus(status)});
        this.state.alertItems.push(item);
        this.setState({alertItems: this.state.alertItems});
        setTimeout(function() {
            var element = document.getElementById('foo');
            ReactDOM.unmountComponentAtNode(element);
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
    editCabin: function(cabin, event) {
        event.preventDefault();
        this.props.editCabinHandler(cabin);
    },
    deleteCabin: function(cabin, event) {
        event.preventDefault();
        this.props.deleteCabinHandler(cabin);
    },
    render: function() {
        return (
            <table className="table table-striped">
                <thead>
                    <tr>
                        <td>Nimi</td>
                        <td>Kuvaus</td>
                        <td>Koko</td>
                        <td>Hinta</td>
                        <td></td>
                    </tr>
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
                                        <ButtonComponent type="submit" value="Edit cabin" class="btn btn-success" onClick={this.editCabin.bind(this, cabin)} />
                                    </div>
                                    <div className="list-form">
                                        <ButtonComponent type="submit" value="Delete" class="btn btn-danger" onClick={this.deleteCabin.bind(this, cabin)}/>
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
            cabin: null
        };
    },
    componentDidMount: function() {
        if(this.props.cabin) {
            this.setState({cabin: this.props.cabin});
        }
    },
    saveCabin: function(model) {
        var cabinId = this.props.cabin != null ? this.props.cabin.id : null;
        var capacity = parseInt(model["capacity"], 10);
        var price = parseFloat(model["price"]);
        model["id"] = cabinId;
        model["capacity"] = capacity;
        model["price"] = price;
        this.saveToDb(model);
        this.setState(this.getInitialState());
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
                this.props.closeDialog();
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(status, err.toString());
            }.bind(this)
        });
    },
    closeCabinDialog: function(event) {
        this.props.closeDialog(event);
    },
    dismiss: function(event) {
        this.props.close();
    },
    render: function() {
        var modalTitle = this.props.cabin ? "Edit cabin details" : "Create cabin";
        var cabin = this.props.cabin ? this.props.cabin : {}
        return (
            <Modal onHide={this.dismiss} show={this.props.show} bsStyle="primary" title={modalTitle}>
                <Form onSubmit={this.saveCabin} model={this.props.cabin}>
                    <Modal.Header>
                        <Modal.Title>{modalTitle}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <InputWrapper type="text" name="name" placeholder="Insert cabin name" label="Cabin name:"
                          id="nameField" errorMessage='Name is mandatory' required='true' labelClassName="col-sm-3 control-label"
                          wrapperClassName="col-xs-6"/>
                        <InputWrapper type="textarea" name="description" placeholder="Insert cabin description"
                          label="Cabin description:" id="descriptionField" labelClassName="col-sm-3 control-label"
                          wrapperClassName="col-xs-6"/>
                        <InputWrapper type="number" name="capacity" placeholder="Insert cabin capacity" label="Cabin capacity:"
                          id="capacityField" errorMessage='Capacity is mandatory' required='true'
                          labelClassName="col-sm-3 control-label" wrapperClassName="col-xs-6"/>
                        <InputWrapper type="number" name="price" placeholder="Insert cabin price" label="Cabin price:"
                          id="priceField" errorMessage='Price is mandatory' required='true'
                          labelClassName="col-sm-3 control-label" wrapperClassName="col-xs-6"/>
                    </Modal.Body>
                    <Modal.Footer>
                        <ButtonToolbar>
                            <Button type="submit" bsStyle="success">Save cabin</Button>
                            <Button type="button" className="btn" onClick={this.closeCabinDialog}>Cancel</Button>
                        </ButtonToolbar>
                    </Modal.Footer>
                </Form>
            </Modal>
        );
    }

});
export default CabinPageView;
