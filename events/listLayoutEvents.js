import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { Counts } from 'meteor/ros:publish-counts';


// skelelist
Template.skelelist.onCreated(function() {
    // make schema's global __lisvView reactive
    let schema = this.data.schema;
    let collection = schema.__collection;

    this.data.listQuery = new ReactiveVar({});
    schema.listView = new ReactiveVar(this.data.schema.__listView);

    Skeletor.subsManagers.countersSubs.subscribe('countCollection', collection);
});


Template.skelelist.onRendered(function() {
    let options = this.data.schema.listView.get().options;

    SkeleUtils.GlobalUtilities.scrollTo(0, Skeletor.configuration.animations.onRendered);
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
        let $target = $(event.currentTarget);
        let $headers = instance.$('.skeleListViewHeader');
        let index = $headers.index($target[0]);
        let listSchema = instance.data.schema.listView.get();
        let fieldName = listSchema.itemFields[index].name;
        let newSortObject = {};

        if (listSchema.sort[fieldName] === undefined) {
            newSortObject[fieldName] = {
                direction: 1
            };
        }
        else {
            newSortObject[fieldName] = {
                direction: listSchema.sort[fieldName].direction * (-1)
            };

            if (listSchema.sort[fieldName].caseInsensitive) {
                newSortObject[fieldName].caseInsensitive = true;
            }
        }

        listSchema.sort = newSortObject;

        instance.data.schema.listView.set(listSchema);
    }
});
