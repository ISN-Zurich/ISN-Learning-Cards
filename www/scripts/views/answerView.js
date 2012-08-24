function AnswerView() {
	var self = this;

	self.tagID = 'cardAnswerView';

	self.widget = null;

	jester($('#doneButton')[0]).tap(function() {
		self.clickDoneButton();
	});
	jester($('#CourseList_FromAnswer')[0]).tap(function() {
		self.clickCourseListButton();
	});

	jester($('#cardAnswerTitle')[0]).tap(function() {
		self.clickTitleArea();
		console.log("answer title clicked");
	});
	jester($('#cardAnswerIcon')[0]).tap(function() {
		self.clickTitleArea();
		console.log("answer title clicked");
	});

}

AnswerView.prototype.handleTap = doNothing;
AnswerView.prototype.handlePinch = function() {
	controller.transitionToCourses();
};

AnswerView.prototype.handleSwipe = function() {

	controller.models["answers"].deleteData();

	controller.models['questionpool'].nextQuestion();
	controller.transitionToQuestion();
};

AnswerView.prototype.close = closeView;
AnswerView.prototype.openDiv = openView;
AnswerView.prototype.open = function() {

	this.showAnswerTitle();
	this.showAnswerBody();
	this.openDiv();

};

AnswerView.prototype.showAnswerBody = function() {

	$("#dataErrorMessage").empty();
	$("#cardAnswerBody").empty();

	var questionpoolModel = controller.models['questionpool'];

	// if (questionpoolModel.getAnswer()[0].text && questionpoolModel.) {

	var questionType = questionpoolModel.getQuestionType();
	var interactive = true;
	switch (questionType) {
	case 'Single Choice Question':
		this.widget = new SingleChoiceWidget(interactive);
		break;
	case 'Multiple Choice Question':
		this.widget = new MultipleChoiceWidget(interactive);
		break;
	case 'Text Sort Question':
		this.widget = new TextSortWidget(interactive);
		break;
	case 'Numeric Question':
		this.widget = new NumericQuestionWidget(interactive);
		break;
	default:
		break;
	}

	// } else {
	// $("<span/>", {
	// text : "Apologize, no data are loaded"
	// }).appendTo($("#dataErrorMessage"));
	// }
};

AnswerView.prototype.showAnswerTitle = function() {
	var currentAnswerTitle = controller.models["questionpool"]
			.getQuestionType();
	$("#cardAnswerTitle").text(currentAnswerTitle);
};

AnswerView.prototype.clickDoneButton = function() {

	var questionpoolModel = controller.models['questionpool'];
	console.log('check apology ' + this.widget.didApologize);
	if (this.widget.didApologize) {
		// if there was a problem with the data, the widget knows
		// in this case we proceed to the next question
		questionpoolModel.nextQuestion();
		controller.transitionToQuestion();
	} else {
		// if there was no error with the data we provide feedback to the
		// learner.
		this.widget.storeAnswers();
		questionpoolModel.queueCurrentQuestion();
		controller.transitionToFeedback();
	}
};

AnswerView.prototype.clickCourseListButton = function() {

	controller.transitionToCourses();

};

AnswerView.prototype.clickTitleArea = function() {

	this.widget.storeAnswers();
	controller.transitionToQuestion();

};
