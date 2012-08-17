function FeedbackView(question) {
    var self = this;
    

    self.tagID = 'cardFeedbackView';
    
    $('#FeedbackDoneButon').click(function(){ self.clickFeedbackDoneButton(); } );
    $('#FeedbackMore').click(function(){ self.clickFeedbackMore(); } );
    
}

FeedbackView.prototype.handleTap = doNothing;
FeedbackView.prototype.handleSwipe = handleSwipe;
FeedbackView.prototype.handlePinch = function() {
    controller.transitionToCourses();
};


FeedbackView.prototype.close = closeView;
FeedbackView.prototype.open = openView;

FeedbackView.prototype.clickFeedbackDoneButton = function() {


    controller.models['questionpool'].nextQuestion(); 
    controller.transitionToQuestion();  
         
};


FeedbackView.prototype.clickFeedbackMore = function() {

//controller.transitionToFeedbackMore();         

};


function handleSwipe () {

    controller.models['questionpool'].nextQuestion(); 
    
    controller.transitionToQuestion();      


}