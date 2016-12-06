import AppDispatcher from './../dispatcher/AppDispatcher';
import CommonAPI from './CommonAPI';

const CabinAPI = {
    fetchCabins: function() {
        CommonAPI.get("/admin/loadCabins")
        .then(function(data) {
            AppDispatcher.handleAction({
                actionType: "LOAD_CABINS_SUCCESS",
                data: data
            });
        }, function(request, status, error) {
            console.error(status, error.toString());
        });
    }
}

export default CabinAPI;
