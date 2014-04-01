angular.module('nag')

.directive('taskList', function() {

    return {
        restrict: 'E',
        scope: {
            'tasks': '=',
            'title': '@'
        },
        replace: true,
        link: function(scope, attrs, element, ctrl) {
        },
        templateUrl: 'templates/task-list.html'
    }
});