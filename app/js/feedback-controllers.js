'use strict';

/* Controllers */

angular.module('myApp.feedbackcontrollers', ['ui.bootstrap'])
    .controller('FeedbackCtrl', ['$scope', '$modal', '$log', '$state', 'CONFIG', 'Feedback', 'data', '$rootScope',
        function ($scope, $modal, $log, $state, CONFIG, Feedback, data, $rootScope) {
            $scope.data = data;
            $scope.grid = {
                page: 1
            };

            var refresh = function (page) {
                var SPEC = {page: page, size: 20};
                if ($scope.grid.name) {
                    SPEC.q = $scope.grid.name;
                }
                var d = Feedback.get(SPEC, function () {
                    $scope.data = d;
                });
            };

            $scope.search = function () {
                refresh($scope.grid.page);
            };

            $scope.$watch('grid.page', function (newVal, oldVal) {
                if (newVal != oldVal) {
                    refresh(newVal);
                }
            });
        }]);
