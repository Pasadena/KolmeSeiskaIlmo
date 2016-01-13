define(['react', 'jquery', '../node_modules/validator/validator', 'underscore', 'react-bootstrap', 'jqueryui'], function(React, $, validator, _, RB) {

    var Input = RB.Input;

    validator.extend('isValue', function (str) {
        if(str != '') {
            return true;
        } else {
            return false;
        }
    });

    var RegisteredComponentSection = React.createClass({displayName: "RegisteredComponentSection",
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
        componentDidUpdate: function(prevProps, prevState) {
            {/**_.each(this.elements, function(element) {
                element.setDisabled(false);
            });**/}
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
                var childProps;
                if(child.props && child.props.children) {
                    child.props.children = this.registerChildren(child.props.children);
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
                React.createElement("div", null, 
                    this.children
                )
            );
        }
    });

    var FormFragment = React.createClass({displayName: "FormFragment",
        getInitialState: function() {
            return {
                fragmentValid: true
            };
        },
        componentDidMount: function() {

        },
        validateFragment: function() {
            return this.refs.wrapper.validateSection();
        },
        updateModel: function() {
            return this.refs.wrapper.updateModel();
        },
        getModel: function() {
            return this.refs.wrapper.getModel();
        },
        getComponentByName(name) {
            return this.refs.wrapper.getInputComponentByName(name, this.refs.wrapper.children);
        },
        preserveFieldUniqueness: function(component) {
            this.props.preserveFieldUniqueness(component);
        },
        registerUniqueField: function(component) {
            this.props.registerUniqueField(component);
        },
        render: function() {
            return (
                React.createElement(RegisteredComponentSection, {ref: "wrapper", uniqueFormFields: this.props.uniqueFormFields, preserveFieldUniqueness: this.preserveFieldUniqueness, registerUniqueField: this.registerUniqueField}, 
                    this.props.children
                )
            );
        }
    });

    var MultiModelForm = React.createClass({displayName: "MultiModelForm",
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
            this.fragments = this.getFragments(this.props.children);
        },
        componentWillUpdate: function(nextProps, nextState) {
            this.uniqueModelValues = [];
            this.fragments = this.getFragments(nextProps.children);
        },
        getFragments: function(children) {
            var flattenedChilds = _.flatten(children);
            return _.filter(flattenedChilds, function(child) { return child.type && (child.type.displayName == 'FormFragment'); });
        },
        updateModels: function() {
            var formModels = [];
            for(refIndex in this.refs) {
                var fragmentRef = this.refs[refIndex];
                fragmentRef.updateModel();
                formModels.push(fragmentRef.getModel());
            }
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
            var fragmentValid = true;
            for(refIndex in this.refs) {
                var fragmentRef = this.refs[refIndex];
                var isFragmentValid = fragmentRef.validateFragment();
                if(!isFragmentValid) {
                    fragmentValid = false;
                }
            }
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
        render: function() {
            var index = 0,
            children = React.Children.map(this.props.children, function (child) {
                if(child.type && (child.type.displayName == 'FormFragment')) {
                    return React.cloneElement(child, { ref: (index++), uniqueFormFields: this.props.uniqueFormFields, preserveFieldUniqueness: this.preserveFieldUniqueness, registerUniqueField: this.registerUniqueAttributeField});
                } else {
                    return child;
                }
            }, this);
            return (
                React.createElement("form", {onSubmit: this.submitForm, className: "form-horizontal"}, 
                    children
                )
            );
        }
    });

    var Form = React.createClass({displayName: "Form",
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
                this.refs.formSection.updateModel();
                this.props.onSubmit(this.refs.formSection.getModel());
            } else {
                this.setState({isSubmitting: false, formValid: false});
            }
        },
        validateForm: function() {
            return this.refs.formSection.validateSection();
        },
        render: function() {
            return (
                React.createElement("form", {onSubmit: this.submitForm, className: "form-horizontal"}, 
                    React.createElement(RegisteredComponentSection, {model: this.props.model, ref: "formSection"}, 
                        this.props.children
                    )
                )
            );
        }
    });

    var DateInputWrapper = React.createClass({displayName: "DateInputWrapper",
        getInitialState: function() {
            return {value: this.props.value || ''};
        },
        componentDidMount: function() {
            var id = this.props.id;
            $('#' +id).datepicker({
                dateFormat: 'd.m.yy',
                onSelect: function(date) {
                    this.setState({value: date});
                }.bind(this)
            });
            if(this.props.attachToForm) {
                this.props.attachToForm(this);
            }
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
            this.setState({value: event.target.value});
        },
        render: function() {
            return(
                React.createElement(Input, {type: this.props.type, name: this.props.name, value: this.state.value, placeholder: this.props.placeholder, label: this.props.label, id: this.props.id, 
                    name: this.props.name, labelClassName: this.props.labelClassName, wrapperClassName: this.props.wrapperClassName, required: this.props.required, onChange: this.handleChange}, 
                    this.props.children
                )
            );
        }
    });

    var InputWrapper = React.createClass({displayName: "InputWrapper",
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
            if(this.props.type == 'checkbox') {
                $("#" +this.props.id).prop("checked", this.state.value ==1 ? "true": "false");
                this.setState({value: this.state.value == 1 ? 0 : 1});
            } else {
                this.setState({value: event.target.value});
            }
            if(this.props.disableForm) {
                this.props.disableForm(this);
            }
        },
        setDisabled: function(disabled) {
            this.setState({disabled: disabled});
        },
        render: function() {
            if(this.props.type == 'checkbox') {
                $("#" +this.props.id).attr('checked', this.state.value == 1 ? true: false);
            }
            return(
                React.createElement(Input, {type: this.props.type, name: this.props.name, value: this.state.value, 
                        placeholder: this.props.placeholder, label: this.props.label, id: this.props.id, name: this.props.name, 
                        labelClassName: this.props.labelClassName, wrapperClassName: this.props.wrapperClassName, 
                        required: this.props.required, onChange: this.handleChange, disabled: this.state.disabled, 
                        maxLength: this.props.maxlength}, 
                    this.props.children
                )
            );
        }
    });

    var InputComponent = React.createClass({displayName: "InputComponent",
        getInitialState: function() {
            return {value: this.props.value || '', isValid: true, serverErrors: null};
        },
        componentWillMount: function() {
            if(this.props.attachToForm) {
                this.props.attachToForm(this);
            }
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
                React.createElement("div", {className: "form-group"}, 
                    React.createElement("label", {className: "col-sm-2 control-label", htmlFor: this.props.id}, label), 
                    React.createElement("div", {className: "col-sm-10"}, 
                        React.createElement("input", {type: this.props.type, name: this.props.name, placeholder: this.props.placeholder, id: this.props.id, ref: this.props.ref, value: this.state.value, onChange: this.handleChange}), 
                        React.createElement("span", {className: "help-block"}, this.props.help), 
                        React.createElement("div", {className: "has-error"}, 
                            React.createElement("span", {className: "help-block error"}, this.state.isValid ? null : this.props.errorMessage)
                        )
                    )
                )
            )
        }
    });

    var TextAreaComponent = React.createClass({displayName: "TextAreaComponent",
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
                React.createElement("div", {className: "form-group"}, 
                    React.createElement("label", {className: "col-sm-2 control-label", htmlFor: this.props.id}, this.props.label), 
                    React.createElement("div", {className: "col-sm-10"}, 
                        React.createElement("textarea", {placeholder: this.props.placeholder, name: this.props.name, id: this.props.id, onChange: this.handleChange, value: this.state.value}), 
                        React.createElement("span", {className: "help-block"}, this.props.help)
                    )
                )
            )
        }
    });

    var ButtonComponent = React.createClass({displayName: "ButtonComponent",
        render: function() {
            return (
                React.createElement("div", {className: "form-group"}, 
                    React.createElement("div", {className: "col-sm-offset-2 col-sm-10"}, 
                        React.createElement("button", {type: this.props.type, className: this.props.class, onClick: this.props.onClick}, this.props.value)
                    )
                )
            )
        }
    });
    return {InputComponent: InputComponent, TextAreaComponent: TextAreaComponent, ButtonComponent: ButtonComponent, Form: Form, FormFragment: FormFragment, MultiModelForm: MultiModelForm, InputWrapper: InputWrapper, DateInputWrapper: DateInputWrapper};
});