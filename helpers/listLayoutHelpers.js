import { Counts } from 'meteor/ros:publish-counts';


// skelelist
Template.skelelist.helpers({
    listStyle: function(style) {
        return 'skelelist' + style.capitalize();
    },

    documentsCounter: function() {
        let schema = Template.instance().data.schema;
        let collection = schema.__collection;

        return Counts.get(`${collection}Counter`);
    }
});


// list table view
Template.skelelistTable.helpers(SkeleUtils.GlobalHelpers.skelelistGeneralHelpers);
Template.skelelistTable.helpers({
    actionsData: function(record) {
        const instance = Template.instance();

        let data = {
            schema: instance.data.schema,
            schemaName: instance.data.schemaName,
            record: record,
            skelelistInstance: instance.data.skelelistInstance
        };

        return data;
    }
});
