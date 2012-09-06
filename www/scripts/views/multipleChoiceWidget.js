function MultipleChoiceWidget(interactive) {
	var self = this;

	self.tickedAnswers = controller.models["answers"].getAnswers();

	self.interactive = interactive;
	this.didApologize = false;

	if (self.interactive) {
		self.showAnswer();
		console.log("interactive true");
	} else {
		console.log("interactive false");
		self.showFeedback();
	}
}

MultipleChoiceWidget.prototype.showAnswer = function() {
	var questionpoolModel = controller.models['questionpool'];

	$("#cardAnswerBody").empty();

	if (questionpoolModel.questionList && questionpoolModel.getAnswer()[0].answertext) {
		var self = this;

		var questionpoolModel = controller.models["questionpool"];
		var answers = questionpoolModel.getAnswer();

		var ul = $("<ul/>", {
		}).appendTo("#cardAnswerBody");

		for ( var c = 0; c < answers.length; c++) {

			var li = $(
					"<li/>",
					{
						"id" : "answer" + c,
						"class" : "answerLi"
								+ (self.tickedAnswers.indexOf(c) != -1 ? " ticked"
										: "")
					}).appendTo(ul);
			jester(li[0]).tap(function() {
				self.clickMultipleAnswerItem($(this));
			});

			var div = $("<div/>", {
				"class" : "text",
				text : answers[c].answertext
			}).appendTo(li);
		}

	} else {
		this.didApologize = true;
		doApologize();
	}
};

MultipleChoiceWidget.prototype.showFeedback = function() {
	console.log("start show feedback in multiple choice");

	$("#feedbackBody").empty();
	$("#feedbackTip").empty();

	var clone = $("#cardAnswerBody ul").clone();
	clone.appendTo("#feedbackBody");

	var questionpoolModel = controller.models["questionpool"];
	$("#feedbackBody ul li").each(function(index) {
		if (questionpoolModel.getScore(index) == "1") {
			var div = $("<div/>", {
				"class" : "right correctAnswer icon-checkmark"
			}).prependTo(this);
		}
	});

	var currentFeedbackTitle = controller.models["answers"].getAnswerResults();
	if (currentFeedbackTitle == "Excellent") {
		var correctText = questionpoolModel.getCorrectFeedback();
		if (correctText.length > 0) {
			$("#FeedbackMore").show();
			$("#feedbackTip").text(correctText);
		} else {
			$("#FeedbackMore").hide();
		}
	} else {
		console.log('handle answer results');
		var wrongText = questionpoolModel.getWrongFeedback();
		console.log("XX " + wrongText);
		if (wrongText && wrongText.length > 0) {
			$("#FeedbackMore").show();
			$("#feedbackTip").text(wrongText);
		} else {
			$("#FeedbackMore").hide();
		}

	}
};

MultipleChoiceWidget.prototype.clickMultipleAnswerItem = function(
		clickedElement) {
	clickedElement.toggleClass("ticked");
};

MultipleChoiceWidget.prototype.storeAnswers = function() {
	var answers = new Array();
	var questionpoolModel = controller.models["questionpool"];

	$("#cardAnswerBody li").each(function(index) {
		if ($(this).hasClass("ticked")) {
			answers.push(index);
		}
	});

	controller.models["answers"].setAnswers(answers);
};

MultipleChoiceWidget.prototype.clickDoneButton = function() {

	var questionpoolModel = controller.models['questionpool'];

	if (questionpoolModel.getAnswer()[0].text && questionpoolModel) {

		this.widget.storeAnswers();
		questionpoolModel.queueCurrentQuestion();
		controller.transitionToFeedback();
	} else {

		questionpoolModel.nextQuestion();
		controller.transitionToQuestion();

	}

};

console.log("end of mulitple choice widget");