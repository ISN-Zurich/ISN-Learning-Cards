function NumericQuestionWidget(interactive) {
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

NumericQuestionWidget.prototype.showAnswer = function() {

	var questionpoolModel = controller.models['questionpool'];
	// $("#numberInputContainer").empty();
	// $("#numberInputContainer").removeClass("correctAnswer");
	$("#cardAnswerBody").empty();

	if (questionpoolModel.questionList && questionpoolModel.getAnswer()) {
//		$("#numberInputContainer").empty();
//		$("#numberInputContainer").removeClass("correctAnswer");
//		$("#cardAnswerBody").empty();
//		$("#numberInputContainer").show();
		console.log("entered numeric answer body");

		var div = $("<div/>", {
			"id": "numberInputContainer",
			"class": "inputBorder"
		}).appendTo("#cardAnswerBody");
		
		var input = $("<input/>", {
			"id" : "numberInput",
			"class" : "loginInput",
			"type" : "number"
		}).appendTo(div);

		$("#numberInputContainer")[0].addEventListener("blur", function() {setButtonHeight();});
		
	} else {
		this.didApologize = true;
		doApologize();
	}

};

NumericQuestionWidget.prototype.showFeedback = function() {
	console.log("start show feedback in numeric choice");

//	$("#numberInputContainer").show();
	$("#feedbackBody").empty();
	$("#feedbackTip").empty();
//	$("#numberInputContainer").show();

	var questionpoolModel = controller.models["questionpool"];
	var answerModel = controller.models["answers"];
	var typedAnswer = answerModel.getAnswers();
	var correctAnswer = questionpoolModel.getAnswer();
	var currentFeedbackTitle = controller.models["answers"].getAnswerResults();

	
//	var clone = $("#numberInputContainer").clone();
//	$("#numberInputContainer").remove("#numberInput");
//	$("#numberInputContainer").text(typedAnswer);
//	clone.appendTo("#feedbackBody");
	
	var div = $("<div/>", {
		"id": "typedAnswer",
		"class": "inputBorder",
		text: typedAnswer
	}).appendTo("#feedbackBody");
	
	
	if (currentFeedbackTitle == "Excellent") {

		$("#typedAnswer").addClass("correctAnswer");
		
		var correctText = questionpoolModel.getCorrectFeedback();
		if (correctText.length > 0) {
			$("#FeedbackMore").show();
			$("#feedbackTip").text(correctText);
		} else {
			$("#FeedbackMore").hide();
		}
	} else { // current feedback title is wrong
		console.log('handle answer results');

		$("<div/>", {
			"id" : "numericFeedback",
			text : "the correct answer is"
		}).appendTo("#feedbackBody");

		$("<div/>", {
			"id" : "correctNumericFeedback",
			"class" : "inputBorder correctAnswer",
			text : correctAnswer
		}).appendTo("#feedbackBody");

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

NumericQuestionWidget.prototype.storeAnswers = function() {

	var questionpoolModel = controller.models["questionpool"];

	var numericAnswer = $("#numberInput").val();

	controller.models["answers"].setAnswers(numericAnswer);
	$("#numberInput").val("");
};

NumericQuestionWidget.prototype.clickDoneButton = function() {

	var questionpoolModel = controller.models['questionpool'];

	if (questionpoolModel.getAnswer()) {

		this.widget.storeAnswers();
		questionpoolModel.queueCurrentQuestion();
		controller.transitionToFeedback();
	} else {

		questionpoolModel.nextQuestion();
		controller.transitionToQuestion();

	}

};

console.log("end of numeric choice widget");
