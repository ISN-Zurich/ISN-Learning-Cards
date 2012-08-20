function CourseModel() {
	this.courseList = [];
	this.index = 0;
	
	this.loadData();
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
	
	if (courseObject == []) { //if no courses are available, new ones are created
		this.createCourses();
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


CourseModel.prototype.createCourses() {
	initCourses();		
	try {
		courseObject = JSON.parse(localStorage.getItem("courses"));
	} catch(err) {
		courseObject = [];
	}
}
