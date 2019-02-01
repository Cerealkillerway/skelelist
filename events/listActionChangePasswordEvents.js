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
        let fields = formContext.fields;
        let gatheredData = Skeleform.utils.skeleformGatherData(data, fields);

        if (Skeleform.validate.skeleformValidateForm(gatheredData, fields)) {
            Meteor.call('updateUserPassword', formContext.item._id, $('#newPassword').val(), function(error, result) {
                if (error) {
                    if (error.error === 'unauthorized') {
                        Materialize.toast(Skeletor.Skelelang.i18n.get('permissions_error'), 5000, 'permissionsError');
                        SkeleUtils.GlobalUtilities.logger(error, 'skeleWarning', false, true);
                    }
                    else {
                        Materialize.toast(Skeletor.Skelelang.i18n.get('serverError_error'), 5000, 'error');
                        SkeleUtils.GlobalUtilities.logger(error, 'skeleWarning', false, true);
                    }
                }
                else {
                    Materialize.toast(Skeletor.Skelelang.i18n.get('passwordCanged_msg', formContext.item.username), 5000, 'success');
                    $('#skeletorUserChangePasswordModal').modal('close');
                }
            });
        }
    }
});
