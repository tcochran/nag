angular.module('nag', ["ngResource"]).controller('NagCtrl', function($scope, $resource, $timeout) {

    var Task = $resource("tasks/:taskId", {taskId:'@id'}, {
        'getAll': {
            method: 'GET',
            isArray: true
        },

        'get': {
            method: 'GET',
            isArray: false
        },

        'delete': {
            method: 'DELETE'
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
        Task.getAll({}, function(tasks) {
            $scope.tasks = tasks;
        });
    };

    

    var loadExpiredTasks = function() {
        Task.getAll({deadline: new Date()}, function(tasks) {
            $scope.expiredTasks = tasks;
        });
    };

    var poll = function () { 
        loadExpiredTasks();
        $timeout(function() {
            poll();
        }, 5000);
    };
    poll();
    loadTasks();

    
    $scope.taskDone = function(taskId) {
      Task.get({taskId: taskId}, function(task) {
        task.finished = true;
        console.log(task);
        task.$save(loadTasks);
      }); 
    }

    $scope.taskDelete = function(taskId) {
      Task.delete({taskId: taskId}, loadTasks); 
    }

}).controller('ExpiredTasksCtrl', function () {
    $('#myModal').modal({});

});
  