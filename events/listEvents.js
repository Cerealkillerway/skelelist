// skelelist
Template.skelelist.onRendered(function() {
    let options = this.data.schema.__listView.options;

    skeleUtils.globalUtilities.scrollTo(0, Skeletor.configuration.animations.onRendered);

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



// skelelist actions container
Template.skelelistActions.onRendered(function() {
    let data = this.data;
    let actions = data.schema.__listView.itemActions;
    let actionNames = _.map(actions, function(action){
        return action.name;
    });

    // render all needed actions
    actionNames.forEach((action, index) => {
        let templateName = 'skelelistAction' + action.capitalize();
        let templateToRender = Template[templateName];

        // add the action options to the data context for the action template
        let actionData = {};

        _.extend(actionData, data);
        actionData.actionOptions = actions[index];

        if (templateToRender !== undefined) {
            Blaze.renderWithData(templateToRender, actionData, this.$('.skelelistActions')[0]);
        }
        else {
            skeleUtils.globalUtilities.logger('tried to render ' + action + ' action, but SkelelistAction' + action.capitalize() + ' template does not exists', 'skeleError');
        }
    });
});

// skelelist actions
// delete
Template.skelelistActionDelete.events({
    'click .skelelistDelete': function(event, instance) {
        let data = instance.data;
        let id = data.record._id;

        Meteor.call('deleteDocument', id, data.schemaName);
    }
});

// change password
Template.skelelistActionChangePassword.events({
    'click .skelelistChangePassword': function(event, instance) {
        let data = instance.data;
        let id = data.record._id;
        let item = Meteor.users.findOne({_id: id});
        let context = {
            schemaName: 'Users_changePassword',
            schema: Skeletor.Schemas.Users_changePassword,
            item: instance.data.record,
            openModal: true
            //actionInstance: instance
        };

        // every change password template has its own "skelelistActionChangePasswordModal" div that is meant to contain the change password's modal
        // anyway the modal itself is rendered only now and destroyed when closing it, to ensure only one modal of this type is rendered at a time
        Blaze.renderWithData(Template.skelelistActionChangePasswordModal, context, instance.$('.skelelistActionChangePasswordModalWrapper')[0]);
    }
});
// change password modal
Template.skelelistActionChangePasswordModal.onRendered(function () {
    let $modal = this.$('#skeletorUserChangePasswordModal');
    // TO IMPROVE (would be better for this form to make its own subscription in order to be possible to use it everywhere)
    // since this form makes no subscriptions, mark data ready...
    this.data.skeleSubsReady = new ReactiveVar(true);

    $modal.modal({
        ready: () => {
            Blaze.renderWithData(
                Template.skeleform, this.data, this.$('#skeletorUserChangePasswordForm')[0]
            );
            $modal.find('input:first').focusWithoutScrolling();
        },

        complete: () => {
            Blaze.remove(this.view);
        }
    });

    // if required, open the modal now
    if (this.data.openModal) {
        $modal.modal('open');
    }
});
// user change password toolbar
Template.userChangePasswordToolbar.events({
    'click .undoChangePassword': function(event, instance) {
        let $modal = $(event.target).closest('#skeletorUserChangePasswordModal');

        $modal.modal('close');
    },
    'click .skeleformChangePassword': function(event, instance) {
        let data = instance.data;
        let formContext = data.formContext;
        let Fields = instance.data.Fields;
        let gatheredData = Skeleform.utils.skeleformGatherData(data, Fields);

        if (Skeleform.utils.skeleformValidateForm(gatheredData, Fields)) {
            Meteor.call('updateUserPassword', formContext.item._id, $('#newPassword').val(), function(error, result) {
                if (error) {
                    Materialize.toast(TAPi18n.__('serverError_error'), 5000, 'error');
                }
                else {
                    Materialize.toast(TAPi18n.__('passwordCanged_msg', formContext.item.username), 5000, 'success');
                    $('#skeletorUserChangePasswordModal').modal('close');
                }
            });
        }
    }
});


// skelelist pagination
Template.skelelistPagination.onRendered(function() {
    let currentPage = parseInt(FlowRouter.getQueryParam('page'));
    let lastPage = this.lastPage;

    if (currentPage === lastPage) {
        this.$('.nextPage').addClass('disabled');
    }

    if (currentPage === 1) {
        this.$('.prevPage').addClass('disabled');
    }
});


Template.skelelistPagination.events({
    'click .skelelistPageBtn': function(event, instance) {
        let number = $(event.target).closest('li').data('number');

        FlowRouter.setQueryParams({page: number});

        // manage enabling disabling next button
        if (number === instance.lastPage) {
            instance.$('.nextPage').addClass('disabled');
        }
        else {
            instance.$('.nextPage').removeClass('disabled');
        }

        // manage enabling disabling prev button
        if (number === 1) {
            instance.$('.prevPage').addClass('disabled');
        }
        else {
            instance.$('.prevPage').removeClass('disabled');
        }

        skeleUtils.globalUtilities.scrollTo(0, Skeletor.configuration.animations.onRendered);
    },
    'click .nextPage': function(event, instance) {
        let currentPage = parseInt(FlowRouter.getQueryParam('page'));
        let lastPage = instance.lastPage;

        if (currentPage < lastPage) {
            FlowRouter.setQueryParams({page: currentPage + 1});
        }

        instance.$('.prevPage').removeClass('disabled');
        if ((currentPage + 1) === lastPage) {
            $(event.target).closest('li').addClass('disabled');
        }

        skeleUtils.globalUtilities.scrollTo(0, Skeletor.configuration.animations.onRendered);
    },
    'click .prevPage': function(event, instance) {
        let currentPage = parseInt(FlowRouter.getQueryParam('page'));

        if (currentPage > 1) {
            FlowRouter.setQueryParams({page: currentPage - 1});
        }

        instance.$('.nextPage').removeClass('disabled');
        if ((currentPage - 1) === 1) {
            $(event.target).closest('li').addClass('disabled');
        }

        skeleUtils.globalUtilities.scrollTo(0, Skeletor.configuration.animations.onRendered);
    }
});


Template.skelelistLangBar.events({
    'click .langFlag': function(event, instance) {
        let newLang = $(event.target).closest('.langFlag').data('lang');

        FlowRouter.setParams({'itemLang': newLang});
    }
});
