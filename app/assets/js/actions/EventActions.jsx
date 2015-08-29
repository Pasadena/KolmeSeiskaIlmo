define(['dispatcher/AppDispatcher'], function(AppDispatcher) {

    var EventActions = {

        loadEvents: function() {
            fetchEvents();
        },
        loadEventData: function(eventId) {
            AppDispatcher.handleAction({
                actionType: "LOAD_EVENT",
                data: eventId
            });
            fetchEvent(eventId);
        },
        saveEvent: function(payload) {
            AppDispatcher.handleAction({
                actionType: "SAVE_EVENT",
                data: payload.data
            });
            persistEvent(payload);
        }
    }

    function persistEvent(payload) {
        $.ajax({
            url: payload.url,
            contentType: 'application/json',
            dataType: 'json',
            type: 'POST',
            data: JSON.stringify(payload.data),
            success: function(data) {
                AppDispatcher.handleAction({
                    actionType: "SAVE_EVENT_SUCCESS",
                    data: data
                });
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
    }

    function fetchEvents() {
        $.ajax({
            url: '/admin/loadEvents',
            dataType: 'json',
            success: function(data) {
                AppDispatcher.handleAction({
                    actionType: "LOAD_EVENTS",
                    data: data
                });
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(status, err.toString());
            }.bind(this)
        });
    }

    function fetchEvent(eventId) {
        var url = "/register/loadData/" +eventId;
        $.ajax({
            url: url,
            dataType: 'json',
            success: function(data) {
                AppDispatcher.handleAction({
                    actionType: "LOAD_EVENT_SUCCESS",
                    data: data
                });
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(status, err.toString());
            }.bind(this)
        });
    }


    return EventActions;

});