var AdminLayout = React.createClass({
    render: function() {
        return (
            <section>
                <h1>Browse admin sections</h1>
                <AdminSection name="Events" page="/admin/events"/>
                <AdminSection name="Cabins" page="/admin/cabins"/>
            </section>
        );
    }
});

var AdminSection = React.createClass({
    navigate: function() {
        var url = this.props.page
        window.location = url
    },
    render: function() {
        return (
            <div className="admin-section" onClick={this.navigate.bind(this)}>
                {this.props.name}
            </div>
        );
    }
});

React.render(<AdminLayout />, document.getElementById('adminSections'));