function CourseModel() {
	this.courseList = [];
	this.index = 0;
};

CourseModel.prototype.storeData = function() {
	var courseString;
	try {
		courseString = JSON.stringify(this.courseList);
	} catch(err) {
		courseString = "";
	}
	localStorage.setItem("courses", courseString);
};

CourseModel.prototype.loadData = function() {
	var courseObject;
	try {
		courseObject = JSON.parse(localStorage.getItem("courses"));
	} catch(err) {
		courseObject = [];
	}
	this.courseList = courseObject;
	this.index = 0;
};

CourseModel.prototype.isLoaded = function() {
	return (this.index > this.courseList.length - 1) ? false : this.courseList[this.index].isLoaded;
};

CourseModel.prototype.getId = function() {
	return (this.index > this.courseList.length - 1) ? false : this.courseList[this.index].id;
};

CourseModel.prototype.getTitle = function() {
	return (this.index > this.courseList.length - 1) ? false : this.courseList[this.index].title;
};

CourseModel.prototype.getSyncState = function() {
	return (this.index > this.courseList.length - 1) ? false : this.courseList[this.index].syncState;
};

CourseModel.prototype.nextCourse = function() {
	this.index++;
	return this.index < this.courseList.length;
};

CourseModel.prototype.reset = function() {
	this.index = 0;
};






//var courses = new Array();
//var currentCourse;
// 
//function Course(id, title, questionpool) {
//	this.id = id;
//	this.title = title;
//	this.syncDateTime = "";
//	this.syncState = "";
//	this.questionpool = questionpool;
//	
//	courses.push(this);
//}
//
//Course.prototype.setSyncDateTime = function(syncDateTime) {this.syncDateTime = syncDateTime;};
//Course.prototype.getSyncDateTime = function() {return this.syncDateTime;};
//
//Course.prototype.setSyncState = function(syncState) {this.syncState = syncState;};
//Course.prototype.getSyncState = function() {return this.syncState;};
//
//Course.prototype.getId = function() {return this.id;};
//Course.prototype.getTitle = function() {return this.title;};
//Course.prototype.nextQuestion = function() {this.questionpool.nextQuestion();};
//Course.prototype.getCurrentQuestion = function() {return this.questionpool.getCurrentQuestion();};
//Course.prototype.getAnswer = function() {return this.questionpool.getAnswer();};
//Course.prototype.getFeedback = function() {return this.questionpool.getFeedback();};
//
//
//
//function getCourse(id) {
//	for (c in courses) {
//		if (courses[c].getId() == id) {
//			return courses[c];
//		}
//	}
//	return null;
//}
