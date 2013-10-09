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
    console.log(window.webkitNotifications.checkPermission())

    if (window.webkitNotifications.checkPermission() == 0) { // 0 is PERMISSION_ALLOWED
        // function defined in step 2
        
        var notification = window.webkitNotifications.createNotification(
          "http://www.google.com/images/logo.png", // icon url - can be relative
          "Google", // notification title
          "is the best search engine. Click to find out more"  // notification body text
        );

        console.log(notification);
        // Show the notification, I'm assuming notifications are supported and allowed
        notification.show();
      } else {
        window.webkitNotifications.requestPermission();
      }


})


document.querySelector('.clickme2').addEventListener('click', function() {
  if (window.webkitNotifications.checkPermission() == 0) { // 0 is PERMISSION_ALLOWED
    // function defined in step 2
   var notification = window.webkitNotifications.createNotification(
          "", // icon url - can be relative
          "", // notification title
          "is the best search engine. Click to find out more"  // notification body text
        );

        console.log(notification);
        // Show the notificat

  } else {
    window.webkitNotifications.requestPermission();
  }
}, false);