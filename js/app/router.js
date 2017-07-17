/* jshint esversion: 6 */

import $ from "Jquery";
import Backbone from "Backbone";
import PicturesView from "Pictures/picturesView";
import AuthView from "Auth/authView";
import Util from "Shared/util";

/**
 * Router
 *
 * @class Router
 * @extends {Backbone.Router}
 */
export default class Router extends Backbone.Router {

	constructor(){
		super();
	}

	/**
	 * Gets app routes.
	 *
	 * @returns {any} Default application routes
	 *
	 * @memberOf Router
	 */
	routes() {
		return {
			"": "index",
			"home": "home"
		};
	}

	/**
	 * Handler for index page.
	 *
	 * @returns {PicturesView} Bootstrap page.
	 *
	 * @memberOf Router
	 */
	index() {
		if (Util.getCurrentUser()) {
			this.navigate("home", { "trigger": true });
		} else {
			new AuthView({ "el": "#mainDiv" });
		}
	}

	home() {
		if (Util.getCurrentUser()) {
			new PicturesView({ "el": "#mainDiv" });
		} else {
			this.navigate("", { "trigger": true });
		}
	}
}