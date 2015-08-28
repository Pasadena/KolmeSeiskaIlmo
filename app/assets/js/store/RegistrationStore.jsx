define(['dispatcher/AppDispatcher', 'AmdEvents'], function(AppDispatcher, Events) {

    var event = {}, registrations = [];

    function loadRegistrationData(data) {
        event = data['event'];
        registrations = data['registrations'];
    }

    var RegistrationStore = _.extend({}, Events.EventEmitter.prototype, {

        getEvent: function() {
            return event;
        },
        getRegistrations: function() {
            return registrations;
        },
        emitChange: function() {
            this.emit('change');
        },
        addChangeListener: function(callback) {
            this.on('change', callback);
        },
        removeChangeListener: function(callback) {
            this.removeListener('change', callback);
        }
    });

    AppDispatcher.register(function(payload) {
        var action = payload.action;

        switch(action.actionType) {
            case "LOAD_EVENT":
                loadRegistrationData(action.data);
                break;
            default:
                return true;
        }
        RegistrationStore.emitChange();

        return true;
    });

    return RegistrationStore;
});