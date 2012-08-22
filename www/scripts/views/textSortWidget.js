function TextSortWidget(interactive) {
	var self = this;

	self.tickedAnswers = controller.models["answers"].getAnswers();
	self.interactive = interactive;

	if (self.interactive) {
		self.showAnswer();
	} else {
		self.showFeedback();
	}
}

TextSortWidget.prototype.showAnswer = function() {
	var self = this;

	var questionpoolModel = controller.models["questionpool"];
	var answers = questionpoolModel.getAnswer();

	$("#cardAnswerBody").empty();
	$("#cardAnswerBody").addClass("sortable");

	var mixedAnswers = [];

	if (this.tickedAnswers.length == 0) {
		while (mixedAnswers.length < answers.length) {
			var random = Math.floor((Math.random() * answers.length));

			if (mixedAnswers.indexOf(random) == -1) {
				mixedAnswers.push(random);
			}
		}
	} else {
		mixedAnswers = this.tickedAnswers;
	}
	console.log("mixed answers length: " + mixedAnswers.length);

	for ( var c = 0; c < mixedAnswers.length; c++) {

		var li = $("<li/>", {
			"id" : "answer" + mixedAnswers[c],
			"class" : "sortableListItem",
			text : answers[mixedAnswers[c]].text
		}).appendTo("#cardAnswerBody");

	}

	$(".sortable").sortable({
		placeholder: "placeholder",
		disabled : false,
		start : function(event, ui) {
			$(ui.item).addClass("currentSortedItem");
		},
		stop : function(event, ui) {
			$(ui.item).removeClass("currentSortedItem");
		}
	});
	$(".sortable").disableSelection();

	self.enableSorting();

};

TextSortWidget.prototype.showFeedback = function() {
	$("#feedbackBody").empty();
	$("#feedbackTip").empty();

	$(".sortable").sortable({
		disabled : true
	});
	$("#cardAnswerBody").removeClass("sortable");

	var clone = $("#cardAnswerBody").clone();
	clone.appendTo("#feedbackBody");

	var questionpoolModel = controller.models["questionpool"];
	$("#feedbackBody ul li").each(function(index) {
		console.log("Index: " + index);
		console.log("Id: " + $(this).attr("id").substring(6));
		if (index == $(this).attr("id").substring(6)) {
			$(this).addClass("correctAnswer");
		}
	});

	var currentFeedbackTitle = controller.models["answers"].getAnswerResults();
	if (currentFeedbackTitle == "Excellent") {
		var correctText = questionpoolModel.getCorrectFeedback();
		if (correctText && correctText.length > 0) {
			$("#FeedbackMore").show();
			$("#feedbackTip").text(correctText);
		} else {
			$("#FeedbackMore").hide();
		}
	} else {
		var wrongText = questionpoolModel.getWrongFeedback();
		if (wrongText && wrongText.length > 0) {
			$("#FeedbackMore").show();
			$("#feedbackTip").text(wrongText);
		} else {
			$("#FeedbackMore").hide();
		}

	}
};

TextSortWidget.prototype.storeAnswers = function() {
	var answers = new Array();

	console.log("XXX" + $("#cardAnswerBody").find(".sortableListItem").length);

	$("#cardAnswerBody").find("li.sortableListItem").each(function(index) {

		var id = $(this).attr("id").substring(6);

		// console.log("push: " + id);
		// console.log("index: " + index);

		answers.push(id);
	});

	controller.models["answers"].setAnswers(answers);
};

TextSortWidget.prototype.enableSorting = function() {
	jester($(".sortable")[0]).start(function(touches, event) {
		createEvent("mousedown", event);
	});

	jester($(".sortable")[0]).during(function(touches, event) {
		createEvent("mousemove", event);
	});

	jester($(".sortable")[0]).end(function(touches, event) {
		createEvent("mouseup", event);
	});
}

function createEvent(type, event) {
	var first = event.changedTouches[0];
	var simulatedEvent = document.createEvent("MouseEvent");
	simulatedEvent.initMouseEvent(type, true, true, window, 1, first.screenX,
			first.screenY, first.clientX, first.clientY, false, false, false,
			false, 0, null);

	first.target.dispatchEvent(simulatedEvent);
	// event.preventDefault();
}