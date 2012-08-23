function QuestionView() {
    var self = this;
    
    self.tagID = 'cardQuestionView';
    
    var returnButton = $('#CourseList_FromQuestion')[0];
    if ( returnButton) {
        function cbReturnButtonTap(event) {
            self.clickCourseListButton();
            event.stopPropagation();
        }
        
        jester(returnButton).tap(cbReturnButtonTap);
    }
    
    // center the question body to the middle of the screen
    function setOrientation() {
        $("#cardQuestionBody").css('height', window.innerHeight - 120);
    }
    setOrientation();
    window.addEventListener("orientationchange", setOrientation, false);
    
    //$('#ButtonAnswer').click(function(event){ self.handleTap(); event.stopPropagation();} );
}


QuestionView.prototype.handlePinch = function() {
    controller.transitionToCourses();
};

QuestionView.prototype.handleTap = function() {
	
	
	 controller.transitionToAnswer();
	 //controller.models["answers"].deleteData();
};

QuestionView.prototype.handleSwipe = function() {
	// ask the model to select the next question
	// update the display for the current view 
    console.log("swipe works");
    controller.models['questionpool'].nextQuestion();
	this.showQuestionBody();
	this.showQuestionTitle();
};

QuestionView.prototype.close = closeView;
QuestionView.prototype.openDiv = openView;
QuestionView.prototype.open = function() {
	this.showQuestionBody();
	this.showQuestionTitle();
	this.openDiv();
	
	 //controller.models["answers"].deleteData();
};

QuestionView.prototype.showQuestionBody = function() {
	var currentQuestionBody = controller.models["questionpool"]
			.getQuestionBody();
	$("#cardQuestionBody").text(currentQuestionBody);
	
	$("#ButtonTip").hide();
	
};

QuestionView.prototype.showQuestionTitle = function() {
	var currentQuestionTitle = controller.models["questionpool"]
			.getQuestionType();
	$("#cardQuestionTitle").text(currentQuestionTitle);
};

QuestionView.prototype.clickCourseListButton = function() {
	controller.transitionToCourses();
};

