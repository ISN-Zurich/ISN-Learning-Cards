function FeedbackView(question) {
    var self = this;
    

    self.tagID = 'cardFeedbackView';
    
    jester($('#FeedbackDoneButon')[0]).tap(function(){ self.clickFeedbackDoneButton(); } );
    jester($('#FeedbackMore')[0]).tap(function(){ self.clickFeedbackMore(); } );
    
}

FeedbackView.prototype.handleTap = doNothing;
FeedbackView.prototype.handleSwipe = handleSwipe;
FeedbackView.prototype.handlePinch = function() {
    controller.transitionToCourses();
};


FeedbackView.prototype.close = closeView;
FeedbackView.prototype.openDiv = openView;
FeedbackView.prototype.open = function() {
	this.showFeedbackTitle();
	this.showFeedbackBody();
	this.openDiv();
};

FeedbackView.prototype.clickFeedbackDoneButton = function() {


    controller.models['questionpool'].nextQuestion(); 
    controller.transitionToQuestion();  
         
};


FeedbackView.prototype.clickFeedbackMore = function() {

//controller.transitionToFeedbackMore();         

};



FeedbackView.prototype.showFeedbackTitle = function() {
	var currentFeedbackTitle = controller.models["answers"].getAnswerResults();
	$("#cardFeedbackTitle").text(currentFeedbackTitle);
	
	
		
};


FeedbackView.prototype.showFeedbackBody = function() {
	
	$("#feedbackBody").empty();
	
	var clone = $("#cardAnswerBody").clone();
	clone.appendTo("#feedbackBody");
	
	var questionpoolModel = controller.models["questionpool"];
	
	$("#feedbackBody ul li").each(function(index) {
		if (questionpoolModel.getScore(index) == 1) {
			$(this).addClass("correctAnswer");
		}
	});
	
	
};

function handleSwipe () {

    controller.models['questionpool'].nextQuestion(); 
    
    controller.transitionToQuestion();      


};