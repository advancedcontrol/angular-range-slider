(function (angular) {
    'use strict';
    
    // Use a common namespace
    var module;
    try {
        module = angular.module('coUtils');
    } catch (e) {
        module = angular.module('coUtils', ['ngGesture']);
    }
    
    // Ensures this module is loaded.
    angular.module('ngGesture');
    

    module
        .directive('coRange', [
                '$timeout',
            function ($timeout) {
                return {
                    restrict: 'A',
                    scope: {
                        model: '=?',
                        min: '=?',
                        max: '=?',
                        step: '=?',
                        precision: '=?',
                        horizontal: '=?',
                        disabled: '=?',
                        userCallback: '=?',
                        dragging: '=?'
                    },

                    template:   
                        '<div ng-class="{disabled: disabled, horz: horizontal, vert: !horizontal, animate: !dragging, dragging: dragging}"' + 
                        'ng-click="clicked($event)" touch-action="none" drag-begin="dragStart($event)" drag-stop="dragEnd()" ng-drag="drag($event)">' +
                            '<div class="track"></div>' +
                            '<div class="progress"></div>' +
                            '<div class="handle" role="slider" touch-action="none" drag-begin="dragStart($event)" drag-stop="dragEnd()" ng-drag="drag($event)"></div>' +
                        '</div>',

                    link: function($scope, $element, attrs) {
                        var input    = $element.find('input'),
                            handle   = $element.find('.handle'),
                            progress = $element.find('.progress'),

                            // Don't override scope variable (may not be set yet)
                            minVal = $scope.min || 0,
                            maxVal = $scope.max || 100;

                        // defaults
                        $scope.step = $scope.step || 1;
                        $scope.horizontal = $scope.horizontal !== false;
                        $scope.disabled = $scope.disabled === false || attrs.hasOwnProperty('disabled');

                        // Add class to outer element (no replace)
                        $element.addClass('co-range-slider');
                        if (!$scope.horizontal) {
                            $element.addClass('vert');
                        }

                        // Keep precision in sync
                        var precision,
                            setPrecision = function () {
                                precision = Math.pow(10, $scope.precision || $scope.step);
                            }, 
                            updateSlider = function () {
                                $timeout(function () {
                                    if (minVal < maxVal) {
                                        setValue($scope.model || minVal);
                                    }
                                }, 0, false);
                            };

                        $scope.$watch('precision', setPrecision);
                        $scope.$watch('step',      setPrecision);
                        $scope.$watch('min',       function (value) {
                            minVal = value || 0;

                            // Slide if the value has been updated
                            if (!isNaN(value)) { updateSlider(); }
                        });
                        $scope.$watch('max',       function (value) {
                            maxVal = value || 100;

                            // Slide if the value has been updated
                            if (!isNaN(value)) { updateSlider(); }
                        });


                        // Keep orientation in sync
                        var handleProperty,
                            progressProperty;

                        $scope.$watch('horizontal', function (horizontal) {
                            if (handleProperty !== undefined) {
                                // remove the old styles
                                progress.css(progressProperty, '');
                                handle.css(handleProperty, '');
                            }

                            if (horizontal) {
                                handleProperty   = 'left';
                                progressProperty = 'width';
                                $element.removeClass('vert');
                            } else {
                                handleProperty   = 'bottom';
                                progressProperty = 'height';
                                $element.addClass('vert');
                            }

                            // Update to the new orientation
                            $timeout(slide, 0, false);
                        });

                        // ---------------------
                        // binding
                        // ---------------------
                        var lastModelValue = 0,
                            setValue = function (val) {
                                // Ensure we are always in a valid range
                                if (val < minVal) {
                                    val = minVal;
                                } else if (val > maxVal) {
                                    val = maxVal;
                                }

                                if ($scope.dragging) {
                                    lastModelValue = val;
                                    return;
                                } else if (val !== $scope.value) {
                                    $scope.value = val;
                                    slide();
                                }
                            };

                        $scope.$watch('model', function(val) {
                            if (isNaN(val)) { return; }

                            // Ensure we are always in a valid range
                            setValue(val);
                        });

                        // ---------------------
                        // rendering
                        // ---------------------
                        function calculateValue(event) {
                            if ($scope.horizontal) {
                                var pos = event.center.pageX - $element.offset().left;
                                var percent = pos / $element.width();
                            } else {
                                var pos = event.center.pageY - $element.offset().top;
                                var percent = 1 - (pos / $element.height());
                            }

                            // Normalise the range
                            var range = maxVal - minVal;

                            // expand the value to an number min...max, and clip
                            // it to a multiple of step
                            var stepped = Math.round((percent * range) / $scope.step) * $scope.step;

                            // round the stepped value to a precision level
                            var rounded = Math.round(stepped * precision) / precision;

                            // constraint min..X..max
                            return Math.min(maxVal, Math.max(minVal, (rounded + minVal)));
                        }

                        function slide() {
                            var percent = (($scope.value - minVal) / (maxVal - minVal)) * 100;
                            progress.css(progressProperty, percent + '%');
                            handle.css(handleProperty, percent + '%');
                        }

                        function handleEvent(event) {
                            $scope.value = calculateValue(event);
                            $scope.model = $scope.value;
                            slide();

                            if ($scope.userCallback)
                                $scope.userCallback($scope.value);
                        }

                        // ---------------------
                        // events
                        // ---------------------
                        $scope.clicked = function(event) {
                            if ($scope.disabled || event.target === handle[0]) {
                                event.stopPropagation();
                                return event.preventDefault();
                            } else {
                                handleEvent(event);
                            }
                        }

                        $scope.dragStart = function(event) {
                            event.stopPropagation();
                            event.preventDefault();
                            if (!$scope.disabled) {
                                $scope.dragging = true;
                                lastModelValue = $scope.value;
                            }
                        };

                        $scope.drag = function(event) {
                            if ($scope.disabled)
                                return;
                            else
                                handleEvent(event);
                        };

                        $scope.dragEnd = function() {
                            $scope.dragging = false;
                            $scope.value = lastModelValue;
                            slide();
                        };

                        // ---------------------
                        // initialisation
                        // ---------------------
                        $scope.value = $scope.model || minVal;
                        $scope.dragging = false;
                        // NOTE:: the watch on scope.horizontal will set the initial slide value
                    }
                }
            }
        ]);

}(this.angular));
