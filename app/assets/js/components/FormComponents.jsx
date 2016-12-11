import React from 'react';
import $ from 'jquery';
import Datetime from 'react-datetime';
import validator from 'validator';
import _ from 'underscore';
import { FormGroup, ControlLabel, FormControl, Col, Checkbox } from 'react-bootstrap';

require('react-datetime/css/react-datetime.css')

validator.extend('isValue', function (str) {
    if(str != '') {
        return true;
    } else {
        return false;
    }
});

var RegisteredComponentSection = React.createClass({
    getInitialState: function() {
        return {model: {}};
    },
    componentWillMount: function() {
        this.elements = {};
        this.children = this.registerChildren(this.props.children);
    },
    componentDidMount: function() {
        this.componentWillReceiveProps(this.props);
    },
    componentWillUpdate: function(nextProps, nextState) {
        if(!this.elements) {
            this.elements = {};
            this.children = this.registerChildren(nextProps.children);
        }
    },
    componentWillReceiveProps: function(nextProps) {
        if(nextProps.model) {
            this.bindExistingValuesToFields(nextProps.model);
        }
    },
    bindExistingValuesToFields: function(model) {
        for(name in model) {
            if(this.elements[name]) {
                this.elements[name].setState({value: model[name]});
            }
        }
    },
    getModel: function() {
        return this.state.model;
    },
    preserveFieldUniqueness: function(component) {
        this.props.preserveFieldUniqueness(component);
    },
    registerUniqueField: function(component) {
        this.props.registerUniqueField(component);
    },
    disableFragment: function(component) {
        _.each(this.elements, function(element) {
            if(component.props.name != element.props.name) {
                element.setDisabled(!element.state.disabled);
            }
        });
    },
    registerChildren: function(children) {
        var clonedChildren = React.Children.map(children, function(child) {
            var childProps = [];
            if(child.props && child.props.children) {
              child = React.cloneElement(child, {children: this.registerChildren(child.props.children) });
            }
            if(child.props && child.props.name) {
                var unique = this.props.uniqueFormFields ? $.inArray(child.props.name, this.props.uniqueFormFields) != -1 : false;
                var uniquenessHandler = unique ? this.preserveFieldUniqueness : null;
                var uniquenessRegisterer = unique ? this.registerUniqueField : null;
                var disableFormHandler = child.props.disableForm ? this.disableFragment : null;
                return React.cloneElement(child, {attachToForm: this.attachToForm, detachFromForm: this.detachFromForm, validate: this.validate,
                    children: child.props.children, preserveFieldUniqueness: uniquenessHandler,
                    registerUniqueField: uniquenessRegisterer, disableForm: disableFormHandler});
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
            if(this.elements[name]) {
                this.state.model[name] = this.elements[name].state.value;
            }
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
    validateSection: function() {
        var fragmentValid = true;
        var elements = this.elements;
        Object.keys(elements).forEach(function(name) {
            var component = elements[name];
            var isComponentValid = component.props.validate(component);
            if(!isComponentValid) {
                fragmentValid = false;
            }
        });
        return fragmentValid;
    },
    setErrorsToInputs: function(errors) {
        Object.keys(errors).forEach(function(name, index) {
            var component = this.elements[name];
            component.setState({isValid: false, serverError: errors[name]});
        }.bind(this));
        this.setState({isSubmitting: false}, this.validateForm)
    },
    getInputComponentByName: function(name, domTree) {
        console.log(this.refs);
        var matchingElement = React.Children.map(domTree, function(child) {
            if(child.props && child.props.children) {
                var matchingChild = this.getInputComponentByName(name, child.props.children);
                return matchingChild;
            } else {
                if(child.props && child.props.name == name) {
                    return child;
                }
                return null;
            }
        }, this);
        return matchingElement;
    },
    render: function() {
        return (
            <div>
                {this.children}
            </div>
        );
    }
});

var FormFragment = React.createClass({
    getInitialState: function() {
        return {
            fragmentValid: true
        };
    },
    componentDidMount: function() {

    },
    validateFragment: function() {
        return this.section.validateSection();
    },
    updateModel: function() {
        return this.section.updateModel();
    },
    getModel: function() {
        return this.section.getModel();
    },
    getComponentByName: function(name) {
        return this.section.getInputComponentByName(name, this.refs.wrapper.children);
    },
    preserveFieldUniqueness: function(component) {
        this.props.preserveFieldUniqueness(component);
    },
    registerUniqueField: function(component) {
        this.props.registerUniqueField(component);
    },
    render: function() {
        return (
            <RegisteredComponentSection ref={(section) => this.section = section} uniqueFormFields={this.props.uniqueFormFields} preserveFieldUniqueness={this.preserveFieldUniqueness} registerUniqueField={this.registerUniqueField}>
                {this.props.children}
            </RegisteredComponentSection>
        );
    }
});

var MultiModelForm = React.createClass({
    propTypes: function() {
        onSubmit: React.PropTypes.func.isRequired
    },
    getInitialState: function() {
        return {
            isSubmitting:  false,
            formValid: true,
        };
    },
    componentWillMount: function() {
        this.uniqueModelValues = [];
        this.fragmentRefs = [];
        this.fragments = this.getFragments(this.props.children);
    },
    componentWillUpdate: function(nextProps, nextState) {
        this.uniqueModelValues = [];
        this.fragmentRefs = [];
        this.fragments = this.getFragments(nextProps.children);
    },
    getFragments: function(children) {
        var flattenedChilds = _.flatten(children);
        return _.filter(flattenedChilds, function(child) { return child.type && (child.type.displayName == 'FormFragment'); });
    },
    updateModels: function() {
        var formModels = [];
        this.fragmentRefs.forEach( ref => {
            ref.updateModel();
            formModels.push(ref.getModel());
        });
        return formModels;
    },
    submitForm: function(event) {
        event.preventDefault();
        if(this.validateForm()) {
            this.setState({isSubmitting: true, formValid: true});
            var formModels = this.updateModels();
            this.props.onSubmit(formModels);
        } else {
            this.setState({isSubmitting: false, formValid: false});
        }
    },
    validateForm: function() {
        let fragmentValid = true;
        this.fragmentRefs.forEach( ref => {
          let isFragmentValid = ref.validateFragment();
          if(!isFragmentValid) {
              fragmentValid = false;
          }
        });
        return fragmentValid;
    },
    registerUniqueAttributeField: function(component) {
        this.uniqueModelValues.push(component);
    },
    preserveFieldUniqueness: function(component) {
        _.each(this.uniqueModelValues, function(field) {
            field.setState({value: 0});
        });
    },
    addRef(ref) {
      this.fragmentRefs = [...this.fragmentRefs, ref];
    },
    render: function() {
      let thisContext = this;
        let children = React.Children.map(this.props.children, function (child, index) {
            if(child.type && (child.type.displayName == 'FormFragment')) {
                return React.cloneElement(child, { ref: this.addRef,
                  uniqueFormFields: this.props.uniqueFormFields, preserveFieldUniqueness: this.preserveFieldUniqueness,
                  registerUniqueField: this.registerUniqueAttributeField});
            } else {
                return child;
            }
        }, this);
        return (
            <form onSubmit={this.submitForm} className='form-horizontal'>
                {children}
            </form>
        );
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
            formValid: true
        };
    },
    submitForm: function(event) {
        event.preventDefault();
        if(this.validateForm()) {
            this.setState({isSubmitting: true, formValid: true});
            this.formSection.updateModel();
            this.props.onSubmit(this.formSection.getModel());
        } else {
            this.setState({isSubmitting: false, formValid: false});
        }
    },
    validateForm: function() {
        return this.formSection.validateSection();
    },
    render: function() {
        return (
            <form onSubmit={this.submitForm} className='form-horizontal'>
                <RegisteredComponentSection model={this.props.model} ref={(input) => { this.formSection = input; }}>
                    {this.props.children}
                </RegisteredComponentSection>
            </form>
        );
    }
});

var DateInputWrapper = React.createClass({
    getInitialState: function() {
        return {value: this.props.value || ''};
    },
    componentWillMount: function() {
        if(this.props.attachToForm) {
            this.props.attachToForm(this);
        }
    },
    componentWillUnMount: function() {
        this.props.detachFromForm(this);
    },
    handleChange: function(event) {
        this.setState({value: event});
    },
    render: function() {
        return(
            <FormGroup >
              <Col componentClass={ControlLabel} sm={2}>
                {this.props.label}
              </Col>
              <Col sm={10}>
                <Datetime name={this.props.name} value={this.state.value} placeholder={this.props.placeholder} id={this.props.id}
                  onChange={this.handleChange} disabled={this.state.disabled} />
              </Col>
            </FormGroup>
        );
    }
});

var InputWrapper = React.createClass({
    getInitialState: function() {
        return {value: this.props.value || '', isValid: true, serverErrors: null, disabled: this.props.disabled || false};
    },
    componentWillMount: function() {
        if(this.props.attachToForm) {
            this.props.attachToForm(this);
        }
        if(this.props.registerUniqueField) {
            this.props.registerUniqueField(this);
        }
    },
    componentWillUnMount: function() {
        this.props.detachFromForm(this);
    },
    handleChange: function(event) {
        if(this.props.preserveFieldUniqueness) {
            this.props.preserveFieldUniqueness(this);
        }
        this.setState({value: event.target.value});
        if(this.props.disableForm) {
            this.props.disableForm(this);
        }
    },
    setDisabled: function(disabled) {
        this.setState({disabled: disabled});
    },
    render: function() {
        return(
            <FormGroup >
              <Col componentClass={ControlLabel} sm={2}>
                {this.props.label}
              </Col>
              <Col sm={10}>
                <FormControl type={this.props.type} name={this.props.name} value={this.state.value}
                        placeholder={this.props.placeholder} id={this.props.id} name={this.props.name}
                        required={this.props.required} onChange={this.handleChange} disabled={this.state.disabled}
                        maxLength={this.props.maxlength} />
              </Col>
            </FormGroup>
        );
    }
});

var SelectWrapper = React.createClass({
    getInitialState: function() {
        return {value: this.props.value || '', isValid: true, serverErrors: null, disabled: this.props.disabled || false};
    },
    componentWillMount: function() {
        if(this.props.attachToForm) {
            this.props.attachToForm(this);
        }
        if(this.props.registerUniqueField) {
            this.props.registerUniqueField(this);
        }
    },
    componentWillUnMount: function() {
        this.props.detachFromForm(this);
    },
    handleChange: function(event) {
        if(this.props.preserveFieldUniqueness) {
            this.props.preserveFieldUniqueness(this);
        }
        this.setState({value: event.target.value});
    },
    setDisabled: function(disabled) {
        this.setState({disabled: disabled});
    },
    render: function() {
        return(
            <FormGroup >
              <Col componentClass={ControlLabel} sm={2}>
                {this.props.label}
              </Col>
              <Col sm={10}>
                <FormControl componentClass="select" name={this.props.name} value={this.state.value}
                        placeholder={this.props.placeholder} id={this.props.id} name={this.props.name}
                        required={this.props.required} onChange={this.handleChange} disabled={this.state.disabled}
                        maxLength={this.props.maxlength} >
                  { this.props.children }
                </FormControl>
              </Col>
            </FormGroup>
        );
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

var CheckboxWrapper = React.createClass({
    getInitialState: function() {
        return {value: this.props.value || '', isValid: true, serverErrors: null, disabled: this.props.disabled || false};
    },
    componentWillMount: function() {
        if(this.props.attachToForm) {
            this.props.attachToForm(this);
        }
        if(this.props.registerUniqueField) {
            this.props.registerUniqueField(this);
        }
    },
    componentWillUnMount: function() {
        this.props.detachFromForm(this);
    },
    handleChange: function(event) {
        if(this.props.preserveFieldUniqueness) {
            this.props.preserveFieldUniqueness(this);
        }
        this.setState({value: !this.state.value});
        if(this.props.disableForm) {
            this.props.disableForm(this);
        }
    },
    setDisabled: function(disabled) {
        this.setState({disabled: disabled});
    },
    render: function() {
        return(
            <FormGroup >
              <Col componentClass={ControlLabel} sm={2}>
                {this.props.label}
              </Col>
              <Col sm={10}>
                <Checkbox checked={this.state.value} name={this.props.name} id={this.props.id}
                  required={this.props.required} onChange={this.handleChange} disabled={this.state.disabled} />
              </Col>
            </FormGroup>
        );
    }
});




export { ButtonComponent, Form, FormFragment, MultiModelForm, InputWrapper, DateInputWrapper, CheckboxWrapper, SelectWrapper};
