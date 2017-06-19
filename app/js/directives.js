'use strict';

/* Directives */


angular.module('myApp.directives', []).
    directive('appVersion', ['version', function (version) {
        return function (scope, elm, attrs) {
            elm.text(version);
        };
    }])
    .directive('popImg', ['$document', function ($document) {
        return function (scope, elm, attr) {
            elm.bind('mouseenter', function (event) {
                elm.parent()[0].children[1].style.display = 'block';
            });
            elm.bind('mouseout', function (event) {
                elm.parent()[0].children[1].style.display = 'none';
            });
        };
    }])
    .directive('dateFormat', [function() {

    return {
        require: 'ngModel',
        link: function (scope, elm, attrs, ctrl) {
            function formatter(value) {
                console.log(value);
                var d = new Date(value);
                return {
                    date: d,
                    time: d,
                    minDate: new Date(),
                    opened: false
                }
            }


            function parser() {
                return ctrl.$modelValue;
            }
            console.log(formatter);

            ctrl.$formatters.push(formatter);
            ctrl.$parsers.unshift(parser);

        }
    };
    }]);
