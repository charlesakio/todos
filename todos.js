Tasks = new Mongo.Collection("tasks");

if (Meteor.isClient) {
    //This code only runs on the client
    Meteor.subscribe("tasks");


    Template.body.helpers({
	    tasks: function() {
		if (Session.get("hideCompleted")) {
		    //If hide completed is checked, filter tasks
		    return Tasks.find({checked: {$ne: true}}, {sort: {createdAt: -1}});
		} else {
		    //Otherwise, return all of the tasks
		    return Tasks.find({}, {sort: {createdAt: -1}});
		}
	    },
		hideCompleted: function () {
		return Session.get("hideCompleted");
	    }  
	});
    
    //Create a new task
    Template.body.events({
	    "submit .new-task": function (event) {
		//Function aboved is called when the new task form is submitted
		var text = event.target.text.value;
		
		Meteor.call("addTask", text);
		
		//Clear form
		event.target.text.value = "";
		
		//Prevent default form submit
		return false;
	    },
		//Function to hide completed tasks
		"change .hide-completed input": function (event) {
		    Session.set("hideCompleted", event.target.checked);
		}
	});
    
    
    Template.task.events({
	    "click .toggle-checked": function () {
		// Set the checked property to the opposite of its current value
		Meteor.call("setChecked", this._id, ! this.checked);
	    },
		// Delete task
		"click .delete": function () {
		    Meteor.call("deleteTask", this._id);
		},
		    
		    //An event for the new button to Template.task.events
		    "click.toggle-private": function () {
			Meteor.call("setPrivate", this._id, ! this.private);
		    }
		    
	});   
    
    Accounts.ui.config({
	    passwordSignupFields: "USERNAME_ONLY"
		});		
}

Template.tasks.helpers({
	isOwner: function() {
	    return this.owner === Meteor.userId();
	}
    });


//Methods
Meteor.methods({
	addTask: function (text) {
	    //Making sure the user is logged in before inserting task
	    if (!Meteor.userId) {
		throw new Meteor.error("not-authorized");
	    }
	    //If there is no error, insert to database 
	    Tasks.insert({
		    text: text,
			createdAt: new Date(),
			owner: Meteor.userId(),
			username: Meteor.user().username
			});
	},
	    //Delete task
	    deleteTask: function (taskId) {
	    
	    var task = Tasks.findOne(taskId);
	    if (task.private && task.owner !== Meteor.userId()) {
		throw new Meteor.Error("You shall not pass!!!");
	    }
	    Tasks.remove(taskId);
	},
	    //Update task
	    setChecked: function (taskId, setChecked) {
	    	    	    
	    var task = Tasks.findOne(taskId);
	    if (task.private && task.owner !== Meteor.userId()) {
		throw new Meteor.Error("You shall not pass!!!");
	    }
	    Tasks.update(taskId, {$set: { checked: setChecked }});
	},
	    //Make task private
	    setPrivate: function (taskId, setToPrivate) {
	    
	    var task = Tasks.findOne(taskId);
	    //Making sure that only task owner can make a task private
	    if (task.owner !== Meteor.userId()) {
		throw new Meteor.Error("You shall not pass!!!");
	    }
	    Tasks.update(taskId, { $set: { private: setToPrivate } });
	}
    });

if (Meteor.isServer) {
    Meteor.publish("tasks", function () {
	    return Tasks.find({
		    $or: [
			  { private: {$ne: true} },
			  { owner: this.userId}
			  ]
			});
	});
}

