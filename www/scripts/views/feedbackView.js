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
    window.addEventListener("orientationchange", setOrientation, false);
    window.addEventListener("resize", setOrientation, false);

}

FeedbackView.prototype.handleTap = doNothing;
FeedbackView.prototype.handleSwipe = function handleSwipe() {
	$("#feedbackBody").show();
	$("#feedbackTip").hide();
	controller.models['questionpool'].nextQuestion();
	controller.transitionToQuestion();
};

FeedbackView.prototype.handlePinch = function() {
	controller.transitionToCourses();
};

FeedbackView.prototype.closeDiv = closeView;
FeedbackView.prototype.close = function() {
	controller.models["answers"].deleteData();
	$("#feedbackTip").empty();
	$("#feedbackTip").hide();
	$("#feedbackBody").show();
	this.closeDiv();

};
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
	$("#feedbackBody").toggle();
	$("#feedbackTip").toggle();
};

FeedbackView.prototype.showFeedbackTitle = function() {
	var currentFeedbackTitle = controller.models["answers"].getAnswerResults();
	$("#cardFeedbackTitle").text(currentFeedbackTitle);

	if (currentFeedbackTitle == "Wrong") {
		$("#feedbackIcon").removeClass("icon-happy");
		$("#feedbackIcon").removeClass("icon-smiley");
		$("#feedbackIcon").addClass("icon-neutral");
	} else if (currentFeedbackTitle == "Partially Correct") {
		$("#feedbackIcon").removeClass("icon-happy");
		$("#feedbackIcon").removeClass("icon-neutral");
		$("#feedbackIcon").addClass("icon-smiley");
	} else {
		$("#feedbackIcon").removeClass("icon-neutral");
		$("#feedbackIcon").removeClass("icon-smiley");
		$("#feedbackIcon").addClass("icon-happy");
	}

};

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
		// ...
		default:
			break;
	}

};

FeedbackView.prototype.clickCourseListButton = function() {

	controller.transitionToCourses();

};
