/* jshint esversion: 6 */
import Router from "./js/app/router";
import Backbone from "./node_modules/backbone/backbone-min";

const router = new Router();
Backbone.history.start();
router.navigate("");