// skelelist actions container
Template.skelelistActions.onRendered(function() {
    let data = this.data;
    let record = data.record;
    let actions = data.schema.__listView.itemActions;
    let collection = data.schema.__collection;

    // check if current record has the "options" field and handle it
    if (record.skelelistOptions && record.skelelistOptions.actions) {
        actions = actions.filter(function(action) {
            if (record.skelelistOptions.actions[action.name] === false) {
                return false;
            }
            return true;
        });
    }

    // render all needed actions
    actions.forEach((action, index) => {
        let templateName = 'skelelistAction' + action.name.capitalize();
        let templateToRender = Template[templateName];

        // add the action options to the data context for the action template
        let actionData = {};

        _.extend(actionData, data);
        actionData.actionOptions = action;
        actionData.actionContainerInstance = this;

        // handle action's permission option
        if (actionData.actionOptions.permission) {
            if (!SkeleUtils.Permissions.checkPermissions(actionData.actionOptions.permission)) {
                SkeleUtils.GlobalUtilities.logger('No permissions for action ' + action.name, 'skelelist');
                return false;
            }
        }

        if (templateToRender !== undefined) {
            Blaze.renderWithData(templateToRender, actionData, this.$('.skelelistActions')[0]);
        }
        else {
            SkeleUtils.GlobalUtilities.logger('tried to render ' + action + ' action, but SkelelistAction' + action.capitalize() + ' template does not exists', 'skeleError', false, true);
        }
    });
});
