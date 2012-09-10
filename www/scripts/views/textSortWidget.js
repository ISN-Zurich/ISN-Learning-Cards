/**
 * Widget for displaying text sort questions
 * @param interactive if true answerview is shown, otherwise feedback view
 */
function TextSortWidget(interactive) {
	var self = this;

	//loads answers from model for displaying already by the user ordered elements
	self.tickedAnswers = controller.models["answers"].getAnswers();
	self.interactive = interactive;

	this.didApologize = false;

	if (self.interactive) {
		self.showAnswer();
	} else {
		self.showFeedback();
	}
}

TextSortWidget.prototype.cleanup = doNothing;

/**
 * displays the answer for text sort questions
 */
TextSortWidget.prototype.showAnswer = function() {
	var self = this;

	var questionpoolModel = controller.models["questionpool"];
	var answers = questionpoolModel.getAnswer();

	$("#cardAnswerBody").empty();

	if (questionpoolModel.questionList && questionpoolModel.getAnswer()[0].answertext) {

		//create a new unordered list
		var ul = $("<ul/>", {
			"class" : "sortable"
		}).appendTo("#cardAnswerBody");

		var mixedAnswers = [];

		//if sorting has not started yet, mix the answers
		if (this.tickedAnswers.length == 0) {
			while (mixedAnswers.length < answers.length) {
				var random = Math.floor((Math.random() * answers.length));

				//if the current random number is already in the mixed answers array
				//the the next element as random number
				while (mixedAnswers.indexOf(random) != -1) {
					random = (++random) % answers.length;
				}

				mixedAnswers.push(random);
			}
		} else {
			mixedAnswers = this.tickedAnswers;
		}
		
		//for each possible answer create a list item
		for ( var c = 0; c < mixedAnswers.length; c++) {
			var li = $("<li/>", {
				"id" : "answer" + mixedAnswers[c],
				"class" : "sortableListItem",
				text : answers[mixedAnswers[c]].answertext
			}).appendTo(ul);
		}

		//make the list sortable using JQuery UI's function
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

/**
 * displays the feedback for text sort questions
 */
TextSortWidget.prototype.showFeedback = function() {
	$("#feedbackBody").empty();
	$("#feedbackTip").empty();

	$(".sortable").sortable({
		disabled : true
	});

	var ul = $("<ul/>", {}).appendTo("#feedbackBody");

	var questionpoolModel = controller.models["questionpool"];
	var answers = questionpoolModel.getAnswer();
	var answerModel = controller.models["answers"];
	var scores = answerModel.getTextSortScoreArray();

	//iterate over all answers
	for ( var i = 0; i < answers.length; i++) {
		var li = $("<li/>", {
			//if score is 0.5 or 1.5 show user that he/she ticked the answer
			"class" : scores[i] == "0.5" || scores[i] == "1.5" ? "ticked" : "",
			text : answers[i].answertext
		}).appendTo(ul);

		//if score is 1 or 1.5 show a checkmark
		if (scores[i] == "1" || scores[i] == "1.5") {
			var div = $("<div/>", {
				"class" : "right correctAnswer icon-checkmark"
			}).prependTo(li);
		}
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

/**
 * stores the current sorting order in the answer model
 */
TextSortWidget.prototype.storeAnswers = function() {
	var answers = new Array();

	$("#cardAnswerBody").find("li.sortableListItem").each(function(index) {
		var id = $(this).attr("id").substring(6);
		answers.push(id);
	});

	controller.models["answers"].setAnswers(answers);
};

/**
 * catches touch events and creates correspoding mouse events
 * this has to be done because JQuery UI's sortable function
 * listens for mouse events
 */
TextSortWidget.prototype.enableSorting = function() {

	jester($(".sortable")[0]).start(function(touches, event) {
		console.log("ScrollTop " + $("ul#cardAnswerBody").scrollTop());
		createEvent("mousedown", event);
	});

	jester($(".sortable")[0]).during(function(touches, event) {
		createEvent("mousemove", event);

		//if an element is dragged on the header, scroll the list down	
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

/**
 * creates a new mouse event of the specified type
 */
function createEvent(type, event) {
	var first = event.changedTouches[0];
	var simulatedEvent = document.createEvent("MouseEvent");
	simulatedEvent.initMouseEvent(type, true, true, window, 1, first.screenX,
			first.screenY, first.clientX, first.clientY, false, false, false,
			false, 0, null);

	first.target.dispatchEvent(simulatedEvent);
	event.preventDefault();
}