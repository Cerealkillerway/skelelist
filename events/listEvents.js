// skelelist
Template.skelelist.onRendered(function() {
    let listProps = this.data.schema.__listView;
    let options = listProps.options;

    listProps.itemActions.forEach((action) => {
        // if there is any actions that requires a modal, add it to the modals' container
        let modalName = 'skelelistAction' + action.capitalize() + 'Modal';
        let modalToRender = Template[modalName];

        if (modalToRender) {
            Blaze.renderWithData(modalToRender, this.data, this.$('.skelelistModals')[0]);
        }
    });

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

    // render all needed actions
    actions.forEach((action, index) => {
        let templateName = 'skelelistAction' + action.capitalize();
        let templateToRender = Template[templateName];

        if (templateToRender !== undefined) {
            Blaze.renderWithData(templateToRender, data, this.$('.skelelistActions')[0]);
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

        Meteor.call('deleteDocument', id, data.schemaInfo.schemaName);
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
            actionInstance: instance
        };
        let $modal = data.skelelistInstance.$('#skeletorUserChangePasswordModal');
        let skelelistInstance = data.skelelistInstance;
        let modalName = 'skelelistActionChangePasswordModal';

        skelelistInstance.data.changePasswordModalFormView = Blaze.renderWithData(
            Template.skeleform,
            context,
            skelelistInstance.$('#skeletorUserChangePasswordForm')[0]
        );
        $modal.modal('open');
        $modal.find('input:first').focusWithoutScrolling();
    }
});
// change password modal
Template.skelelistActionChangePasswordModal.onRendered(function () {
    this.$('#skeletorUserChangePasswordModal').modal({
        complete: () => {
            Blaze.remove(this.data.changePasswordModalFormView);
        }
    });
});
// user change password toolbar
Template.userChangePasswordToolbar.events({
    'click .undoChangePassword': function(event, instance) {
        Blaze.remove(instance.data.actionInstance.form);
        instance.data.actionInstance.$('#skeletorUserChangePasswordModal').modal('close');
    },
    'click .skeleformChangePassword': function(event, instance) {
        let formContext = instance.data;
        let Fields = instance.data.Fields;
        let data = Skeleform.utils.skeleformGatherData(formContext, Fields);

        if (Skeleform.utils.skeleformValidateForm(data, Fields)) {
            Meteor.call('updateUserPassword', instance.data.formContext.item._id, $('#newPassword').val(), function(error, result) {
                if (error) {
                    Materialize.toast(TAPi18n.__('serverError_error'), 5000, 'error');
                }
                else {
                    Materialize.toast(TAPi18n.__('passwordCanged_msg', instance.data.formContext.item.username), 5000, 'success');
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
