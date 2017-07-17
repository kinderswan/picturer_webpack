/* global define*/
/* jshint esversion: 6 */
import $ from "Jquery";
import _ from "Underscore";
import Backbone from "Backbone";
import AuthModel from "Auth/authModel";
import AuthTemplate from "Auth/authTemplate.html";
import Util from "Shared/util";
import urlConfig from "Shared/urlConfig.json";

export default class AuthView extends Backbone.View {

	constructor(options) {
		super(options);
		this.template = _.template(AuthTemplate);
		this.model = new AuthModel();
		this.render();
	}

	template() {
		return "";
	}

	model() {
		return AuthModel;
	}

	events() {
		return { "click .submitAuth": "submitAuth" };
	}

	render() {
		this.$el.html(this.template({}));
	}

	submitAuth(event) {
		event.preventDefault();
		Util.setCurrentUser(this.$("#login").val() +
			this.$("#password").val());

		this.setAuthModelData();
		this.model.save(this.loginSuccess, this.loginError, this);
	}

	loginSuccess() {
		window.open(Util.indexUrl() + "#home", "_self");
	}

	loginError() {
		this.displayAuthError();
	}

	displayAuthError() {
		this.$(".submitAuth").css("background", "red");
		this.$(".submitAuth").text("Try again");
	}

	setAuthModelData() {
		this.model.set({ "UserHash": Util.getCurrentUser() });
	}
}