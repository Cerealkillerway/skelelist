// skelelist
Template.skelelist.helpers({
    listStyle: function(style) {
        return 'skelelist' + style.capitalize();
    }
});


// list table view
Template.skelelistTable.helpers(Skeletor.SkeleUtils.GlobalHelpers.skelelistGeneralHelpers);
Template.skelelistTable.helpers({
    actionsData: function(record, skelelistInstance) {
        const instance = Template.instance();

        let data = {
            schema: instance.data.schema,
            schemaName: instance.data.schemaName,
            record: record,
            skelelistInstance: skelelistInstance
        };

        return data;
    }
});
