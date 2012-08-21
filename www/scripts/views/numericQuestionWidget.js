function NumericQuestionWidget(interactive) {
	var self = this;

	//self.tickedAnswers = controller.models["answers"].getAnswers();
	
	self.interactive = interactive;
	
	if (self.interactive) {
		self.showAnswer();
		console.log("interactive true");
	} else {
		console.log("interactive false");
		self.showFeedback();
	}
}


NumericQuestionWidget.prototype.showAnswer = function() {
	var self = this;	
	
	var questionpoolModel = controller.models["questionpool"];
	var answers = questionpoolModel.getAnswer();
	
	$("#cardAnswerBody").hide();
	//$("#numberInputContainer").show();
	console.log("entered numeric answer body");

	//	var div = $("<div/>", {
	//		"class" : "right listicon",
			text : ""
	//	});
	//	li.prepend(div);
		
	var div = $("<input/>", {
		"id" : "numberInput",
		"class": "loginInput"
		}).prepend($("#numberInputContainer"));
		
	
};
