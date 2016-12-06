import AppDispatcher from './../dispatcher/AppDispatcher';
import CabinAPI from './../api/CabinAPI';

const CabinActions = {
  fetchCabins: function() {
      AppDispatcher.handleAction({
          actionType: "LOAD_CABINS",
          data: null
      });
      CabinAPI.fetchCabins();
  }
}

export default CabinActions;
