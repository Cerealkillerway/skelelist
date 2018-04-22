import { FlowRouter } from 'meteor/ostrio:flow-router-extra';


// skelelist
Template.skelelist.onRendered(function() {
    let options = this.data.schema.__listView.options;

    SkeleUtils.GlobalUtilities.scrollTo(0, Skeletor.configuration.animations.onRendered);

    // set page query param
    if (options && options.pagination) {
        if (!FlowRouter.getQueryParam('page')) {
            FlowRouter.setQueryParams({page: 1});
        }
    }
});
Template.skelelist.events({
    'click .skelelistLink': function(event, instance) {
        let documentId = $(event.target).closest('tr').data('id');

        // set document id in order to let skeletor find it in case
        // it is not yet translated for current lang
        Session.set('currentItem', documentId);
    }
});
