/**
 * View for displaying the feedback
 */
function FeedbackView(question) {
	var self = this;

	self.tagID = 'cardFeedbackView';

	jester($('#FeedbackDoneButon')[0]).tap(function() {
		self.clickFeedbackDoneButton();
	});
	jester($('#FeedbackMore')[0]).tap(function() {
		self.clickFeedbackMore();
	});
	jester($('#CourseList_FromFeedback')[0]).tap(function() {
		self.clickCourseListButton();
	});
	
	 // center the feedback body to the middle of the screen
    function setOrientation() {
        $(".cardBody").css('height', window.innerHeight - 70);
        $(".cardBody").css('width', window.innerWidth - 100);
        
    }
    setOrientation();
    //when orientation changes, set the new width and height
    //resize event should be caught, too, because not all devices
    //send an oritentationchange even
    window.addEventListener("orientationchange", setOrientation, false);
    window.addEventListener("resize", setOrientation, false);
}

/**
 * tap does nothing
 */

FeedbackView.prototype.handleTap = doNothing;

/**
 * swipe leads to new question
 */
FeedbackView.prototype.handleSwipe = function handleSwipe() {
	$("#feedbackBody").show();
	$("#feedbackTip").hide();
	controller.models['questionpool'].nextQuestion();
	controller.transitionToQuestion();
};

/**
 * pinch leads to course list
 */
FeedbackView.prototype.handlePinch = function() {
	controller.transitionToCourses();
};

/**
 * closes the view
 */
FeedbackView.prototype.closeDiv = closeView;

/**
 * deletes data from answer model
 */
FeedbackView.prototype.close = function() {
	controller.models["answers"].deleteData();
	$("#feedbackTip").empty();
	$("#feedbackTip").hide();
	$("#feedbackBody").show();
	this.closeDiv();

};

/**
 * opens the view
 */
FeedbackView.prototype.openDiv = openView;

/**
 * shows feedback title and body
 */
FeedbackView.prototype.open = function() {
	this.showFeedbackBody();
	this.showFeedbackTitle();
	this.openDiv();
};

/**
 * click on feedback done button leads to new question
 */
FeedbackView.prototype.clickFeedbackDoneButton = function() {
	controller.models['questionpool'].nextQuestion();
	controller.transitionToQuestion();

};

/**
 * click on feedback more button toggles the feedback body and the tip
 */
FeedbackView.prototype.clickFeedbackMore = function() {
	$("#feedbackBody").toggle();
	$("#feedbackTip").toggle();
};

/**
 * click on the course list button leads to course list
 */
FeedbackView.prototype.clickCourseListButton = function() {
	controller.transitionToCourses();
};


/**
 * shows feedback title and corresponding icon
 */
FeedbackView.prototype.showFeedbackTitle = function() {
	var currentFeedbackTitle = controller.models["answers"].getAnswerResults();
	
	$("#cardFeedbackTitle").text(jQuery.i18n.prop('msg_' +currentFeedbackTitle + 'Results_title'));

//	if (currentFeedbackTitle == "Wrong") {
//		$("#feedbackIcon").removeClass("icon-happy");
//		$("#feedbackIcon").removeClass("icon-smiley");
//		$("#feedbackIcon").addClass("icon-neutral");
//	} else if (currentFeedbackTitle == "Partially Correct") {
//		$("#feedbackIcon").removeClass("icon-happy");
//		$("#feedbackIcon").removeClass("icon-neutral");
//		$("#feedbackIcon").addClass("icon-smiley");
//	} else {
//		$("#feedbackIcon").removeClass("icon-neutral");
//		$("#feedbackIcon").removeClass("icon-smiley");
//		$("#feedbackIcon").addClass("icon-happy");
//	}



	$("#feedbackIcon").attr('class',jQuery.i18n.prop('msg_' + currentFeedbackTitle + '_icon'));
	
	
};

/**
 * calls the appropriate widget to show the feedback body
 */
FeedbackView.prototype.showFeedbackBody = function() {

	var questionpoolModel = controller.models['questionpool'];
	var questionType = questionpoolModel.getQuestionType();
	var interactive = false;
	switch (questionType) {
		case 'assSingleChoice':
			this.widget = new SingleChoiceWidget(interactive);
			break;
		case 'assMultipleChoice':
			this.widget = new MultipleChoiceWidget(interactive);
			break;
		case 'assNumeric':
			this.widget = new NumericQuestionWidget(interactive);
			break;
		case 'assOrderingQuestion':
			this.widget = new TextSortWidget(interactive);
			break;
		default:
			break;
	}

};

