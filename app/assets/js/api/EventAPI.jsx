define(['dispatcher/AppDispatcher', 'api/CommonAPI'], function(AppDispatcher, CommonAPI) {

    var EventAPI = {

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

        fetchEvents: function() {
            CommonAPI.get("/admin/loadEvents")
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
        }
    }

    return EventAPI;

});