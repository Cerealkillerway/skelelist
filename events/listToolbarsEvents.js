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
        if (this.data.skeleSubsReady.get() === true) {
            let numberOfLoadedDocuments = Skeletor.Data[collection].find().count();
            let currentPage = Math.ceil(numberOfLoadedDocuments / itemsPerPage);

            this.currentPage.set(currentPage);
            this.isLoading = false;
        }
        else {
            this.currentPage.set(1);
            this.isLoading = true;
        }
    });

    // autoload (infinite-scroll pagination)
    if (schema.__listView.options.autoLoad === true) {
        let instance = this;

        $(window).on('scroll.skeleLoadMore', function() {
            if (instance.isLoading) {
                return false;
            }
            let $loadMore = $('.skeleLoadMore');

            if ($loadMore.length === 0) {
                // all loaded -> unbind event handler
                $(window).off('scroll.skeleLoadMore');
                return false;
            }

            let triggeringOffset = schema.__listView.options.triggeringOffset || 500;
            let pageTop = $(window).scrollTop();
            let pageBottom = pageTop + $(window).height() + triggeringOffset;
            let elementTop = $loadMore.offset().top;
            let elementBottom = elementTop + $loadMore.height();

            if ((elementTop <= pageBottom)) {
                SkeleUtils.GlobalUtilities.logger('triggering autoLoad ->', 'skelelist');
                skeleLoadMore(this, instance);
            }
        });
    }
});

Template.skelelistPagination.events({
    'click .skeleLoadMore': function(event, instance) {
        skeleLoadMore(event, instance);
    }
});


function skeleLoadMore(event, instance) {
    let data = instance.data;
    let schema = data.schema;
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


// skelelist search
Template.skelelistSearch.events({
    'click .skelelistSearchBtn': function(event, instance) {
        let data = instance.data;
        let schema = data.schema;
        let collection = schema.__collection;
        let subManager = schema.__subManager;
        let listSchema = schema.__listView;
        let options = {
            fields: {}
        };

        for (let field of listSchema.itemFields) {
            options.fields[field.name] = 1;
        }
        for (let param of listSchema.detailLink.params) {
            options.fields[param] = 1;
        }

        // TO FIX: this callback is never called more than once
        // so if you visit another route afterf filtering and then come back
        // it is not executed again since the subscription is already "ready"
        callback = function() {
            instance.data.listQuery.set({last_name: 'REVELLO'});
        }

        if (subManager) {
            documentList = Skeletor.subsManagers[subManager].subscribe(
                'rawFindDocuments',
                collection,
                {last_name: 'REVELLO'},
                options,
                data.schemaName,
                null,
                callback
            );
        }
        else {
            documentList = Meteor.subscribe(
                'rawFindDocuments',
                collection,
                {last_name: 'REVELLO'},
                options,
                data.schemaName,
                null,
                callback
            );
        }
    }
})
