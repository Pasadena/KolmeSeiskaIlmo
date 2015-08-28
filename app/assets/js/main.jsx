require.config({
    "baseUrl": "/assets/javascripts/",
    "paths": {
        "jquery": "../lib/jquery/jquery",
        "jqueryui" : "../lib/jquery-ui/jquery-ui",
        "react" : "../lib/react/react",
        "react-router" : "../lib/react-router/ReactRouter",
        "JSXTransformer" : "../lib/jsx-requirejs-plugin/js/JSXTransformer",
        "text" : "../lib/jsx-requirejs-plugin/js/text",
        "jsx" : "../lib/jsx-requirejs-plugin/js/jsx",
        "underscore" : "../lib/underscorejs/underscore",
        "react-bootstrap": "node_modules/react-bootstrap/dist/react-bootstrap",
        "flux": "node_modules/flux/dist/Flux"
    },
    "shim": {
        "react": {
            exports: "react"
        },
        "react-router": {
            exports: "react-router",
            deps: ['react']
        },
        "flux": {
            exports: "flux"
        }
    }
});

require(['react', 'Router'], function(React, Router) {
    window.React = React;
    Router.startRouter();
});