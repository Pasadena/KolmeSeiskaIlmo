import AppDispatcher from './../dispatcher/AppDispatcher';
import RegistrationAPI from './../api/RegistrationAPI';

const RegistrationActions = {
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
    },
    getEventRegistrationList: function(eventId) {
        AppDispatcher.handleAction({
            actionType: "LOAD_EVENT_REGISTRATION_PERSONS",
            data: eventId
        });
        RegistrationAPI.fetchEventRegistrationList(eventId)
    },
    closeRegistrationListDialog: function() {
        AppDispatcher.handleAction({
            actionType: "CLOSE_EVENT_REGISTRATION_PERSONS_DIALOG",
            data: null
        });
    }
}

export default RegistrationActions;
