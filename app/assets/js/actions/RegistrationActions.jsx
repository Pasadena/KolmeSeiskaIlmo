define(['dispatcher/AppDispatcher'], function(AppDispatcher) {

    var RegistrationActions = {

        loadEventData: function(data) {
            AppDispatcher.handleAction({
                actionType: "LOAD_EVENT",
                data: data
            });
        },
        selectCabin: function(data) {
            AppDispatcher.handleAction({
                actionType: "SELECT_CABIN",
                data: data
            });
        },
        saveRegistration: function(data) {
            AppDispatcher.handleAction({
                actionType: "SAVE_REGISTRATION",
                data: data
            });
        },
    }

    return RegistrationActions;

});