Tasks = new Mongo.Collection("tasks");

if (Meteor.isClient) {
    //This code only runs on the client
    Template.body.helpers({
	    tasks: function() {
		return Tasks.find({});
	    }
	});
    
    //Create a new task
    Template.body.events({
	    "submit .new-task": function (event) {
		//Function aboved is called when the new task form is submitted
		var text = event.target.text.value;
		
		Tasks.insert({
			text: text,
			    createdAt: new Date() //Current date
		    });
		//Clear form
		event.target.text.value = "";

		//Prevent default form submit
		return false;
	    } 
	});
}

