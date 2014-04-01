angular.module('nag')

.directive('tagSection', function() {
    return {
        require: 'ngModel',
        restrict: 'E',
        scope: {
            'tags': '='
        },
        link: function(scope, attrs, element, ctrl) {
            scope.selectedTag = null

            scope.selectTag = function(tag) {
                ctrl.$setViewValue(tag);
                scope.selectedTag = tag;
            }
        },
        templateUrl: 'templates/tags.html'
    }
});