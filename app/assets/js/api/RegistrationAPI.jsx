import AppDispatcher from './../dispatcher/AppDispatcher';
import CommonAPI from './CommonAPI';

const RegistrationAPI = {

    loadEventRegistrations: function(eventId) {
        var url = "/register/registrations/" +eventId;
        CommonAPI.get(url)
        .then(function(data) {
            AppDispatcher.handleAction({
                actionType: "LOAD_REGISTRATIONS_SUCCESS",
                data: data
            });
        }, function(request, status, error) {
            console.error(status, error.toString());
        });
    },

    persistRegistrations: function(payload) {
        CommonAPI.post(payload.data, payload.url)
        .then(function(data) {
            AppDispatcher.handleAction({
                actionType: "SAVE_REGISTRATION_SUCCESS",
                data: data
            });
        }, function(request, status, error) {
            console.error(status, error.toString());
        });
    },

    fetchEventRegistrationList: function(eventId) {
        var url = "/admin/events/registrations/" +eventId;
        CommonAPI.get(url)
        .then(function(data) {
            AppDispatcher.handleAction({
                actionType: "LOAD_EVENT_REGISTRATION_PERSONS_SUCCESS",
                data: data
            });
        }, function(request, status, error) {
            console.error(status, error.toString());
        });
    }

}
export default RegistrationAPI;
