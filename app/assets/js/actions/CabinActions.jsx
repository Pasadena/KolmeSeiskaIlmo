define(['dispatcher/AppDispatcher', 'api/CabinAPI'], function(AppDispatcher, CabinAPI) {

    var CabinActions = {

        fetchCabins: function() {
            AppDispatcher.handleAction({
                actionType: "LOAD_CABINS",
                data: null
            });
            CabinAPI.fetchCabins();
        }
    }

    return CabinActions;

});