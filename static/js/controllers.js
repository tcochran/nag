angular.module('nag', ["ngResource"])

.controller('NagCtrl',function($scope, $resource, $timeout, Integrated) {
    $scope.tasks = [];

    var Task = $resource("tasks/:taskId", {taskId:'@id'}, {
        'getAll': {
            method: 'GET',
            isArray: true
        },
    })

    $scope.submit = function(taskScope) {
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

        task.$save(loadTasks);
    };

    $scope.filterTasks = function(tag) {
        if (tag == null) {
            $scope.tasks = $scope.all_tasks;    
        } else {
            $scope.tasks = $scope.all_tasks.filterByTag(tag);
        }
    };

    var loadTasks = function() {
        return Task.getAll({}, function(tasksJson) {
            var tasks = Nag.TaskCollection.fromJson(tasksJson);
            $scope.all_tasks = tasks;
            $scope.tasks = tasks;
        });
    };    

    var updateDeadline = function() {
        $scope.tasks.forEach(function(task) { 
        task.deadlineInWords = task.calculateDeadlineInWords();
        });
    }

    var checkExpiredTasks = function() {   

        if ($scope.all_tasks.expiredTasks().length > 0) {
            $scope.expiredTasks = $scope.tasks.expiredTasks();
        }
        updateDeadline();

        $timeout(function() {
            checkExpiredTasks();    
        }, 2000);
    };

    loadTasks();
    
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

.controller('TagFilterCtrl', function($scope) {

    $scope.Tag = {selected: null};

    $scope.selectTag = function(tag) { 
        $scope.Tag.selected = tag;
        $scope.filterTasks(tag); 
    };

    $scope.$watch('all_tasks', function(newValue, oldValue, scope) {
        if (newValue == null)
            return;

        var tags = $scope.all_tasks.reduce(function(all_tags, task) {
            var new_tags = task.tags.filter(function(tag) { return !Nag.containsEqual(all_tags, tag); });
            return all_tags.concat(new_tags);
        }, []);


        $scope.all_tags = tags;
    });
    
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
    
});