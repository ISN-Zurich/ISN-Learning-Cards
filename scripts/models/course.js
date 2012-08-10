var courses = new Array();
var currentCourse;

function Course(id, title, questionpool) {
	this.id = id;
	this.title = title;
	this.questionpool = questionpool;
	this.syncDateTime;
	this.syncState;
	
	courses.push(this);
}

Course.prototype.setSyncDateTime = function(syncDateTime) {this.syncDateTime = syncDateTime;};
Course.prototype.getSyncDateTime = function() {return this.syncDateTime;};

Course.prototype.setSyncState = function(syncState) {this.syncState = syncState;};
Course.prototype.getSyncState = function() {return this.syncState;};

Course.prototype.getId = function() {return this.id;};
Course.prototype.getTitle = function() {return this.title;};
Course.prototype.nextQuestion = function() {this.questionpool.nextQuestion();};
Course.prototype.getCurrentQuestion = function() {return this.questionpool.getCurrentQuestion();};
Course.prototype.getAnswer = function() {return this.questionpool.getAnswer();};
Course.prototype.getFeedback = function() {return this.questionpool.getFeedback();};

function getCourse(id) {
	for (c in courses) {
		if (courses[c].getId() == id) {
			return courses[c];
		}
	}
	return null;
}