function initModels() {
	var question1 = new Question("This is the question?", "Pick this answer",
			"Congratulations!You picked the right answer!");

	var question2 = new Question("This is also a question?",
			"Choose this answer", "Well done!");

	var question3 = new Question("Choose an answer!", "Answer",
			"Congratulations!");

	var question4 = new Question("Again, choose an answer!", "Answer",
			"Well done!");

	var questionpool1 = new Questionpool();
	questionpool1.addQuestion(question1);
	questionpool1.addQuestion(question2);

	var questionpool2 = new Questionpool();
	questionpool2.addQuestion(question3);
	questionpool2.addQuestion(question4);

	new Course("1", "Course1", questionpool1);
	new Course("2", "Course2", questionpool2);
	
}