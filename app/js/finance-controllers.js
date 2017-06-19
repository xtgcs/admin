/**
 * Created by chenchao on 15/12/26.
 */
'use strict';

/* Controllers */

angular.module('myApp.financecontrollers', ['ui.bootstrap'])
    .controller('FinanceStatCtrl', ['$scope', '$modal', '$log', '$state', 'Alert', 'ConfirmService', 'CONFIG', 'FinanceStat', 'data', 'VALID',
        function ($scope, $modal, $log, $state, Alert, ConfirmService, CONFIG, FinanceStat, data, VALID) {
            console.log('loading finance stat controller....');

            $scope.data = data;
            $scope.grid = {
                page: 1,
                type: 'd'
            };

            $scope.financestatlist = {
                show: true
            };

            $scope.financestatlistweekly = {
                show: false
            };

            $scope.financestatlistmonthly = {
                show: false
            };

            var refresh = function (page) {
                var SPEC = {page: page, size: 20, valid: VALID.TRUE, type:$scope.grid.type};
                var d = FinanceStat.get(SPEC, function () {
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

            var clearData = function () {
                $log.info("clear data");
            };

            $scope.clearData = function () {
                clearData();
            };

            $scope.loadDailyData = function () {
                $scope.financestatlist.show = true;
                $scope.financestatlistweekly.show = false;
                $scope.financestatlistmonthly.show = false;
                $scope.grid.type = 'd';
                $scope.grid.page = 1;
                refresh(1);
            };

            $scope.loadWeeklyData = function () {
                $scope.financestatlist.show = false;
                $scope.financestatlistweekly.show = true;
                $scope.financestatlistmonthly.show = false;
                $scope.grid.type = 'w';
                $scope.grid.page = 1;
                refresh(1);
            };

            $scope.loadMonthlyData = function () {
                $scope.financestatlist.show = false;
                $scope.financestatlistweekly.show = false;
                $scope.financestatlistmonthly.show = true;
                $scope.grid.type = 'm';
                $scope.grid.page = 1;
                refresh(1);
            }
        }]);

