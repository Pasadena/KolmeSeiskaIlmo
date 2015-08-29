define(['dispatcher/AppDispatcher'], function(AppDispatcher) {

    var RegistrationActions = {
        getRegistrations: function(eventId) {
            AppDispatcher.handleAction({
                actionType: "LOAD_REGISTRATIONS",
                data: eventId
            });
            loadEventRegistrations(eventId)
        },
        saveRegistration: function(data) {
            AppDispatcher.handleAction({
                actionType: "SAVE_REGISTRATION",
                data: data
            });
            persistRegistrations(data);
        },
    }

    function loadEventRegistrations(eventId) {
        var url = "/register/registrations/" +eventId;
        $.ajax({
            url: url,
            dataType: 'json',
            success: function(data) {
                AppDispatcher.handleAction({
                    actionType: "LOAD_REGISTRATIONS_SUCCESS",
                    data: data
                });
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(status, err.toString());
            }.bind(this)
        });
    }

    function persistRegistrations(payload) {
        $.ajax({
            url: payload.url,
            contentType: 'application/json',
            dataType: 'json',
            type: "POST",
            data: JSON.stringify(payload.data),
            success: function(data) {
                AppDispatcher.handleAction({
                    actionType: "SAVE_REGISTRATION_SUCCESS",
                    data: data
                });
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(status, err.toString());
            }.bind(this)
        });
    }

    return RegistrationActions;

});