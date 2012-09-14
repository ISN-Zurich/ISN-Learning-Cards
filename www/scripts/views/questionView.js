/**
 * View for displaying questions
 */
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
    //when orientation changes, set the new width and height
    //resize event should be caught, too, because not all devices
    //send an oritentationchange event 
    window.addEventListener("orientationchange", setOrientation, false);
    window.addEventListener("resize", setOrientation, false);
    
}

/**
 * pinch leads to the course list
 */
QuestionView.prototype.handlePinch = function() {
    controller.transitionToCourses();
};

/**
 * tap leads to the answer view
 */
QuestionView.prototype.handleTap = function() {
	 controller.transitionToAnswer();
};

/**
 * swipe shows a new question
 * updates question body and title
 */
QuestionView.prototype.handleSwipe = function() {
	// ask the model to select the next question
	// update the display for the current view 
    console.log("swipe works");
    controller.models['questionpool'].nextQuestion();
	this.showQuestionBody();
	this.showQuestionTitle();
};

/**
 * closes the view
 */
QuestionView.prototype.close = closeView;

/**
 * opens the view
 */
QuestionView.prototype.openDiv = openView;

/**
 * shows the question body and title
 */
QuestionView.prototype.open = function() {
	this.showQuestionBody();
	this.showQuestionTitle();
	this.openDiv();
	
	 //controller.models["answers"].deleteData();
};

/**
 * shows the current question text
 */
QuestionView.prototype.showQuestionBody = function() {
	var currentQuestionBody = controller.models["questionpool"]
			.getQuestionBody();
	$("#cardQuestionBody").html(currentQuestionBody);
	
	$("#ButtonTip").hide();
	
};

/**
 * shows the current question title and the corresponding icon
 */
QuestionView.prototype.showQuestionTitle = function() {
	var currentQuestionTitle = controller.models["questionpool"]
			.getQuestionType();
	
	$("#questionIcon").removeClass();
	
	$("#questionIcon").addClass(jQuery.i18n.prop('msg_' + currentQuestionTitle + '_icon'));
	$("#cardQuestionTitle").text(jQuery.i18n.prop('msg_' + currentQuestionTitle + '_title'));
	
//	switch (currentQuestionTitle) {
//	case 'assSingleChoice':
//		$("#questionIcon").addClass(jQuery.i18n.prop('msg_singleChoice_icon'));
//		$("#cardQuestionTitle").text("Single Choice Question");
//		break;
//	case 'assMultipleChoice':
//		$("#questionIcon").addClass("icon-checkmark");
//		$("#cardQuestionTitle").text("Multiple Choice Question");
//		break;
//	case 'assOrderingQuestion':
//		$("#questionIcon").addClass("icon-move-vertical");
//		$("#cardQuestionTitle").text("Text Order Question");
//		break;
//	case 'assNumeric':
//		$("#questionIcon").addClass("icon-pencil");
//		$("#cardQuestionTitle").text("Numeric Question");
//		break;
//	default:
//		break;
//	}
};

/**
 * click on the course list button leads to course list
 */
QuestionView.prototype.clickCourseListButton = function() {
	controller.transitionToCourses();
};

