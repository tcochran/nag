Nag = {}

Nag.containsEqual = function(collection, object) {
    return collection.filter(function(item) {
        return angular.equals(item, object);
    }).length > 0;
};

Nag.Task = function(taskResource) {

    angular.extend(taskResource, Nag.Task.prototype);
    taskResource.deadlineDate = new Date(taskResource.deadline_date);

    taskResource.deadlineInWords = taskResource.calculateDeadlineInWords();

    return taskResource;
}

Nag.Task.prototype.hasExpired = function () {
    return !this.finished && this.deadlineDate <= new Date();
};

Nag.Task.prototype.calculateDeadlineInWords = function () {
    var basis = this.deadline.match(/minute/) ? "minute" : "day"
    var now = new Date();
    if (this.finished)
        return "";

    var msec = this.deadlineDate - now;
    var minutes = Math.ceil(msec / 1000 / 60);

    if (basis == "minute") {
        if (minutes == 1)
            return "1 minute";
        else if (minutes <= 0)
            return "overdue"
        else
            return minutes + " minutes ";
    } else {
        var days = Math.ceil(minutes / 60 / 24);
        if (days == 1)
            return "tomorrow";
        else if (days <= 0)
            return "overdue"
        else
            return days + " days ";
    }
    return "booo";
};

Nag.TaskCollection = {}
Nag.TaskCollection.fromJson = function(tasksJson){ 
    var collection = tasksJson.map(function(taskResource) { return Nag.Task(taskResource); });
    return collection;
};

Nag.TaskCollection.expiredTasks = function(tasks) {
    return tasks.filter(function(task) {
        return task.hasExpired();
    });
};