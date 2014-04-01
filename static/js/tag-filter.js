angular.module('nag')

.filter('tag', function($filter) {

    var filteredTasks = [];

    return function(tasks, selectedTag) {
        if (!tasks)
            return false;

        if (selectedTag == null)
            return tasks;

        filteredTasks.length = 0;

        var newTasks = tasks.filter(function(task) {
            return task.tags.filter(function(task_tag) {
                return angular.equals(task_tag, selectedTag);
            }).length > 0;
        });

        angular.extend(filteredTasks, newTasks);

        return filteredTasks;
    };
});

