import { FlowRouter } from 'meteor/ostrio:flow-router-extra';


// skelelist
Template.skelelist.onCreated(function() {
    // make schema's global __lisvView reactive
    this.data.schema.listView = new ReactiveVar(this.data.schema.__listView);
});


Template.skelelist.onRendered(function() {
    let options = this.data.schema.listView.get().options;

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
    },
    'click #test': function(event, instance) {
        let listView = instance.data.schema.listView.get();

        for (key of _.keys(listView.sort)) {
            listView.sort[key] = listView.sort[key] * (-1);
        }

        instance.data.schema.listView.set(listView);
    }
});
