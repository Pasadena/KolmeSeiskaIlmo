define(['react', 'jquery', '../node_modules/validator/validator', 'jqueryui'], function(React, $, validator) {

    validator.extend('isValue', function (str) {
        if(str != '') {
            return true;
        } else {
            return false;
        }
    });

    var Form = React.createClass({
        propTypes: function() {
            onSubmit: React.PropTypes.func.isRequired
            model: React.PropTypes.object;
        },
        getInitialState: function() {
            return {
                isSubmitting:  false,
                formValid: true,
                model: {}
            };
        },
        componentWillMount: function() {
            this.elements = [];
            this.children = this.registerChildren(this.props.children);
        },
        componentWillReceiveProps: function(nextProps) {
            if(nextProps.model) {
                this.bindExistingValuesToFields(nextProps.model);
            }
        },
        bindExistingValuesToFields: function(model) {
            for(name in this.state.model) {
                if(this.elements[name]) {
                    this.elements[name].setState({value: model[name]});
                }
            }
        },
        registerChildren: function(children) {
            var clonedChildren = React.Children.map(children, function(child) {
                if(child.props.children) {
                    this.registerChildren(child.props.children);
                }
                if(child.props.name) {
                    return React.cloneElement(child, {attachToForm: this.attachToForm, detachFromForm: this.detachFromForm, validate: this.validate});
                } else {
                    return child;
                }
            }.bind(this));
            return clonedChildren;
        },
        attachToForm: function(component) {
            this.state.model[component.props.name] = component.state.value;
            this.elements[component.props.name] = component;
            this.validate(component);
        },
        detachFromForm: function(component) {
            delete this.state.model[component.props.name];
            delete this.elements[component.props.name];
        },
        updateModel: function() {
            for (name in this.state.model) {
                this.state.model[name] = this.elements[name].state.value;
            }
        },
        submitForm: function(event) {
            event.preventDefault();
            ;
            if(this.validateForm()) {
                this.setState({isSubmitting: true, formValid: true});
                this.updateModel();
                this.props.onSubmit(this.state.model);
            } else {
                this.setState({isSubmitting: false, formValid: false});
            }
        },
        validate: function(component) {
            if(!component.props.validations) {
                return true;
            }
            var isValid = true;
            if(component.state.value || component.props.required) {
                component.props.validations.split(',').forEach(function(validation) {
                    var args = validation.split(':');
                    var validateMethod = args.shift();
                    args = args.map(function(arg) { return JSON.parse(arg); });
                    args = [component.state.value].concat(args);
                    if(!validator[validateMethod].apply(validator, args)) {
                        isValid = false;
                    }
                });
            }
            component.setState({isValid: isValid, serverError: null});
            return isValid;
        },
        validateForm: function() {
            var formValid = true;
            var elements = this.elements;
            Object.keys(elements).forEach(function(name) {
                var component = elements[name];
                var isComponentValid = component.props.validate(component);
                if(!isComponentValid) {
                    formValid = false;
                }
            });
            return formValid;
        },
        setErrorsToInputs: function(errors) {
            Object.keys(errors).forEach(function(name, index) {
                var component = this.elements[name];
                component.setState({isValid: false, serverError: errors[name]});
            });
            this.setState({isSubmitting: false}, this.validateForm)
        }.bind(this),
        render: function() {
            return (
                <form onSubmit={this.submitForm} className='form-horizontal'>
                    {this.children}
                </form>
            );
        }
    });

    var InputComponent = React.createClass({
        getInitialState: function() {
            return {value: this.props.value || '', isValid: true, serverErrors: null};
        },
        componentWillMount: function() {
            this.props.attachToForm(this);
            if(this.props.required) {
                this.props.validations = this.props.validations ? this.props.validations + "," : "";
                this.props.validations += "isValue";
            }
        },
        componentWillUnMount: function() {
            this.props.detachFromForm(this);
        },
        componentDidMount: function() {
            if(this.props.type && this.props.type == 'datepicker') {
                var id = this.props.id;
                $('#' +id).datepicker({
                    dateFormat: 'd.m.yy',
                    onSelect: function(date) {
                        this.setState({value: date});
                    }.bind(this)
                });
            }
        },
        componentWillReceiveProps: function(nextProps) {
            if(nextProps.value) {
                this.setState({value: nextProps.value});
            }
        },
        handleChange: function(event) {
            this.setState({value: event.target.value});
        },
        getValue: function() {
            return this.state.value;
        },
        clear: function() {
            this.setState(this.getInitialState());
        },
        render: function() {
            var label = this.props.required ? '*' + this.props.label : this.props.label;
            return (

                <div className="form-group">
                    <label className="col-sm-2 control-label" htmlFor={this.props.id}>{label}</label>
                    <div className="col-sm-10">
                        <input type={this.props.type} name={this.props.name} placeholder={this.props.placeholder} id={this.props.id} ref={this.props.ref} value={this.state.value} onChange={this.handleChange}/>
                        <span className="help-block">{this.props.help}</span>
                        <div className="has-error">
                            <span className="help-block error">{this.state.isValid ? null : this.props.errorMessage}</span>
                        </div>
                    </div>
                </div>
            )
        }
    });

    var TextAreaComponent = React.createClass({
        getInitialState: function() {
            return {value: this.props.value || '', isValid: true, serverErrors: null};
        },
        componentWillMount: function() {
            this.props.attachToForm(this);
            if(this.props.required) {
                this.props.validations = this.props.validations ? this.props.validations + "," : "";
                this.props.validations += "isValue";
            }
        },
        componentWillUnMount: function() {
            this.props.detachFromForm(this);
        },
        componentWillReceiveProps: function(nextProps) {
            if(nextProps.value) {
                this.setState({value: nextProps.value});
            }
        },
        handleChange: function(event) {
            this.setState({value: event.target.value}, function() {
                this.props.validate(this);
            }.bind(this));
        },
        getValue: function() {
            return this.state.value;
        },
        clear: function() {
            this.setState(this.getInitialState());
        },
        render: function() {
            return (
                <div className="form-group">
                    <label className="col-sm-2 control-label" htmlFor={this.props.id}>{this.props.label}</label>
                    <div className="col-sm-10">
                        <textarea placeholder={this.props.placeholder} name={this.props.name} id={this.props.id} onChange={this.handleChange} value={this.state.value} />
                        <span className="help-block">{this.props.help}</span>
                    </div>
                </div>
            )
        }
    });

    var ButtonComponent = React.createClass({
        render: function() {
            return (
                <div className="form-group">
                    <div className="col-sm-offset-2 col-sm-10">
                        <button type={this.props.type} className={this.props.class} onClick={this.props.onClick}>{this.props.value}</button>
                    </div>
                </div>
            )
        }
    });
    return {InputComponent: InputComponent, TextAreaComponent: TextAreaComponent, ButtonComponent: ButtonComponent, Form: Form};
});