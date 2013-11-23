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

    return collection;
};

Nag.TaskCollection.expiredTasks = function(tasks) {
    return tasks.filter(function(task) {
        return task.hasExpired();
    });
}

angular.module('nag', ["ngResource"]).controller('NagCtrl', function($scope, $resource, $timeout) {

    var Task = $resource("tasks/:taskId", {taskId:'@id'}, {
        'getAll': {
            method: 'GET',
            isArray: true
        },
    })

    $scope.submit = function() {
        var task = new Task({
            task: $scope.task,
            deadline: $scope.deadline
        });
        task.$save(loadTasks);
    };

    var loadTasks = function() {
        return Task.getAll({}, function(tasksJson) {
            $scope.tasks = Nag.TaskCollection.fromJson(tasksJson);
            checkExpiredTasks();
        });
    };    

    var updateDeadline = function() {
        $scope.tasks.forEach(function(task) { 
            task.deadlineInWords = task.calculateDeadlineInWords();
        });
    }

    var checkExpiredTasks = function() {
        if ($scope.tasks.expiredTasks().length > 0) {
            $scope.expiredTasks = $scope.tasks.expiredTasks();
        }
        updateDeadline();

        $timeout(function() {
            checkExpiredTasks();    
        }, 2000);
    };

    loadTasks();

    $scope.task
    
    $scope.taskDone = function(task) {
      task.finished = true;
      task.$save();
    }

    $scope.taskDelete = function(task) {
      task.deleted = true;
      var index = $scope.tasks.indexOf(task);
      $scope.tasks.splice(index, 1)
      task.$save(); 
    }

    // var url = "https://accounts.google.com/o/oauth2/auth?reponse_type=token&client_id=912357933222.apps.googleusercontent.com"

}).controller('ExpiredTasksCtrl', function ($scope) {
    $scope.$watch('expiredTasks', function(tasks) {
        if (tasks == null)
            return;
        if (tasks.length > 0 && $('#myModal').is(":hidden") ) {
            $scope.notificationTasks = tasks.splice(0);

            $('#myModal').modal({});        
        }
    })

    $scope.hasExpiredTasks = function () {
        if ($scope.notificationTasks == null)
            return false;
        return Nag.TaskCollection.expiredTasks($scope.notificationTasks).length > 0
    }
        
});
  