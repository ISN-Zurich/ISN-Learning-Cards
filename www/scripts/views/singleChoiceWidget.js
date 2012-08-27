function SingleChoiceWidget(interactive) {
	var self = this;

	self.tickedAnswers = controller.models["answers"].getAnswers();
	self.interactive = interactive;
	this.didApologize = false;

	if (self.interactive) {
		self.showAnswer();
	} else {
		self.showFeedback();
	}
	
}

SingleChoiceWidget.prototype.showAnswer = function() {
	var questionpoolModel = controller.models['questionpool'];

// $("#cardAnswerBody").empty();

	if (questionpoolModel.questionList && questionpoolModel.getAnswer()[0].text) {

		var self = this;
		// console.log("enter single answer widget answer function");
		var questionpoolModel = controller.models["questionpool"];
		var answers = questionpoolModel.getAnswer();


		$("#cardAnswerBody").empty();
		
		var ul = $("<ul/>", {
		}).appendTo("#cardAnswerBody");

		for ( var c = 0; c < answers.length; c++) {

			var li = $("<li/>", {
				"id" : "answer" + c,
				"class": "answerLi" + (self.tickedAnswers.indexOf(c) != -1 ? " ticked" :"")
			}).appendTo(ul);
			jester(li[0]).tap(function() {
				self.clickSingleAnswerItem($(this));
			});
			
			var div = $("<div/>", {
				"class": "text",
				text : answers[c].text
			}).appendTo(li);
		

		}

	}else {
		this.didApologize = true;
		doApologize();
	}
// console.log("enter single answer widget answer function");

};

SingleChoiceWidget.prototype.showFeedback = function() {
	$("#feedbackBody").empty();
	$("#feedbackTip").empty();

	var clone = $("#cardAnswerBody ul").clone();
	clone.appendTo("#feedbackBody");

	var questionpoolModel = controller.models["questionpool"];
	$("#feedbackBody ul li").each(function(index) {
		if (questionpoolModel.getScore(index) == "1") {
			console.log("div text high: " + $(this).find("div").css("height"));
			
			var div = $("<div/>", {
				"class" : "right correctAnswer icon-checkmark"
			}).prependTo(this);
			
//			div.css("height", "30px"); //$(this).css("height")
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
		var wrongText = questionpoolModel.getWrongFeedback();
		console.log(wrongText);
		if (wrongText && wrongText.length > 0) {
			$("#FeedbackMore").show();
			$("#feedbackTip").text(wrongText);
		} else {
			$("#FeedbackMore").hide();
		}

	}
};

SingleChoiceWidget.prototype.clickSingleAnswerItem = function(clickedElement) {

	// to check if any other elemen is ticked and untick it
	clickedElement.parent().find("li").removeClass("ticked");
	clickedElement.addClass("ticked");

};

SingleChoiceWidget.prototype.storeAnswers = function() {
	var answers = new Array();

	$("#cardAnswerBody li").each(function(index) {
		if ($(this).hasClass("ticked")) {
			answers.push(index);
		}
	});

	controller.models["answers"].setAnswers(answers);
};


SingleChoiceWidget.prototype.clickDoneButton = function() {
	
	
	var questionpoolModel = controller.models['questionpool'];
		
	if (questionpoolModel.getAnswer()[0].text && questionpoolModel)  {
			
		this.widget.storeAnswers();	
		questionpoolModel.queueCurrentQuestion();
		controller.transitionToFeedback();
		} else {

			questionpoolModel.nextQuestion();
			controller.transitionToQuestion();

		}	
		
		
	};

console.log("end of single choice widget");