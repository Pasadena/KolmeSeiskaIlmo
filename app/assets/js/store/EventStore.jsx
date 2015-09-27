define(['dispatcher/AppDispatcher', 'AmdEvents'], function(AppDispatcher, Events) {

    var events = [], selectedEvent = null, loadState = false, messageData = {}, modalOpen = false ;

    function setEvents(data) {
        events = data['events'];
    }

    function setSelectedEvent(data) {
        var eventPayload = data['event'];
        selectedEvent = eventPayload.event;
        selectedEvent.cabins = eventPayload.cabins
    }

    function discardSelectedEvent() {
       selectedEvent = null;
    }

    function addEvent(data) {
        var payloadEvent = data['event'][0];
        var existingEvent = _.find(events, function(event) {
            return event.id == payloadEvent.id;
        });
        if(existingEvent) {
            updateEvent(payloadEvent);
        } else {
            events.push(payloadEvent);
        }
    }

    function updateEvent(event) {
        events = _.map(events, function(item) {
            if(item.id == event.id) {
                item = event;
            }
            return item;
        });
    }

    function removeEvent(eventId) {
        events = _.filter(events, function(event) {
            return event.id != eventId;
        });
    }

    function updateLoadState(state) {
        loadState = state;
    }

    function setMessageData(data) {
        messageData = data;
    }

    function setModalState(state) {
        modalOpen = state;
    }

    var EventStore = _.extend({}, Events.EventEmitter.prototype, {

        getEvents: function() {
            return events;
        },
        getSelectedEvent: function() {
            return selectedEvent;
        },
        getModalState: function() {
            return modalOpen;
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
                setModalState(true);
                break;
            case "SAVE_EVENT":
                updateLoadState(true);
                break;
            case "SAVE_EVENT_SUCCESS":
                updateLoadState(false);
                setModalState(false);
                setMessageData({message: action.data['message'], messageStatus: action.data['status']});
                addEvent(action.data);
                break;
            case "DELETE_EVENT":
                updateLoadState(true);
                break;
            case "DELETE_EVENT_SUCCESS":
                updateLoadState(false);
                setMessageData({message: action.data.data['message'], messageStatus: action.data.data['status']});
                removeEvent(action.data.eventId);
                break;
            case "CLOSE_EVENT_DIALOG":
                updateLoadState(false);
                setModalState(false);
                discardSelectedEvent();
                break;
            default:
                return true;
        }
        EventStore.emitChange();

        return true;
    });

    return EventStore;
});