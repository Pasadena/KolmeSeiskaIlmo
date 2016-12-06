import { Dispatcher } from 'flux';
Dispatcher.prototype.handleAction = function(action) {
    this.dispatch({
        source: "VIEW_ACTION",
        action: action
    });
}

const AppDispatcher = new Dispatcher();

export default AppDispatcher;
