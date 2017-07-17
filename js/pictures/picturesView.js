/* global define*/
/* jshint esversion: 6 */
import $ from "Jquery";
import _ from "Underscore";
import Backbone from "Backbone";
import Masonry from "Libs/masonry";
import PictureCollection from "Pictures/pictureCollection";
import PictureViewTemplate from "Pictures/picturesViewTemplate.html";
import bridget from "Bridget";
import LikesCollection from "Pictures/likesCollection";
import ZipDownloader from "Shared/zipDownloader";
import PictureModelView from "Pictures/pictureModelView";

export default class PicturesView extends Backbone.View {
	pictureImages() {
		return null;
	}

	$container() {
		return null;
	}

	events() {
		return {
			"click #searchImages, #loadMoreImages": "searchImages",
			"click #downloadLikes": "downloadLikes"
		};
	}

	constructor(options) {
		super(options);
		bridget('masonry', Masonry, $);
		this.template = _.template(PictureViewTemplate);
		this.collection = new PictureCollection();
		this.likesCollection = new LikesCollection();
		this.render();
		this.initializeCollectionEvents();
		this.pictureImages = [];
		this.renderMasonryGrid();
		this.zipDownloader = new ZipDownloader();
	}

	initializeCollectionEvents() {
		this.collection.on("ImagesAdded", this.renderSearchResults, this);
		this.likesCollection.on("LikesAdded", this.likeFoundResults, this);
	}

	initializeMasonryEvents($container) {
		$container.on("click", ".image", (event) => {
			event.preventDefault();
			this.resizeImage(event);
		});
		$container.on("click", "a.like", (event) => {
			event.stopPropagation();
			this.clickLike(event);
		});
	}

	render() {
		this.$el.html(this.template({}));
		this.$("#loadMoreImages").addClass("hidden");
		this.initializeLoadMoreButtonEvents();
		this.getLikesResults();
	}

	renderMasonryGrid() {
		this.$container = $(".img-container").masonry();
		this.$container.masonry({
			"isAnimated": true,
			"itemSelector": ".image"

		});

		this.initializeMasonryEvents(this.$container);

		return this.$container;
	}

	searchImages(event) {
		const searchQuery = $(".searchQueryInput").val();

		if (event && event.currentTarget.id === "loadMoreImages") {
			this.collection.search(searchQuery, true);
			return;
		}

		if (searchQuery.length > 0) {
			this.collection.search(searchQuery, false);
		}
	}

	renderSearchResults(event) {
		this.pictureImages = this.getPictures(event, "small");
		this.$container.empty();
		_.each(this.pictureImages, (image) => {
			image.render(this.$container);
		});
		this.likeFoundResults(this.likesCollection.likedModelIds);
	}

	getLikesResults() {
		this.likesCollection.getLikes();
	}

	getPictures(collection, size) {
		const views = [];
		_.each(collection.models, (model) => {
			views.push(new PictureModelView({
				"model": model,
				"size": size
			}));
		});
		return views;
	}

	resizeImage(event) {
		const el = this.findImageModel(event.target.src);
		el.resizeImage();
	}

	clickLike(event) {
		const image = $(event.target).parents(".image").find("img")[0];
		const el = this.findImageModel(image.src);
		el.clickLike();
		this.likesCollection.likedModelIds = el.updateLikedModels(this.likesCollection);
	}

	findImageModel(src) {
		return _.find(this.pictureImages, (image) => {
			const model = image.model.toJSON();
			return model.previewURL === src || model.webformatURL === src || model.id === Number(src);
		});
	}

	likeFoundResults(likedModels) {
		const that = this;
		_.each(likedModels, (model) => {
			const el = that.findImageModel(model);
			if (el && !el.model.get("isLiked")) {
				el.clickLike();
			}
		});
	}

	initializeLoadMoreButtonEvents() {
		this.collection.on("ImagesFull", (needToHide) => {
			if (needToHide) {
				this.$("#loadMoreImages").addClass("hidden");
			} else {
				this.$("#loadMoreImages").removeClass("hidden");
			}
		});
	}

	downloadLikes() {
		this.zipDownloader.getZippedArchive(this.likesCollection.likedModelIds);
	}

	dispose() {
		if (this.likesCollection) {
			this.likesCollection.dispose();
		}
	}
}