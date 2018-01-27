// delete confirmation block
Template.skelelistActionDeleteTimerConfirm.helpers({
    secondsRemaining: function() {
        return Template.instance().confirmationCounter.get();
    }
});
