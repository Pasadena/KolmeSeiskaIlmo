define(['dispatcher/AppDispatcher', 'api/CommonAPI'], function(AppDispatcher, CommonAPI) {

    var CabinAPI = {

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
    return CabinAPI;
});