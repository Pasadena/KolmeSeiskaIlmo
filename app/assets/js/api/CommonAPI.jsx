import $ from 'jquery';

const CommonAPI = {

  get: function(url) {
      var getRequest = $.ajax({
          url: url,
          dataType: 'json',
          error: function(xhr, status, err) {
              console.error(status, err.toString());
          }.bind(this)
      });
      return getRequest;
  },

  post: function(data, url) {
      var postRequest = $.ajax({
          url: url,
          contentType: 'application/json',
          dataType: 'json',
          type: 'POST',
          data: JSON.stringify(data),
          error: function(xhr, status, err) {
              console.error(xhr, status, err.toString());
          }.bind(this)
      });
      return postRequest;
  }
}

export default CommonAPI;
