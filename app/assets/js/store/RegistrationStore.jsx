import AppDispatcher from './../dispatcher/AppDispatcher';
import { EventEmitter } from 'events';
import _ from 'underscore';

let registrations = [], loadState = false, showNotification = false, eventRegistrations = [], registrationListModalStatus = false;;

function setRegistrations(data) {
    registrations = data['registrations'];
}

function updateLoadState(state) {
    loadState = state;
}

function setNotificationState(state) {
    showNotification = state;
}

function setEventRegistrationList(registrations) {
    eventRegistrations = registrations;
}

function setRegistrationListModalStatus(status) {
    registrationListModalStatus = status;
}

var RegistrationStore = _.extend({}, EventEmitter.prototype, {

    getRegistrations: function() {
        return registrations;
    },
    getNotificationState: function() {
        return showNotification;
    },
    getRegistrationListModalStatus: function() {
        return registrationListModalStatus;
    },
    /**
    * Return list of registrations, with each registration containing it's registered persons.
    **/
    getEventRegistrations: function() {
        return eventRegistrations;
    },
    emitChange: function() {
        this.emit('change');
    },
    addChangeListener: function(callback) {
        this.on('change', callback);
    },
    removeChangeListener: function(callback) {
        this.removeListener('change', callback);
    }
});

AppDispatcher.register(function(payload) {
    var action = payload.action;

    switch(action.actionType) {
        case "LOAD_REGISTRATIONS":
            updateLoadState(true);
            break;
        case "LOAD_REGISTRATIONS_SUCCESS":
            updateLoadState(false);
            setRegistrations(action.data);
            setNotificationState(false);
            break;
        case "SAVE_REGISTRATION":
            updateLoadState(true);
            break;
        case "SAVE_REGISTRATION_SUCCESS":
            updateLoadState(false);
            setNotificationState(true);
            break;
        case "LOAD_EVENT_REGISTRATION_PERSONS":
            updateLoadState(true);
            break;
        case "LOAD_EVENT_REGISTRATION_PERSONS_SUCCESS":
            updateLoadState(false);
            setRegistrationListModalStatus(true);
            setEventRegistrationList(action.data);
            break;
        case "CLOSE_EVENT_REGISTRATION_PERSONS_DIALOG":
            setRegistrationListModalStatus(false);
            setEventRegistrationList([]);
            break;
        default:
            return true;
    }
    RegistrationStore.emitChange();

    return true;
});

export default RegistrationStore;
