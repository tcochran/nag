angular.module('nag', ["ngResource"]).controller('NagCtrl', function($scope, $resource, $timeout) {

    var Task = $resource("tasks/:taskId", {taskId:'@id'}, {
        'getAll': {
            method: 'GET',
            isArray: true
        },
        taskdone: {method:'POST', params:{finished:true}},

        'get': {
            method: 'GET',
            isArray: false
        },
    })

    $scope.submit = function() {
        var task = new Task({
            task: $scope.task,
            deadline: $scope.deadline
        });

        task.$save(function() {
            loadTask();
        })
    };

    var loadTask = function() {
        Task.getAll({}, function(result) {
            $scope.tasks = result;
        });
    }

    loadTask();

    $scope.taskDone = function(taskId) {
      Task.get({taskId: taskId}, function(task) {
        task.finished = true;
        task.$save(function() { loadTask();  })

      }); 

    }

});
  