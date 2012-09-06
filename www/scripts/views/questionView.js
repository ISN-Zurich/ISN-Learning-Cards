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
        $(".cardBody").css('height', window.innerHeight - 70);
        $(".cardBody").css('width', window.innerWidth - 100);
        
    }
    setOrientation();
    window.addEventListener("orientationchange", setOrientation, false);
    window.addEventListener("resize", setOrientation, false);
    
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
    controller.models['questionpool'].queueCurrentQuestion();
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
	$("#cardQuestionBody").html(currentQuestionBody);
	
	$("#ButtonTip").hide();
	
};

QuestionView.prototype.showQuestionTitle = function() {
	var currentQuestionTitle = controller.models["questionpool"]
			.getQuestionType();
	$("#cardQuestionTitle").text(currentQuestionTitle);
	
	$("#questionIcon").removeClass();
	
	switch (currentQuestionTitle) {
	case 'assSingleChoice':
		$("#questionIcon").addClass("icon-checkmark");
		break;
	case 'assMultipleChoice':
		$("#questionIcon").addClass("icon-checkmark");
		break;
	case 'assOrderingQuestion':
		$("#questionIcon").addClass("icon-move-vertical");
		break;
	case 'assNumeric':
		$("#questionIcon").addClass("icon-pencil");
		break;
	default:
		break;
	}
};

QuestionView.prototype.clickCourseListButton = function() {
	controller.transitionToCourses();
};

