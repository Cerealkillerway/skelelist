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
        actionData.actionContainerInstance = this;

        if (templateToRender !== undefined) {
            Blaze.renderWithData(templateToRender, actionData, this.$('.skelelistActions')[0]);
        }
        else {
            skeleUtils.globalUtilities.logger('tried to render ' + action + ' action, but SkelelistAction' + action.capitalize() + ' template does not exists', 'skeleError', false, true);
        }
    });
});

// skelelist actions
// delete
Template.skelelistActionDelete.events({
    'click .skelelistDelete': function(event, instance) {
        let data = instance.data;
        let id = data.record._id;
        let options = data.actionOptions;

        if (options.confirm) {
            let confirmOptions = options.confirm;
            let $extrasContainer = data.actionContainerInstance.$('.skelelistActionExtras');
            let confirmTemplateName = confirmOptions.template || 'skelelistActionDeleteTimerConfirm';
            let confirmTemplate = Template[confirmTemplateName];

            // render delete confirmation block in the "action extras" wrapper in parent template (skelelistActions)
            if (confirmTemplate) {
                Blaze.renderWithData(confirmTemplate, data, $extrasContainer[0]);
            }
            else {
                skeleUtils.globalUtilities.logger('tried to render ' + confirmTemplateName + ' as delete confirm template, but it does not exists', 'skeleError', false, true);
            }
            // hide action buttons block
            data.actionContainerInstance.$('.skelelistActions').hide(0);
            // show action extras block
            $extrasContainer.show(0);

            return false;
        }
        else {
            Meteor.call('deleteDocument', id, data.schemaName);
        }
    }
});

// delete confirmation block
Template.skelelistActionDeleteTimerConfirm.onCreated(function() {
    let confirmOptions = this.data.actionOptions.confirm;
    let timeoutSeconds = (confirmOptions.timeout) / 1000 || 3;

    this.confirmationCounter = new ReactiveVar(timeoutSeconds);
});
Template.skelelistActionDeleteTimerConfirm.onRendered(function() {
    let barWidth = 0;
    let $timerBar = this.$('.determinate');
    let confirmOptions = this.data.actionOptions.confirm;
    let timeout = confirmOptions.timeout || 3000;
    let timeoutSeconds = timeout / 1000;
    let intervalTiming = timeout / 100;
    let step = Math.floor(100 / timeoutSeconds);
    let steps = [];
    let tmp = step;

    while (tmp <= 100) {
        steps.push(tmp);
        tmp = tmp + step;
    }

    $timerBar.css({width: '0'});
    this.$('.deleteConfirmation').removeClass('hide');
    this.$('.skelelistDelete').addClass('hide');

    this.cancelDeletion = function(instance) {
        Meteor.clearTimeout(instance.progressInterval);
        instance.$('.deleteConfirmation').addClass('hide');
        instance.$('.skelelistDelete').removeClass('hide');

        instance.data.actionContainerInstance.$('.skelelistActions').show(0);
        Blaze.remove(instance.view);
    };

    this.progressInterval = Meteor.setInterval(() => {
        // increase the timer bar
        barWidth++;
        $timerBar.css({width: barWidth + '%'});

        // update seconds countdown
        if (steps.indexOf(barWidth) >= 0) {
            this.confirmationCounter.set(this.confirmationCounter.get() - 1);
        }

        // when the bar is full, remove the confirmation block from "action extras" wrapper,
        // hide it and show  action buttons block
        if (barWidth === 100) {
            this.restoreDeleteBtnTimeout = Meteor.setTimeout(() => {
                this.cancelDeletion(this);
            }, 500);
        }
    }, intervalTiming);
});
Template.skelelistActionDeleteTimerConfirm.events({
    'click .deleteActionSwitch': function(event, instance) {
        let data = instance.data;
        let id = data.record._id;

        Meteor.setTimeout(function() {
            Meteor.call('deleteDocument', id, data.schemaName);
        }, 600);
    },
    'click .cancelDeletion': function(event, instance) {
        Meteor.clearTimeout(instance.restoreDeleteBtnTimeout);
        instance.cancelDeletion(instance);
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
