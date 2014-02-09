Nag = {}
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

    var today = new Date();
    var tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
    var days = 8 - today.getDay(); 
    var thisWeekEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + days);
    var nextWeekEnd = new Date(thisWeekEnd.getFullYear(), thisWeekEnd.getMonth(), thisWeekEnd.getDate() + 7);

    var thisMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    var nextMonth = new Date(thisMonth.getFullYear(), thisMonth.getMonth() + 2, 0);

    collection.expiredTasks = function () {
        return Nag.TaskCollection.expiredTasks(this); 
    };

    collection.today = function () {
        return this.filter(function(task) {
            return task.deadlineDate < tomorrow;
        });
    };

    collection.thisWeek = function () {
        return this.filter(function(task) {
            return task.deadlineDate >= tomorrow && task.deadlineDate < thisWeekEnd;
        });
    };

    collection.nextWeek = function () {
        return this.filter(function(task) {
            return task.deadlineDate >= thisWeekEnd && task.deadlineDate < nextWeekEnd;
        });
    };

    collection.thisMonth = function () {
        return this.filter(function(task) {
            return task.deadlineDate >= nextWeekEnd && task.deadlineDate >= thisWeekEnd && task.deadlineDate < thisMonth;
        });
    };

    collection.nextMonth = function () {
        return this.filter(function(task) {
            return task.deadlineDate >= thisMonth && task.deadlineDate >= nextWeekEnd && task.deadlineDate >= thisWeekEnd && task.deadlineDate < nextMonth;
        });
    };

    collection.filterByTag = function(tag) {
        var filteredTasks = this.filter(function(task) {
            return task.tags.indexOf(tag) != -1;
        });

        return Nag.TaskCollection.fromJson(filteredTasks);
    }

    return collection;
};

Nag.TaskCollection.expiredTasks = function(tasks) {
    return tasks.filter(function(task) {
        return task.hasExpired();
    });
};