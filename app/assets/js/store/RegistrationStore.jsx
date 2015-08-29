define(['dispatcher/AppDispatcher', 'AmdEvents'], function(AppDispatcher, Events) {

    var registrations = [], loadState = false, showNotification = false;

    function setRegistrations(data) {
        registrations = data['registrations'];
    }

    function updateLoadState(state) {
        loadState = state;
    }

    function setNotificationState(state) {
        showNotification = state;
    }

    var RegistrationStore = _.extend({}, Events.EventEmitter.prototype, {

        getRegistrations: function() {
            return registrations;
        },
        getNotificationState: function() {
            return showNotification;
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
            case "LOAD_REGISTRATIONS":
                updateLoadState(true);
                break;
            case "LOAD_REGISTRATIONS_SUCCESS":
                updateLoadState(false);
                setRegistrations(action.data);
                setNotificationState(false);
                break;
            case "SAVE_REGISTRATION":
                updateLoadState(true);
                break;
            case "SAVE_REGISTRATION_SUCCESS":
                updateLoadState(false);
                setNotificationState(true);
                break;
            default:
                return true;
        }
        RegistrationStore.emitChange();

        return true;
    });

    return RegistrationStore;
});