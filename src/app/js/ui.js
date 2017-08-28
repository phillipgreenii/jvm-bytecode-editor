(function() {
	"use strict";

	/* App Module */
	var uiModule = angular.module('jceUi', []);


	/**
	 * Directive that executes an expression when the element it is applied to loses focus
	 */
	uiModule.directive('uiBlur', function() {
		return function(scope, elem, attrs) {
			elem.bind('blur', function() {
				scope.$apply(attrs.uiBlur);
			});
		};
	});

	/**
	 * Directive that places focus on the element it is applied to when the expression it binds to evaluates to true
	 */
	uiModule.directive('uiFocus', function($timeout) {
		return function(scope, elem, attrs) {
			scope.$watch(attrs.uiFocus, function(newVal) {
				if (newVal) {
					$timeout(function() {
						elem[0].focus();
					}, 0, false);
				}
			});
		};
	});

}());