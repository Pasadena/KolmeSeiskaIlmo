var MyComponent = React.createClass({
  render: function() {
    return (
      <h1>Howdy</h1>
    );
  }
});

React.render(<MyComponent />, document.getElementById('events'));