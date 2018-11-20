import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { Counts } from 'meteor/ros:publish-counts';


Template.skelelistLangBar.events({
    'click .langFlag': function(event, instance) {
        let newLang = $(event.target).closest('.langFlag').data('lang');

        FlowRouter.setParams({'itemLang': newLang});
    }
});


// skelelist pagination
Template.skelelistPagination.onCreated(function() {
    let schema = this.data.schema;
    let collection = schema.__collection;
    let itemsPerPage = schema.__listView.options.itemsPerPage;
    this.currentPage = new ReactiveVar();

    this.data.appendLoadMore = new ReactiveVar(true);

    // initialize currentPage
    this.autorun(() => {
        if (this.data.skeleSubsReady.get()) {
            let numberOfLoadedDocuments = Skeletor.Data[collection].find().count();
            let currentPage = Math.ceil(numberOfLoadedDocuments / itemsPerPage);

            this.currentPage.set(currentPage);
        }
        else {
            this.currentPage.set(1);
        }
    });
});

Template.skelelistPagination.events({
    'click .skeleLoadMore': function(event, instance) {
        let data = instance.data;
        let schema = data.schema;

        // do nothing if autoLoad is enabled
        if (schema.__listView.options.autoLoad === true) {
            return false;
        }

        let collection = schema.__collection;
        let subManager = schema.__subManager;
        let listSchema = schema.__listView;
        let itemsPerPage = listSchema.options.itemsPerPage;
        let currentPage = instance.currentPage.get();
        let numberOfLoadedDocuments;
        let totalNumberOfDocuments;
        let options = {
            fields: {}
        };

        currentPage++;

        for (let field of listSchema.itemFields) {
            options.fields[field.name] = 1;
        }
        for (let param of listSchema.detailLink.params) {
            options.fields[param] = 1;
        }

        SkeleUtils.GlobalUtilities.logger(`Loading page ${currentPage}`, 'skelelist');

        function loadMoreDocuments() {
            totalNumberOfDocuments = Counts.get(`${collection}Counter`);
            numberOfLoadedDocuments = Skeletor.Data[collection].find().count();

            if ((totalNumberOfDocuments - numberOfLoadedDocuments) === 0) {
                SkeleUtils.GlobalUtilities.logger('All documents loaded...', 'skelelist');

                instance.data.appendLoadMore.set(false);
            }
        }

        let documentsList;

        if (subManager) {
            documentList = Skeletor.subsManagers[subManager].subscribe(
                'rawFindDocuments',
                collection,
                {},
                options,
                data.schemaName,
                currentPage,
                loadMoreDocuments
            );
        }
        else {
            documentList = Meteor.subscribe(
                'rawFindDocuments',
                collection,
                {},
                options,
                data.schemaName,
                currentPage,
                loadMoreDocuments
            );
        }

        instance.currentPage.set(currentPage);
    }
})
