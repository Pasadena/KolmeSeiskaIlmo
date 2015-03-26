var AdminLayout = React.createClass({displayName: "AdminLayout",
    render: function() {
        return (
            React.createElement("section", null, 
                React.createElement("h1", null, "Browse admin sections"), 
                React.createElement(AdminSection, {name: "Events", page: "/admin/events"}), 
                React.createElement(AdminSection, {name: "Cabins", page: "/"})
            )
        );
    }
});

var AdminSection = React.createClass({displayName: "AdminSection",
    navigate: function() {
        var url = this.props.page
        window.location = url
    },
    render: function() {
        return (
            React.createElement("div", {className: "admin-section", onClick: this.navigate.bind(this)}, 
                this.props.name
            )
        );
    }
});

React.render(React.createElement(AdminLayout, null), document.getElementById('adminSections'));