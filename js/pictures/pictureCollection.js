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
export default class PictureCollection extends Backbone.Collection {
	/**
	 * Provides search query for pictures collection.
	 *
	 * @returns {string} empty string
	 *
	 * @memberOf PictureCollection
	 */
	searchQuery() {
		return "";
	}

	/**
	 * Performs search.
	 *
	 * @param {string} searchQuery The search query.
	 * @param {boolean} loadMore If load more.
	 *
	 * @returns {void}
	 *
	 * @memberOf PictureCollection
	 */
	search(searchQuery, loadMore) {
		if (this.searchQuery !== searchQuery && loadMore) {
			return;
		} else if (this.searchQuery === searchQuery && !loadMore) {
			return;
		}

		this.searchQuery = searchQuery;
		const url = this._getFullUrl(searchQuery, loadMore);
		this.fetch({
			"add": true,
			"cache": false,
			"remove": false,
			"url": url
		}).done((data) => {
			const models = this._transformSearchDataToPictureModels(data);
			this._addModelsToCollection(models);
		});
	}

	/**
	 * Transforms search data into pictures models array.
	 *
	 * @param {any} data The search data.
	 * @returns {[PictureModel]} picture model array
	 *
	 * @memberOf PictureCollection
	 */
	_transformSearchDataToPictureModels(data) {
		if (data && data.totalHits > 0) {
			return _.map(data.hits, (datum) => {
				return new PictureModel({
					"id": datum.id,
					"previewURL": datum.previewURL,
					"webformatURL": datum.webformatURL
				});
			});
		}

		return null;
	}

	/**
	 * Adds picture model array to PictureCollection
	 *
	 * @param {PictureModel[]} models The pictureModels array.
	 *
	 * @returns {void}
	 *
	 * @memberOf PictureCollection
	 */
	_addModelsToCollection(models) {
		if (!models || models.length === 0) {
			return;
		}
		this._checkDownloadMoreImages(models);
		let newModels = this._getUniqueModels(this.models, models);
		newModels = this._clearTrashModels(newModels);
		this.reset(newModels, { "silent": true });
		this.trigger("ImagesAdded", this);
	}

	/**
	 * Gets unique models from two arrays
	 *
	 * @param {[PictureModel]} arr1 First pictureModel array.
	 * @param {[PictureModel]} arr2 Second picture model array.
	 * @returns {[PictureModel]} Array of unique values.
	 *
	 * @memberOf PictureCollection
	 */
	_getUniqueModels(arr1, arr2) {
		const trueArr1 = Util.wrapToArray(arr1);
		const trueArr2 = Util.wrapToArray(arr2);
		const united = _.union(trueArr1, trueArr2);
		return _.uniq(united, (item) => {
			if (item) {
				return item.get("id");
			}
			return null;
		});
	}

	/**
	 * Clear unsupported models from collection
	 *
	 * @param {[PictureModel]} models Models to clear.
	 * @returns {[PictureModel]} Clear models.
	 *
	 * @memberOf PictureCollection
	 */
	_clearTrashModels(models) {
		return _.filter(models, (model) => {
			if (model) {
				return model.get("previewURL") !== undefined &&
					model.get("webformatURL") !== undefined &&
					model.get("id") !== undefined;
			}
			return null;
		});
	}

	/**
	 * Checks possibility of downloading more images from api
	 *
	 * @param {any} models Models.
	 * @returns {boolean} The possibility.
	 * @memberOf PictureCollection
	 */
	_checkDownloadMoreImages(models) {
		const MODELS_COUNT_PER_DOWNLOAD = 20;
		if (models.length < MODELS_COUNT_PER_DOWNLOAD) {
			this.trigger("ImagesFull", true);
		} else {
			this.trigger("ImagesFull", false);
		}
	}

	/**
	 * Concatenates url from parts.
	 *
	 * @param {string} searchQuery The search query.
	 * @param {boolean} loadMore If need to load more.
	 * @returns {string} Full url.
	 *
	 * @memberOf PictureCollection
	 */
	_getFullUrl(searchQuery, loadMore) {
		if (!searchQuery) {
			return "";
		}
		const pageCount = this._getPageCount(loadMore);
		return `https://${urlConfig.name}/?` +
			`key=${urlConfig.queryParams.key}` +
			`&q=${searchQuery}&page=${pageCount}`;
	}

	/**
	 * Gets the page count.
	 *
	 * @param {boolean} loadMore If need to load more.
	 * @returns {number} Page count.
	 *
	 * @memberOf PictureCollection
	 */
	_getPageCount(loadMore) {
		let pageCount = 1;
		const COLL_COUNT = 20;
		if (loadMore && this.models.length >= COLL_COUNT) {
			pageCount = Math.round((this.models.length / COLL_COUNT));
			pageCount++;
		}
		return pageCount;
	}
}