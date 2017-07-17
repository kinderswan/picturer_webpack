/* global define */
/* jshint esversion: 6 */

import $ from "Jquery";
import _ from "Underscore";
import Backbone from "Backbone";
import PictureModel from "Pictures/pictureModel";
import urlConfig from "Shared/urlConfig.json";
import Util from "Shared/util";

/**
 * Pictures collection class.
 *
 * @class PictureCollection
 * @extends {Backbone.Collection}
 */
export default class LikesCollection extends Backbone.Collection {

	constructor(options) {
		super(options);
		this.likedModelIds = [];
	}

	getLikes() {
		this.createGetLikesCall();
	}

	createGetLikesCall(success, error) {
		$.ajax({
			"type": "GET",
			"url": this.buildRequestUrl(),
			"crossDomain": true,
			"dataType": "json",
			"success": this.getLikesSuccess,
			"error": error,
			"beforeSend": this.addHttpHeaders,
			"context": this
		});
	}

	buildRequestUrl() {
		return `${Util.getPlatformUrl()}/api/picture/${Util.getCurrentUser()}`;
	}

	getLikesSuccess(data) {
		this.generateLikesCollection(data.Models);
	}

	generateLikesCollection(models) {
		_.each(models, (model) => {
			this.likedModelIds.push(model.Id);
		});
	}

	addHttpHeaders(xhr) {
		xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
	}

	dispose() {
		this.likedModelIds = [];
		Backbone.dispose.call(this);
	}
}