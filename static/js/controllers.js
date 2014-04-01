angular.module('nag', ["ngResource"])
    .config(function() { })



.controller('NagCtrl',function($scope, $resource, $timeout, Integrated, TaskService) {

    $scope.loadTasks = function() {
        TaskService.all().then(function(data){
            $scope.all_tasks = data.tasks;
            $scope.tasks = data.tasks;
            $scope.tags = data.tags
        });
    };    

    var updateDeadline = function() {
        $scope.tasks.forEach(function(task) { 
            task.deadlineInWords = task.calculateDeadlineInWords();
        });
    }

    // do something with this
    var checkExpiredTasks = function() {   

        if ($scope.all_tasks.expiredTasks().length > 0) {
            $scope.expiredTasks = $scope.tasks.expiredTasks();
        }
        updateDeadline();

        $timeout(function() {
            checkExpiredTasks();    
        }, 2000);
    };

    $scope.loadTasks();
    
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

    $scope.showNewTaskModal = function() {
        $('#new-task-modal').modal({});
    }
})

.controller('NewTaskCtrl', function($scope, $resource){
    var Task = $resource("tasks/:taskId", {taskId:'@id'}, {
        'getAll': {
            method: 'GET',
            isArray: true
        },
    })

    $scope.submitTask = function(taskScope) {
        var task = new Task({
            task: taskScope.task,
            deadline: taskScope.deadline,
            tags: taskScope.tags.split(/\s+/).map(function(tag) { 
                return { name: tag };
            })
        });
        taskScope.task = "";
        taskScope.deadline = "";
        taskScope.tags = "";
        task.$save($scope.loadTasks);
    }; 
})

.controller('ExpiredTasksCtrl', function ($scope) {
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
    };        
})

.controller('LogonCtrl', function($scope, Integrated, $rootScope) {


    $scope.$watch('facebookStatus', function(newStatus, oldStatus) {

        if (newStatus == 'not_authorized') {
            $('#logonModal').modal({});   
        } else if(newStatus == 'connected') {
            $('#logonModal').modal('hide');   
        }
    })

    if (!Integrated)
    {
        $rootScope.facebookStatus = 'connected'
    }
})

.service('TaskService', function($resource) {
    var TaskResource = $resource("tasks")

    this.all = function() {

        return TaskResource.query().$promise.then(function(response) {
            var tasks = Nag.TaskCollection.fromJson(response);

            var tags = tasks.reduce(function(all_tags, task) {
                var new_tags = task.tags.filter(function(tag) { return !Nag.containsEqual(all_tags, tag); });
                return all_tags.concat(new_tags);
            }, []);

            return { tasks: tasks, tags: tags};
        });
    };
});