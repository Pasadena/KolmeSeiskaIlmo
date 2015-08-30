define(['dispatcher/AppDispatcher', 'api/EventAPI'], function(AppDispatcher, EventAPI) {

    var EventActions = {

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
        }
    }

    return EventActions;

});