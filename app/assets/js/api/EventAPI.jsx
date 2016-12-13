import AppDispatcher from './../dispatcher/AppDispatcher';
import CommonAPI from './CommonAPI';

const EventAPI = {

    persistEvent: function(payload) {
        CommonAPI.post(payload.data, payload.url)
        .then(function(data) {
            AppDispatcher.handleAction({
                actionType: "SAVE_EVENT_SUCCESS",
                data: data
            });
        }, function(request, status, error) {
            console.error(status, error.toString());
        });
    },

    fetchEvents: function(activeOnly) {
        let onlyActiveEvents = activeOnly ? activeOnly : false;
        CommonAPI.get("/admin/loadEvents/" +onlyActiveEvents)
        .then(function(data) {
            AppDispatcher.handleAction({
                actionType: "LOAD_EVENTS_SUCCESS",
                data: data
            });
        }, function(request, status, error) {
            console.error(status, error.toString());
        });
    },

    fetchEvent: function(eventId) {
        var url = "/register/loadData/" +eventId;
        CommonAPI.get(url)
        .then(function(data) {
            AppDispatcher.handleAction({
                actionType: "LOAD_EVENT_SUCCESS",
                data: data
            });
        }, function(request, status, error) {
            console.error(status, error.toString());
        });
    },

    deleteEvent: function(eventId) {
        var url = '/admin/events/delete/' +eventId;
        CommonAPI.post([], url)
        .then(function(data) {
            AppDispatcher.handleAction({
                actionType: "DELETE_EVENT_SUCCESS",
                data: {data: data, eventId: eventId}
            });
        }, function(request, status, error) {
            console.error(status, error.toString());
        });
    }
}
export default EventAPI;
