//*******************************************SINGLE CHOICE WIDGET*************************************
//The Single choice widget has two views, an answer and a feedback view.
//The anwer view contains a list with possible solutions and the selected answer by the user is highlighted.
//The feedback view contains the list with the possible solutions highlighted by both the correct answer and learner's ticked answer.
//Sometimes when available, the feedback view provides extra feedback information, both for correct and wrong feedback.

//*************************************** CONSTRUCTOR **************************

function SingleChoiceWidget(interactive) {
	var self = this;
    self.interactive = interactive;
	self.didApologize = false; // a flag tracking when questions with no data
                               // are loaded and an error message is displayed
                               // on the screen
    
    console.log('check for previous answers');
	self.tickedAnswers = controller.models["answers"].getAnswers();// a list
																	// with the
																	// currently
																	// selected
																	// answers
    console.log('ok');

	// Check the boolean value of intractive. This is set through the answer and
	// feedback view.
	if (self.interactive) {
		// when answer view is active, then interactive variable is set to true.
		self.showAnswer(); // displays the answer body of the multiple choice
							// widget
	} else {
		// when feedback view is active, then interactive is set to false.
		self.showFeedback(); // displays the feedback body of the multiple
								// choice widget
	}
}

// **********************************************************METHODS***************************************

SingleChoiceWidget.prototype.cleanup = doNothing;

// Creation of answer body for single choice questions. It contains a list with
// the possible solutions. Only one of them can be ticked each time.

SingleChoiceWidget.prototype.showAnswer = function() {
	var questionpoolModel = controller.models['questionpool'];

	// Check if there is a question pool and if there are answers for a specific
	// question in order to display the answer body
	if (questionpoolModel.questionList
			&& questionpoolModel.getAnswer()[0].answertext) {

		var self = this;
        var answers = questionpoolModel.getAnswer();// returns an array
													// containing the possible
													// answers

		var mixedAnswers;
		if (!questionpoolModel.currAnswersMixed()) {
			questionpoolModel.mixAnswers();
		}			
		mixedAnswers = questionpoolModel.getMixedAnswersArray();

		$("#cardAnswerBody").empty();

		var ul = $("<ul/>", {}).appendTo("#cardAnswerBody");

		for ( var c = 0; c < mixedAnswers.length; c++) {
			// when an answer item is clicked a highlighted background color is
			// applied to it via "ticked" class
			var li = $(
					"<li/>",
					{
						"id" : "answer" + mixedAnswers[c],
						"class" : (self.tickedAnswers.indexOf(mixedAnswers[c]) != -1 ? " ticked" : "") //"answerLi" + 
					}).appendTo(ul);
			// handler when taping on an item on the answer list
			jester(li[0]).tap(function() {
				self.clickSingleAnswerItem($(this));
			});
			// displays the text value for each answer item on the single choice
			// list
			var div = $("<div/>", {
				"class" : "text",
				text : answers[mixedAnswers[c]].answertext
			}).appendTo(li);
		}

	} else {
		// if there are no data for a question or there is no questionpool then
		// display the error message
		this.didApologize = true;
		doApologize();
	}
};

// Creation of feedback body for single choice questions. It contains the list
// with the possible solutions highlighted by both the correct answer and
// learner's ticked answer

SingleChoiceWidget.prototype.showFeedback = function() {
	$("#feedbackBody").empty();
	$("#feedbackTip").empty();

	var clone = $("#cardAnswerBody ul").clone(); // clone the answerbody,
	clone.appendTo("#feedbackBody");

	var questionpoolModel = controller.models["questionpool"];
	$("#feedbackBody ul li").each(function(index) {
		if (questionpoolModel.getScore(parseInt($(this).attr('id').substring(6))) > 0) {
			console.log("div text high: " + $(this).find("div").css("height"));

			var div = $("<div/>", {
				"class" : "right correctAnswer icon-checkmark"
			}).prependTo(this);
		}
	});

	// Handling the display of more tips/info about the feedback
	var currentFeedbackTitle = controller.models["answers"].getAnswerResults(); // returns
																				// excellent
																				// or
																				// wrong
																				// based
																				// on
																				// the
																				// answer
																				// resutls
																				// for
																				// a
																				// specific
																				// question
																				// type
	if (currentFeedbackTitle == "Excellent") {
		var correctText = questionpoolModel.getCorrectFeedback();// gets
																	// correct
																	// feedback
																	// text
		if (correctText.length > 0) {
			// when extra feedback info is available
			$("#FeedbackMore").show();
			$("#feedbackTip").text(correctText);
		} else {
			// if no extra feedback information is available then hide the tip
			// button
			$("#FeedbackMore").hide();
		}
	} else { // if the answer results are wrong
		var wrongText = questionpoolModel.getWrongFeedback();// gets wrong
                                                             // feedback text
		console.log(wrongText);
		if (wrongText && wrongText.length > 0) {
			// when extra feedback info is available then display it
			$("#FeedbackMore").show();
			$("#feedbackTip").text(wrongText);
		} else {
			// if no extra feedback information is available then hide the tip
			// button
			$("#FeedbackMore").hide();
		}

	}
};

// Handling behavior when click on the an item of the single answers list
SingleChoiceWidget.prototype.clickSingleAnswerItem = function(clickedElement) {

	// to check if any other element is ticked and untick it
	clickedElement.parent().find("li").removeClass("ticked");
	// add a background color to the clicked element
	clickedElement.addClass("ticked");

};

// Storing the ticked answers in an array
SingleChoiceWidget.prototype.storeAnswers = function() {
	var answers = new Array();

	$("#cardAnswerBody li").each(function(index) {
		if ($(this).hasClass("ticked")) {
			var tickedIndex = parseInt($(this).attr('id').substring(6));
			answers.push(tickedIndex);
		}
	});

	controller.models["answers"].setAnswers(answers);
};


SingleChoiceWidget.prototype.calculateAnswerScore = function() {
	controller.models["answers"].calculateSingleChoiceScore();
}


// Handling behavior when click on the done-forward button on the right of the
// screen
SingleChoiceWidget.prototype.clickDoneButton = function() {

	var questionpoolModel = controller.models['questionpool'];

	if (questionpoolModel.getAnswer()[0].text && questionpoolModel) {
		// if the question has data and if there is a question pool move to the
		// feedback view

		this.widget.storeAnswers();
		questionpoolModel.queueCurrentQuestion();
		controller.transitionToFeedback();
	} else {
		// if the question has no data then move to the next question
		questionpoolModel.nextQuestion();
		controller.transitionToQuestion();

	}

};

SingleChoiceWidget.prototype.setCorrectAnswerTickHeight = function() {
	$("#feedbackBody ul li").each(function() {
		console.log("height: " + $(this).height());
		height = $(this).height();
		$(this).find(".correctAnswer").height(height);
		$(this).find(".correctAnswer").css("line-height", height + "px");
	});
};

console.log("end of single choice widget");