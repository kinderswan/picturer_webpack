/* jshint esversion:6 */
import $ from "Jquery";
import _ from "Underscore";
import Backbone from "Backbone";
import PictureCollection from "Pictures/PictureCollection";
import PictureModel from "Pictures/PictureModel";
import PictureModelView from "Pictures/PictureModelView";
import PicturesView from "Pictures/PicturesView";
import urlConfig from "Shared/urlConfig";

	describe("Pictures/PicturesView", () => {
		it("initialize should have been called once on new PicturesView", () => {
			spyOn(PicturesView.prototype, "initialize").and.stub();
			const view = new PicturesView();
			expect(view.initialize.calls.count()).toEqual(1);
		});

		it("render should render main template", () => {
			spyOn(PicturesView.prototype, "initialize").and.stub();
			const view = new PicturesView();
			view.$el = $("");
			view.render();
			expect($(view.$el)).not.toBeEmpty();
		});

		it("initialize should initialize pictures collection", () => {
			const view = new PicturesView();
			expect(view.collection).not.toBeNull();
		});

		it("initializeLoadMoreButtonEvents should hide load more button if new items could not be loaded any", () => {
			const view = new PicturesView();
			view.collection.trigger("ImagesFull", true);
			expect(view.$("#loadMoreImages")).toHaveClass("hidden");
		});

		it("initializeLoadMoreButtonEvents should show load more button if new items could be loaded", () => {
			const view = new PicturesView();
			view.$("#loadMoreImages").addClass("hidden");
			view.collection.trigger("ImagesFull", false);
			expect(view.$("#loadMoreImages")).not.toHaveClass("hidden");
		});
	});

	describe("Pictures/PicturesCollection", () => {
		const generateFakeModels = function (count) {
			const hits = [];
			let i = 0;
			while (i < count) {
				hits[i] = {
					"id": `id${i}`,
					"previewURL": `previewURL${i}`,
					"webformatURL": `webformatURL${i}`
				};
				i++;
			}
			return {
				"hits": hits,
				"totalHits": count
			};
		};

		describe("PicturesCollection search", () => {
			it("search should add models to collection if it has found them", () => {
				const collection = new PictureCollection();
				spyOn(collection, "_transformSearchDataToPictureModels").and.returnValue({ "models":"data" });
				spyOn(collection, "_addModelsToCollection").and.stub();
				spyOn(collection, "fetch").and.callFake(() => {
					const d = $.Deferred();
					d.resolve({ "data":"data" });
					return d.promise();
				});

				collection.search("cat");

				expect(collection._transformSearchDataToPictureModels).toHaveBeenCalledWith({ "data":"data" });
				expect(collection._addModelsToCollection).toHaveBeenCalledWith({ "models":"data" });
				expect(collection._transformSearchDataToPictureModels.calls.count()).toEqual(1);
				expect(collection._addModelsToCollection.calls.count()).toEqual(1);
			});

			it("search should not call models trasform and add them to collection", () => {
				const collection = new PictureCollection();
				spyOn(collection, "_transformSearchDataToPictureModels").and.stub();
				spyOn(collection, "_addModelsToCollection").and.stub();
				spyOn(collection, "fetch").and.callFake(() => {
					const d = $.Deferred();
					d.reject({ "data":"data" });
					return d.promise();
				});

				collection.search("cat");

				expect(collection._transformSearchDataToPictureModels).not.toHaveBeenCalled();
				expect(collection._addModelsToCollection).not.toHaveBeenCalled();
			});

			it("should have set hidden class to load more el if it could not download more images", () => {
				spyOn(PicturesView.prototype, "initialize").and.stub();
				const view = new PicturesView();
				view.collection = new PictureCollection();
				view.render();

				spyOn(view.collection, "fetch").and.callFake(() => {
					const d = $.Deferred();
					d.resolve(generateFakeModels(1));
					return d.promise();
				});

				view.collection.search("cat");
				expect(view.$("#loadMoreImages")).toHaveClass("hidden");
			});

			it("should not have set hidden class to load more el if it could not download more images", () => {
				spyOn(PicturesView.prototype, "initialize").and.stub();
				const view = new PicturesView();
				view.collection = new PictureCollection();
				view.render();

				spyOn(view.collection, "fetch").and.callFake(() => {
					const d = $.Deferred();
					d.resolve(generateFakeModels(20));
					return d.promise();
				});

				view.collection.search("cat");
				expect(view.$("#loadMoreImages")).not.toHaveClass("hidden");
			});

			it("should not perform search if the user tries to load more pics with different search query", () => {
				const collection = new PictureCollection();
				collection.searchQuery = "cat";
				spyOn(collection, "fetch").and.stub();
				collection.search("not a cat", true);
				expect(collection.fetch.calls.count()).toEqual(0);
			});

			it("should perform search if the user loads more with the same search query as the previous one", () => {
				const collection = new PictureCollection();
				collection.searchQuery = "cat";
				spyOn(collection, "fetch").and.returnValue({ "done": jasmine.createSpy() });
				collection.search("cat", true);
				expect(collection.fetch.calls.count()).toEqual(1);
			});

			it("should perform search if the user presses on button at the first time", () => {
				const collection = new PictureCollection();
				spyOn(collection, "fetch").and.returnValue({ "done": jasmine.createSpy() });
				collection.search("cat", false);
				expect(collection.fetch.calls.count()).toEqual(1);
			});

			it("should not perform search if the user presses on button at the second time with the same params", () => {
				const collection = new PictureCollection();
				spyOn(collection, "fetch").and.returnValue({ "done": jasmine.createSpy() });
				collection.searchQuery = "cat";
				collection.search("cat", false);
				expect(collection.fetch.calls.count()).toEqual(0);
			});

			it("should perform search if the user presses on button at the first time and load more is undefined", () => {
				const collection = new PictureCollection();
				spyOn(collection, "fetch").and.returnValue({ "done": jasmine.createSpy() });
				collection.search("cat");
				expect(collection.fetch.calls.count()).toEqual(1);
			});

			it("should not perform search if the user presses on button at the second time with the same params and load more is undefined", () => {
				const collection = new PictureCollection();
				spyOn(collection, "fetch").and.returnValue({ "done": jasmine.createSpy() });
				collection.searchQuery = "cat";
				collection.search("cat");
				expect(collection.fetch.calls.count()).toEqual(0);
			});
		});

		it("_transformSearchDataToPictureModels should return picture models array", () => {
			const collection = new PictureCollection();
			const data = generateFakeModels(1);

			const models = collection._transformSearchDataToPictureModels(data);

			expect(models).not.toBeUndefined();
			expect(models.length).toEqual(1);
			expect(models[0].get("id")).toEqual("id0");
			expect(models[0].get("previewURL")).toEqual("previewURL0");
			expect(models[0].get("webformatURL")).toEqual("webformatURL0");
		});

		it("_transformSearchDataToPictureModels should return null if input is null", () => {
			const collection = new PictureCollection();
			expect(collection._transformSearchDataToPictureModels(null)).toBeNull();
		});

		it("_transformSearchDataToPictureModels should return null if input is undefined", () => {
			const collection = new PictureCollection();
			expect(collection._transformSearchDataToPictureModels(undefined)).toBeNull();
		});

		it("_transformSearchDataToPictureModels should return null if input is an empty object", () => {
			const collection = new PictureCollection();
			expect(collection._transformSearchDataToPictureModels({})).toBeNull();
		});

		it("_transformSearchDataToPictureModels should return null if array length is 0", () => {
			const collection = new PictureCollection();
			const data = { "hits": 0 };
			expect(collection._transformSearchDataToPictureModels(data)).toBeNull();
		});

		it("_addModelsToCollection should return fullfilled PictureCollection if models array was not null", () => {
			const collection = new PictureCollection();
			spyOn(collection, "trigger").and.stub();
			const model = new PictureModel({
				"id": "id",
				"previewURL": "preview",
				"webformatURL": "webformat"
			});

			collection._addModelsToCollection([model]);

			expect(collection.models.length).toEqual(1);
			expect(collection.trigger).toHaveBeenCalled();
		});

		it("_addModelsToCollection should leave collection if models array is null", () => {
			const collection = new PictureCollection();
			spyOn(collection, "trigger").and.stub();

			collection._addModelsToCollection(null);
			expect(collection.models.length).toEqual(0);
			expect(collection.trigger).not.toHaveBeenCalled();
		});

		it("_addModelsToCollection should leave collection if models array is undefined", () => {
			const collection = new PictureCollection();
			spyOn(collection, "trigger").and.stub();

			collection._addModelsToCollection();
			expect(collection.models.length).toEqual(0);
			expect(collection.trigger).not.toHaveBeenCalled();
		});

		it("_addModelsToCollection should leave collection if models array is empty", () => {
			const collection = new PictureCollection();
			spyOn(collection, "trigger").and.stub();

			collection._addModelsToCollection([]);
			expect(collection.models.length).toEqual(0);
			expect(collection.trigger).not.toHaveBeenCalled();
		});

		it("_addModelsToCollection should return PictureCollection with two models if models are not similar", () => {
			const collection = new PictureCollection();
			spyOn(collection, "trigger").and.stub();
			const model = new PictureModel({
				"id": "id",
				"previewURL": "preview",
				"webformatURL": "webformat"
			});
			const model1 = new PictureModel({
				"id": "id1",
				"previewURL": "preview1",
				"webformatURL": "webformat1"
			});

			collection._addModelsToCollection([model, model1]);

			expect(collection.models.length).toEqual(2);
			expect(collection.trigger).toHaveBeenCalled();
		});

		it("_addModelsToCollection should return PictureCollection with one model if models are similar", () => {
			const collection = new PictureCollection();
			spyOn(collection, "trigger").and.stub();
			const model = new PictureModel({
				"id": "id",
				"previewURL": "preview",
				"webformatURL": "webformat"
			});

			collection._addModelsToCollection([model, model, model, model, model]);

			expect(collection.models.length).toEqual(1);
			expect(collection.trigger).toHaveBeenCalled();
		});

		it("_addModelsToCollection should return PictureCollection with one model if array contains null models", () => {
			const collection = new PictureCollection();
			spyOn(collection, "trigger").and.stub();
			const model = new PictureModel({
				"id": "id",
				"previewURL": "preview",
				"webformatURL": "webformat"
			});

			collection._addModelsToCollection([model, null]);

			expect(collection.models.length).toEqual(1);
			expect(collection.trigger).toHaveBeenCalled();
		});

		it("_addModelsToCollection should trigger ImagesAdded event", () => {
			const collection = new PictureCollection();
			spyOn(collection, "trigger").and.stub();

			const model = new PictureModel(generateFakeModels(1).hits[0]);

			collection._addModelsToCollection([model]);
			expect(collection.trigger).toHaveBeenCalledWith("ImagesAdded", collection);
		});

		it("_addModelsToCollection should add model to collection if it was not passed as array", () => {
			const collection = new PictureCollection();
			spyOn(collection, "trigger").and.stub();

			const model = new PictureModel(generateFakeModels(1).hits[0]);

			collection._addModelsToCollection(model);
			expect(collection.models.length).toEqual(1);
			expect(collection.trigger).toHaveBeenCalled();
		});

		it("_getUniqueModels should return one array of unique picture models", () => {
			const collection = new PictureCollection();
			const arr1 = [new PictureModel(generateFakeModels(2).hits[0])];
			const arr2 = [new PictureModel(generateFakeModels(2).hits[1])];

			const expected = collection._getUniqueModels(arr1, arr2);
			expect(expected.length).toEqual(2);
			expect(expected[0].get("id")).toEqual(arr1[0].get("id"));
			expect(expected[0].get("id")).toEqual("id0");
			expect(expected[1].get("id")).toEqual(arr2[0].get("id"));
			expect(expected[1].get("id")).toEqual("id1");
		});

		it("_getUniqueModels should return array with one item if models are similar", () => {
			const collection = new PictureCollection();
			const arr1 = [new PictureModel({ "id": "1" })];
			const arr2 = [new PictureModel({ "id": "1" })];

			const expected = collection._getUniqueModels(arr1, arr2);
			expect(expected.length).toEqual(1);
			expect(expected[0].get("id")).toEqual(arr1[0].get("id"));
			expect(expected[0].get("id")).toEqual("1");
		});

		it("_getUniqueModels should return empty array if arrays are empty", () => {
			const collection = new PictureCollection();

			const expected = collection._getUniqueModels([], []);
			expect(expected.length).toEqual(0);
			expect(expected).toEqual([]);
		});

		it("_getUniqueModels should return array with one model if one array is empty", () => {
			const collection = new PictureCollection();
			const arr1 = [new PictureModel({ "id": "1" })];
			const expected = collection._getUniqueModels(arr1, []);
			expect(expected.length).toEqual(1);
			expect(expected[0].get("id")).toEqual(arr1[0].get("id"));
			expect(expected[0].get("id")).toEqual("1");
		});

		it("_getUniqueModels should return array with two model if one param is passed as object", () => {
			const collection = new PictureCollection();
			const arr1 = [new PictureModel({ "id": "1" })];

			const notArr2 = new PictureModel({ "id": "2" });

			const expected = collection._getUniqueModels(arr1, notArr2);
			expect(expected.length).toEqual(2);
			expect(expected[0].get("id")).toEqual(arr1[0].get("id"));
			expect(expected[0].get("id")).toEqual("1");
			expect(expected[1].get("id")).toEqual(notArr2.get("id"));
			expect(expected[1].get("id")).toEqual("2");
		});

		it("_getUniqueModels should return array with two model if params are passed as an object", () => {
			const collection = new PictureCollection();
			const notArr1 = new PictureModel({ "id": "1" });

			const notArr2 = new PictureModel({ "id": "2" });

			const expected = collection._getUniqueModels(notArr1, notArr2);
			expect(expected.length).toEqual(2);
			expect(expected[0].get("id")).toEqual(notArr1.get("id"));
			expect(expected[0].get("id")).toEqual("1");
			expect(expected[1].get("id")).toEqual(notArr2.get("id"));
			expect(expected[1].get("id")).toEqual("2");
		});

		it("_getUniqueModels should return array with one model if params are similar and passed as an object", () => {
			const collection = new PictureCollection();
			const notArr1 = new PictureModel({ "id": "1" });

			const notArr2 = new PictureModel({ "id": "1" });

			const expected = collection._getUniqueModels(notArr1, notArr2);
			expect(expected.length).toEqual(1);
			expect(expected[0].get("id")).toEqual(notArr1.get("id"));
			expect(expected[0].get("id")).toEqual("1");
		});

		it("_getFullUrl should return correct api url", () => {
			const collection = new PictureCollection();
			spyOn(collection, "_getPageCount").and.returnValue(1);
			const url = collection._getFullUrl("cat", false);
			expect(url).toEqual(`https://pixabay.com/api/?key=${urlConfig.queryParams.key}&q=cat&page=1`);
		});

		it("_getFullUrl should return url with first page if load more is false", () => {
			const collection = new PictureCollection();
			expect(collection._getFullUrl("cat", false)).toMatch(/page=1/);
		});

		it("_getFullUrl should return url with first page if load more is undefined", () => {
			const collection = new PictureCollection();
			expect(collection._getFullUrl("cat")).toMatch(/page=1/);
		});

		it("_getFullUrl should return empty string if search query is empty string", () => {
			const collection = new PictureCollection();
			expect(collection._getFullUrl("")).toEqual("");
		});

		it("_getFullUrl should return empty string if search query is undefined", () => {
			const collection = new PictureCollection();
			expect(collection._getFullUrl()).toEqual("");
		});

		it("_getPageCount should return 1 if loadMore is false", () => {
			const collection = new PictureCollection();
			expect(collection._getPageCount(false)).toEqual(1);
		});

		it("_getPageCount should return 1 if loadMore is undefined", () => {
			const collection = new PictureCollection();
			expect(collection._getPageCount()).toEqual(1);
		});

		it("_getPageCount should return 1 if loadMore is true but models length is less than 20", () => {
			const collection = new PictureCollection();
			collection.models.length = 15;
			expect(collection._getPageCount(true)).toEqual(1);
		});

		it("_getPageCount should return 2 if loadMore is true and models length is greater than 20", () => {
			const collection = new PictureCollection();
			collection.models.length = 25;
			expect(collection._getPageCount(true)).toEqual(2);
		});
	});
