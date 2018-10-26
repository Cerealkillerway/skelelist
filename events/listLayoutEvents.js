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
    /*if (options && options.pagination) {
        if (!FlowRouter.getQueryParam('page')) {
            FlowRouter.setQueryParams({page: 1});
        }
    }*/
});


Template.skelelistTable.events({
    'click .skelelistLink': function(event, instance) {
        let documentId = $(event.target).closest('tr').data('id');

        // set document id in order to let skeletor find it in case
        // it is not yet translated for current lang
        Session.set('currentItem', documentId);
    },

    'click .skeleListViewHeader': function(event, instance) {
        // handle sorting by clicking on column header
        let $target = $(event.target);
        let $headers = instance.$('.skeleListViewHeader');
        let index = $headers.index($target[0]);
        let listSchema = instance.data.schema.listView.get();
        let fieldName = listSchema.itemFields[index].name;

        if (listSchema.sort[fieldName] === undefined) {
            listSchema.sort = {};
            listSchema.sort[fieldName] = 1;
        }
        else {
            listSchema.sort[fieldName] = listSchema.sort[fieldName] * (-1);
        }

        instance.data.schema.listView.set(listSchema);
    }
});
