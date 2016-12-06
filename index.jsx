/**import React from 'react';
import ReactDOM from 'react-dom';
import AppRouter from './app/assets/js/Router';
import IndexViewComponent from './app/assets/js/IndexView';
import AdminLayout from './app/assets/js/AdminPage';**/

var React = require('react');
var ReactDOM = require('react-dom');
const AppRouter = require('./app/assets/js/Router').default;
var IndexViewComponent = require('./app/assets/js/IndexView').default;
var AdminLayout = require('./app/assets/js/AdminPage').default;
var RegisterView = require('./app/assets/js/RegisterView').default;
var CabinPageView = require('./app/assets/js/Cabins').default;
var EventSection = require('./app/assets/js/Events').default;
var LoginView = require('./app/assets/js/LoginView').default;
const { Router, Route, IndexRoute, browserHistory } = require('react-router')

//window.React = React;
//const appRouter = new AppRouter();
//console.log(AppRouter);
//new AppRouter().startRouter();

ReactDOM.render(
  <AppRouter />
  , document.getElementById("container")
);
