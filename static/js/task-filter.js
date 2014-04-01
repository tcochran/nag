angular.module('nag')

.filter('period', function($filter) {

    var today = new Date();
    var tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
    var days = 8 - today.getDay(); 
    var thisWeekEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + days);
    var nextWeekEnd = new Date(thisWeekEnd.getFullYear(), thisWeekEnd.getMonth(), thisWeekEnd.getDate() + 7);

    var thisMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    var nextMonth = new Date(thisMonth.getFullYear(), thisMonth.getMonth() + 2, 0);

    var arrays = {}
    var filters = {
        'today': function(task){
            return new Date(task.deadline_date) < tomorrow;
        },
        'thisWeek':  function(task) {
            var deadlineDate = new Date(task.deadline_date);
            return deadlineDate >= tomorrow && deadlineDate < thisWeekEnd;
        },
        'nextWeek':  function(task) {
            var deadlineDate = new Date(task.deadline_date)
            return deadlineDate >= thisWeekEnd && deadlineDate < nextWeekEnd;
        },
        'thisMonth':  function(task) {
            var deadlineDate = new Date(task.deadline_date)
            return deadlineDate >= nextWeekEnd && deadlineDate >= thisWeekEnd && deadlineDate < thisMonth;
        },
        'nextMonth': function(task) {
            var deadlineDate = new Date(task.deadline_date)
            return deadlineDate >= thisMonth && deadlineDate >= nextWeekEnd && deadlineDate >= thisWeekEnd && deadlineDate < nextMonth;
        }
    };

    return function(tasks, period) {

        if (!tasks)
            return false;

        if (!(period in arrays)) {
            arrays[period] = [];
        }

        arrays[period].length = 0;

        var newTasks = tasks.filter(filters[period]);
        angular.extend(arrays[period], newTasks);

        return arrays[period];
    };
});

