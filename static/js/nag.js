angular.module('nag', ["ngResource"]).controller('NagCtrl', function($scope, $resource) {

    var Task = $resource("tasks", {}, {
        'getAll': {
            method: 'GET',
            isArray: true
        }
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
});