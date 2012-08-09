var courses = new Array();

function Course(id, title) {
	this.id = id;
	this.title = title;
	this.syncDateTime;
	this.syncState;
	
	courses.push(this);
}

Course.prototyp.setSyncDateTime = function(syncDateTime) {this.syncDateTime = syncDateTime;};
Course.prototyp.getSyncDateTime = function() {return this.syncDateTime;};

Course.prototyp.setSyncState = function(syncState) {this.syncState = syncState;};
Course.prototyp.getSyncState = function() {return this.syncState;};