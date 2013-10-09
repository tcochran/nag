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

$(".clickme").click(function() {

    if (window.webkitNotifications) {
      console.log("Notifications are supported!");
    }
    else {
      console.log("Notifications are not supported for this Browser/OS version yet.");
    }

    if (window.webkitNotifications.checkPermission() == 0) { // 0 is PERMISSION_ALLOWED
        // function defined in step 2
        window.webkitNotifications.createNotification(
            'icon.png', 'Notification Title', 'Notification content...');
      } else {
        window.webkitNotifications.requestPermission();
      }


})


document.querySelector('.clickme2').addEventListener('click', function() {
  if (window.webkitNotifications.checkPermission() == 0) { // 0 is PERMISSION_ALLOWED
    // function defined in step 2
    window.webkitNotifications.createNotification(
        '', 'Notification Title', 'Notification content...');
  } else {
    window.webkitNotifications.requestPermission();
  }
}, false);