define(['jquery'], function($) {

    var CommonAPI = {

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
                    console.error(this.props.url, status, err.toString());
                }.bind(this)
            });
            return postRequest;
        }
    }

    return CommonAPI;

});