function initModels() {
	var question1 = new Question("Solve the equation! 1x1=?", "1",
			"Congratulations! You picked the right answer!");

	var question2 = new Question("Solve the equation! 5x1=?",
			"5", "Well done!");

	var question3 = new Question('Choose the correct translation for the following word! "Car"', "Auto",
			"Congratulations!");

	var question4 = new Question('Choose the correct translation for the following word! "Apple"', "Apfel",
			"Well done!");

	var questionpool1 = new Questionpool();
	questionpool1.addQuestion(question1);
	questionpool1.addQuestion(question2);

	var questionpool2 = new Questionpool();
	questionpool2.addQuestion(question3);
	questionpool2.addQuestion(question4);

	new Course("1", "Math", questionpool1);
	new Course("2", "German", questionpool2);
	
}