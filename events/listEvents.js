// skelelist actions
Template.skelelistActions.events({
    "click .skelelistDelete": function(event, template) {
        var id = $(event.target).closest('tr').data('id');

        Meteor.call('deleteDocument', id, template.data.schemaName);
    }
});