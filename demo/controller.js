(function (angular) {
    'use strict';

    angular.module('coRangeSlider')
        .controller('AppCtrl', [
            '$scope',
            function ($scope) {
                $scope.value = 30;
            }
        ]);

}(this.angular));
