define(['dispatcher/AppDispatcher', 'api/RegistrationAPI'], function(AppDispatcher, RegistrationAPI) {

    var RegistrationActions = {
        getRegistrations: function(eventId) {
            AppDispatcher.handleAction({
                actionType: "LOAD_REGISTRATIONS",
                data: eventId
            });
            RegistrationAPI.loadEventRegistrations(eventId)
        },
        saveRegistration: function(data) {
            AppDispatcher.handleAction({
                actionType: "SAVE_REGISTRATION",
                data: data
            });
            RegistrationAPI.persistRegistrations(data);
        }
    }

    return RegistrationActions;

});