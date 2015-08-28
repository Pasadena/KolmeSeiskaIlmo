define(['dispatcher/AppDispatcher', 'AmdEvents'], function(AppDispatcher, Events) {

    var events = [], selectedEvent = null, loadState = false, messageData = {};

    function setEvents(data) {
        events = data['events'];
    }

    function setSelectedEvent(event) {
        selectedEvent = event;
    }

    function addEvent(data) {
        events.push(data['event'][0]);
    }

    function updateLoadState(state) {
        loadState = state;
    }

    function setMessageData(data) {
        messageData = data;
    }

    var EventStore = _.extend({}, Events.EventEmitter.prototype, {

        getEvents: function() {
            return events;
        },
        getSelectedEvent: function() {
            return selectedEvent;
        },
        getMessageData: function() {
            return messageData;
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
            case "LOAD_EVENTS":
                setEvents(action.data);
                break;
            case "SELECT_EVENT":
                setSelectedEvent(action.data);
                break;
            case "SAVE_EVENT":
                updateLoadState(true);
                break;
            case "SAVE_EVENT_SUCCESS":
                updateLoadState(true);
                setMessageData({message: action.data['message'], messageStatus: action.data['status']})
                addEvent(action.data);
                break;
            default:
                return true;
        }
        EventStore.emitChange();

        return true;
    });

    return EventStore;
});