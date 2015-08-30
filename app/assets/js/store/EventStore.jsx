define(['dispatcher/AppDispatcher', 'AmdEvents'], function(AppDispatcher, Events) {

    var events = [], selectedEvent = null, loadState = false, messageData = {};

    function setEvents(data) {
        events = data['events'];
    }

    function setSelectedEvent(data) {
        var eventPayload = data['event'];
        selectedEvent = eventPayload.event;
        selectedEvent.cabins = eventPayload.cabins
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
                updateLoadState(true);
                break;
            case "LOAD_EVENTS_SUCCESS":
                updateLoadState(false);
                setEvents(action.data);
                break;
            case "LOAD_EVENT":
                updateLoadState(true);
                break;
            case "LOAD_EVENT_SUCCESS":
                setSelectedEvent(action.data);
                break;
            case "SAVE_EVENT":
                updateLoadState(true);
                break;
            case "SAVE_EVENT_SUCCESS":
                updateLoadState(false);
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