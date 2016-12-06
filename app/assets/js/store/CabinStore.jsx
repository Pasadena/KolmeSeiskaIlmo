import AppDispatcher from './../dispatcher/AppDispatcher';
import { EventEmitter } from 'events';
import _ from 'underscore';

let cabins = [], loading = false;

function setCabins(data) {
    cabins = data;
}

function updateLoadState(state) {
    loading = state;
}

var CabinStore = _.extend({}, EventEmitter.prototype, {

    getCabins: function() {
        return cabins;
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
        case "LOAD_CABINS":
            updateLoadState(true);
            break;
        case "LOAD_CABINS_SUCCESS":
            updateLoadState(false);
            setCabins(action.data);
            break;
        default:
            return true;
    }
    CabinStore.emitChange();

    return true;
});

export default CabinStore;
