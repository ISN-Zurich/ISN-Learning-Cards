function TextSortWidget(interactive) {
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

TextSortWidget.prototype.showAnswer = function() {
	var self = this;

	var questionpoolModel = controller.models["questionpool"];
	var answers = questionpoolModel.getAnswer();

	$("#cardAnswerBody").empty();

	if (questionpoolModel.questionList && questionpoolModel.getAnswer()[0].text) {

		var ul = $("<ul/>", {
			"class": "sortable"
		}).appendTo("#cardAnswerBody");
		

		var mixedAnswers = [];

		if (this.tickedAnswers.length == 0) {
			while (mixedAnswers.length < answers.length) {
				var random = Math.floor((Math.random() * answers.length));

				while (mixedAnswers.indexOf(random) != -1) {
					random = (++random) % answers.length;
				}

				mixedAnswers.push(random);
			}
		} else {
			mixedAnswers = this.tickedAnswers;
		}
		// console.log("mixed answers length: " + mixedAnswers.length);

		for ( var c = 0; c < mixedAnswers.length; c++) {

			var li = $("<li/>", {
				"id" : "answer" + mixedAnswers[c],
				"class" : "sortableListItem",
				text : answers[mixedAnswers[c]].text
			}).appendTo(ul);

		}

		$(".sortable").sortable({
			placeholder : "placeholder",
			scrollSensitivity : 10,
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
	} else {
		this.didApologize = true;
		doApologize();
	}

};

TextSortWidget.prototype.showFeedback = function() {
	$("#feedbackBody").empty();
	$("#feedbackTip").empty();

	$(".sortable").sortable({
		disabled : true
	});

	// var clone = $("#cardAnswerBody").clone();
	// clone.appendTo("#feedbackBody");

	// var questionpoolModel = controller.models["questionpool"];
	// $("#feedbackBody ul li").each(function(index) {
	// // console.log("Index: " + index);
	// // console.log("Id: " + $(this).attr("id").substring(6));
	// if (index == $(this).attr("id").substring(6)) {
	// $(this).addClass("correctAnswer");
	// }
	// });

	var ul = $("<ul/>", {}).appendTo("#feedbackBody");

	var questionpoolModel = controller.models["questionpool"];
	var answers = questionpoolModel.getAnswer();
	var answerModel = controller.models["answers"];
	var scores = answerModel.getTextSortScoreArray();

	for ( var i = 0; i < answers.length; i++) {
		var li = $(
				"<li/>",
				{
					"class" : scores[i] == "1" ? "correctAnswer"
							: scores[i] == "0.5" ? "partiallyCorrectAnswer"
									: "",
					text : answers[i].text
				}).appendTo(ul);
	}

	var currentFeedbackTitle = answerModel.getAnswerResults();
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

		answers.push(id);
	});

	controller.models["answers"].setAnswers(answers);
};

TextSortWidget.prototype.enableSorting = function() {

	jester($(".sortable")[0]).start(function(touches, event) {
		console.log("ScrollTop " + $("ul#cardAnswerBody").scrollTop());
		createEvent("mousedown", event);
	});

	jester($(".sortable")[0]).during(function(touches, event) {
		createEvent("mousemove", event);

		var y = event.changedTouches[0].screenY;
		if (y < 60) {
			if (window.pageYOffset > y) {
				var scroll = y > 20 ? y - 20 : 0;
				window.scrollTo(0, scroll);
			}
		}
	});

	jester($(".sortable")[0]).end(function(touches, event) {
		createEvent("mouseup", event);
		var y = event.changedTouches[0].screenY;
		if (y < 60) {
			window.scrollTo(0, 0);
		}
	});
}

function createEvent(type, event) {
	var first = event.changedTouches[0];
	var simulatedEvent = document.createEvent("MouseEvent");
	simulatedEvent.initMouseEvent(type, true, true, window, 1, first.screenX,
			first.screenY, first.clientX, first.clientY, false, false, false,
			false, 0, null);

	first.target.dispatchEvent(simulatedEvent);
	event.preventDefault();
}