/* global define*/
/* jshint esversion: 6 */
import $ from "Jquery";
import _ from "Underscore";
import Backbone from "Backbone";
import PictureModel from "Pictures/pictureModel";
import PicturesModelViewSmallTemplate from "Pictures/pictureModelViewSmallTemplate.html";
import PicturesModelViewBigTemplate from "Pictures/pictureModelViewBigTemplate.html";
export default class PictureModelView extends Backbone.View {
	constructor(options) {
		super(options);
		this.options = options || {};
		this.size = this.options.size;
		this.model = this.options.model;
		this.smallTemplate = _.template(PicturesModelViewSmallTemplate);
		this.bigTemplate = _.template(PicturesModelViewBigTemplate);
	}

	smallTemplate() {
		return "";
	}

	bigTemplate() {
		return "";
	}

	model() {
		return PictureModel;
	}

	$container() {
		return "";
	}

	events() {
		return { "click .like": "clickLike" };
	}

	render($container) {
		this.$container = $container;
		const size = this.model.get("displayingSize");
		const template = this.getRenderedTemplate(size);
		this.$container.append($(template));
	}

	getRenderedTemplate() {
		console.log(this.smallTemplate);
		if (this.model.get("displayingSize") === "small") {
			return this.smallTemplate({
				"id": this.model.get("id"),
				"url": this.model.get("previewURL")
			});
		}
		return this.bigTemplate({
			"id": this.model.get("id"),
			"url": this.model.get("webformatURL"),
			"liked": this.model.get("isLiked")
		});
	}

	getResizedImageTemplate() {
		const size = this.model.get("displayingSize");
		if (size === "small") {
			this.model.set("displayingSize", "big");
		}

		if (size === "big") {
			this.model.set("displayingSize", "small");
		}

		return this.getRenderedTemplate();
	}

	resizeImage() {
		const $el = this.findModelOnPage();
		const $resized = $(this.getResizedImageTemplate());
		$el.replaceWith($resized);
	}

	clickLike() {
		if (this.model.get("isLiked") === false) {
			this.model.set({ "isLiked": true });
			this.model.save(this.makeLikeImageRed, null, this);
		} else {
			this.model.set({ "isLiked": false });
			this.model.destroyModel(this.makeLikeImageTransparent, null, this);
		}
	}

	updateLikedModels(likesCollection) {
		const that = this;
		if (this.model.get("isLiked") === true) {
			likesCollection.likedModelIds.push(String(that.model.get("id")));
			return likesCollection.likedModelIds;
		}
		return _.filter(likesCollection.likedModelIds, (x) => {
			return x !== String(that.model.get("id"));
		});
	}

	findModelOnPage() {
		return $("#" + this.model.get("id"));
	}

	makeLikeImageRed() {
		const $el = this.findModelOnPage();
		$el.find("a.like").addClass("pressed");
	}

	makeLikeImageTransparent() {
		const $el = this.findModelOnPage();
		$el.find("a.like").removeClass("pressed");
	}
}