import { FlowRouter } from 'meteor/ostrio:flow-router-extra';


Template.skelelistLangBar.events({
    'click .langFlag': function(event, instance) {
        let newLang = $(event.target).closest('.langFlag').data('lang');

        FlowRouter.setParams({'itemLang': newLang});
    }
});


// skelelist pagination
Template.skelelistPagination.onCreated(function() {
    let collection = this.data.schema.__collection;
    let currentPage = Session.get(collection + '_page');

    if (!currentPage) {
        Session.set(collection + '_page', 1);
    }
});

Template.skelelistPagination.events({
    'click .skeleLoadMore': function(event, instance) {
        // do nothing if autoLoad is enabled
        if (instance.data.schema.__listView.options.autoLoad === true) {
            return false;
        }

        let collection = instance.data.schema.__collection;
        let currentPage = Session.get(collection + '_page');

        currentPage++;

        for (let loadMore of instance.data.loadMore) {
            console.log(currentPage);

            let documentsList = Skeletor.subsManagers[loadMore.subscriptionHandler].subscribe(
                loadMore.subscriptionName,
                loadMore.collection,
                loadMore.query,
                loadMore.options,
                loadMore.schemaName,
                currentPage
            );
        }

        Session.set(collection + '_page', currentPage);
    }
})
