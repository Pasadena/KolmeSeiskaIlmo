var InputComponent = React.createClass({
    getInitialState: function() {
        return {value: '', isValid: true};
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
                    <input type={this.props.type} placeholder={this.props.placeholder} id={this.props.id} ref={this.props.ref} value={this.state.value} onChange={this.handleChange}/>
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
        return {value: ''};
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
        return (
            <div className="form-group">
                <label className="col-sm-2 control-label" htmlFor={this.props.id}>{this.props.label}</label>
                <div className="col-sm-10">
                    <textarea placeholder={this.props.placeholder} id={this.props.id} onChange={this.handleChange} value={this.state.value} />
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