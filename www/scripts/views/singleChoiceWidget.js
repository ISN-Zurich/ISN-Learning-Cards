function SingleChoiceWidget(interactive) {
	var self = this;

	self.tickedAnswers =  controller.models["answers"].getAnswers();
	self.interactive = interactive;
	
	if (self.interactive) {
		self.showAnswer();
	} else {
		self.showFeedback();
	}
}

SingleChoiceWidget.prototype.showAnswer = function() {
	var self = this;	
	
	var questionpoolModel = controller.models["questionpool"];
	var answers = questionpoolModel.getAnswer();
	
	$("#cardAnswerBody").empty();

	for(var c = 0; c < answers.length; c++) {

		var li = $("<li/>", {
			"id" : "answer" + c,
			text : answers[c].text
		}).appendTo("#cardAnswerBody");
		jester(li[0]).tap(function() {
			self.clickSingleAnswerItem($(this));
		});

		var div = $("<div/>", {
			"class" : "right listicon",
			text : ""
		});
		li.prepend(div);

		var i = $("<i/>", {
			"class": self.tickedAnswers.indexOf(c) != -1 ? "icon-ok" : ""
		}).appendTo(div);
		
	}
};

SingleChoiceWidget.prototype.showFeedback = function() {
	$("#feedbackBody").empty();
	$("#feedbackTip").empty();

	var clone = $("#cardAnswerBody").clone();
	clone.appendTo("#feedbackBody");

	var questionpoolModel = controller.models["questionpool"];
		$("#feedbackBody ul li").each(function(index) {
			if (questionpoolModel.getScore(index) == "1") {
				$(this).addClass("correctAnswer");
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
		if (wrongText.length > 0) {
			$("#FeedbackMore").show();
			$("#feedbackTip").text(wrongText);
		} else {
			$("#FeedbackMore").hide();
		}

	}
};

SingleChoiceWidget.prototype.clickSingleAnswerItem = function(clickedElement) {

	// to check if any other elemen is ticked and untick it
	clickedElement.parent().find("i").removeClass("icon-ok");
	clickedElement.find("i").toggleClass("icon-ok");
	

};

SingleChoiceWidget.prototype.storeAnswers = function() {
	var answers = new Array();

	$("#cardAnswerBody li").each(function(index) {
		if ($(this).find("i").hasClass("icon-ok")) {
			answers.push(index);
		}
	});
	
	controller.models["answers"].setAnswers(answers);
};

console.log("end of single choice widget");