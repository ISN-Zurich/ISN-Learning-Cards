function FeedbackView(question) {
    var self = this;
    

    self.tagID = 'cardFeedbackView';
    
$('#FeedbackDoneButon').click(function(){ self.clickFeedbackDoneButton(); } );
$('#FeedbackMore').click(function(){ self.clickFeedbackMore(); } );
    
}

FeedbackView.prototype.handleTap = doNothing;
FeedbackView.prototype.handleSwipe = handleSwipe;
FeedbackView.prototype.close = closeView;
FeedbackView.prototype.open = openView;

FeedbackView.prototype.clickFeedbackDoneButton() {


    Controller.models['questionpool'].nextQuestion(); 
    Controller.transitionToQuestion();  
         
};


FeedbackView.prototype.clickFeedbackMore() {

//Controller.transitionToFeedbackMore();         

};


function handleSwipe () {

    Controller.models['questionpool'].nextQuestion(); 
    
    Controller.transitionToQuestion();      


}