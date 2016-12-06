import AppDispatcher from './../dispatcher/AppDispatcher';
import EventAPI from './../api/EventAPI';

const EventActions = {
    loadEvents: function() {
        EventAPI.fetchEvents();
    },
    loadEventData: function(eventId) {
        AppDispatcher.handleAction({
            actionType: "LOAD_EVENT",
            data: eventId
        });
        EventAPI.fetchEvent(eventId);
    },
    saveEvent: function(payload) {
        AppDispatcher.handleAction({
            actionType: "SAVE_EVENT",
            data: payload.data
        });
        EventAPI.persistEvent(payload);
    },
    deleteEvent: function(eventId) {
        AppDispatcher.handleAction({
            actionType: "DELETE_EVENT",
            data: eventId
        });
        EventAPI.deleteEvent(eventId);
    },
    closeDialog: function() {
        AppDispatcher.handleAction({
            actionType: "CLOSE_EVENT_DIALOG"
        });
    }
}

export default EventActions;
