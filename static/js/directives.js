angular.module('nag')

.directive('taskList', function() {

    return {
        templateUrl: '/templates/task-list.html',
        scope: {
            tasks: '=tasks',
            period: '@period'
        },
        restrict: 'A',
        link: function(scope, elm, attrs) {
            console.log(scope.tasks);
            scope.filteredtasks = scope.tasks[scope.period];
        }
    }

})

.directive('facebook', function(){
    return {
        controller: function($scope, $resource, $location, Integrated) {
            $scope.integrated = Integrated;
            if (Integrated == false)
                return;

            var apps = {
              'localhost': 467557013361958,
              'cryptic-retreat-6207.herokuapp.com': 283610231789371
            }
            $scope.appId = apps[$location.host()]
            
            var Logon = $resource("logon")

            $scope.facebookStatus = 'pending';
            $scope.logonSuccess = function(user) {
                $scope.$apply(function(){
                  $scope.user = user;
                  var logon = new Logon(user);
                  logon.$save();

                  $scope.facebookStatus = 'connected';
                })
            };

            $scope.logonNotAuth = function() {
              $scope.$apply(function() {
                $scope.facebookStatus = 'not_authorized';
              });
            }
        },

        link: function(scope, element){
            if (!scope.integrated)
                return;
            window.fbAsyncInit = function() {


                FB.init({
                    appId      : scope.appId,
                    status     : true, // check login status
                    cookie     : true, // enable cookies to allow the server to access the session
                    xfbml      : true  // parse XFBML
                });

                FB.getLoginStatus(function(response) {
                    if (response.status == 'not_authorized' || response.status =='unknown') {
                        scope.logonNotAuth();
                    }
                });

                FB.Event.subscribe('auth.authResponseChange', function(response) {
                    if (response.status === 'connected') {
                        FB.api('/me', function(response) {
                            scope.logonSuccess(response);
                        });
                    } else if (response.status === 'not_authorized') {
                      FB.login(function(response){ }, {scope: 'email,user_likes'});
                    } else {
                      FB.login(function(response){ }, {scope: 'email,user_likes'});
                    }
                });
            };

            (function(d){
                var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
                if (d.getElementById(id)) {return;}
                js = d.createElement('script'); js.id = id; js.async = true;
                js.src = "//connect.facebook.net/en_US/all.js";
                ref.parentNode.insertBefore(js, ref);
            }(document));
        }
    }
});