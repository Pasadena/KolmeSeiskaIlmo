define(function(require){
    var Dispatcher = require('flux').Dispatcher;

    Dispatcher.prototype.handleAction = function(action) {
        this.dispatch({
            source: "VIEW_ACTION",
            action: action
        });
    }

    return new Dispatcher();
});