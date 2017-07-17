/* global define*/
/* jshint esversion: 6 */
import $ from "Jquery";
import _ from "Underscore";
import Backbone from "Backbone";
import Util from "Shared/util";

export default class AuthModel extends Backbone.Model {
	constructor(options) {
		super(options);
		this.url = `${Util.getPlatformUrl()}/api/auth`;
	}

	defaults() {
		return { "UserHash": "" };
	}

	save(success, error, context) {
		$.ajax({
			"type": "POST",
			"url": this.url,
			"crossDomain": true,
			"data": this.toJSON(),
			"success": success,
			"error": error,
			"context": context
		});
	}

}
