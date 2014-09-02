(function (angular) {
    'use strict';

    angular.module('coRangeSlider')
        .controller('AppCtrl', [
            '$scope',
            '$timeout',
            function ($scope, $timeout) {
                $scope.value = 30;

                $scope.middle = function() {
                    $timeout(function() {
                        $scope.value = 50;
                    }, 2000);
                }
            }
        ]);

}(this.angular));
