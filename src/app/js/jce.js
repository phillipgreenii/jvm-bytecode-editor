(function() {
	"use strict";

	/* JCE Ctrl Module */
	var jceCtrlModule = angular.module('jceCtrl', ['ngResource', 'ngSanitize', 'ui.bootstrap']);


	jceCtrlModule.
	controller('JceCtrl', function JceCtrl($scope, $http, $log) {
		$scope.bytecode = [];

		$scope.decodedClass = null;

		//XXX TESTING ONLY: files will be added by users, this is only here for visual testing
		$http.get('/data/Simple.json').success(function(data, status) {
			$log.log("retrieved bytecode", status);
			$scope.bytecode = data;
		});

		//XXX TESTING ONLY: files will be added by users, this is only here for visual testing
		$http.get('/data/SimpleDecoded.json').success(function(data, status) {
			$log.log("retrieved parsed bytecode", status);
			$scope.decodedClass = data;
		});
	});

	jceCtrlModule.
	factory('javaClassInfoService', function() {
		var accessFlagBitsByType = {
			'class': [{
					value: 0x4000,
					name: 'enum'
				}, {
					value: 0x2000,
					name: 'annotation'
				}, {
					value: 0x1000,
					name: 'synthetic'
				}, {
					value: 0x0400,
					name: 'abstract'
				}, {
					value: 0x0200,
					name: 'interface'
				}, {
					value: 0x0020,
					name: 'super'
				}, {
					value: 0x0010,
					name: 'final'
				}, {
					value: 0x0001,
					name: 'public'
				}
			],
			'field': [{
					value: 0x4000,
					name: 'enum'
				}, {
					value: 0x1000,
					name: 'synthetic'
				}, {
					value: 0x0080,
					name: 'transient'
				}, {
					value: 0x0040,
					name: 'volatile'
				}, {
					value: 0x0010,
					name: 'final'
				}, {
					value: 0x0008,
					name: 'static'
				}, {
					value: 0x0004,
					name: 'protected'
				}, {
					value: 0x0002,
					name: 'private'
				}, {
					value: 0x0001,
					name: 'public'
				}
			],
			'method': [{
					value: 0x1000,
					name: 'synthetic'
				}, {
					value: 0x0800,
					name: 'strict'
				}, {
					value: 0x0400,
					name: 'abstract'
				}, {
					value: 0x0100,
					name: 'native'
				}, {
					value: 0x0080,
					name: 'varargs'
				}, {
					value: 0x0040,
					name: 'bridge'
				}, {
					value: 0x0020,
					name: 'synchronized'
				}, {
					value: 0x0010,
					name: 'final'
				}, {
					value: 0x0008,
					name: 'static'
				}, {
					value: 0x0004,
					name: 'protected'
				}, {
					value: 0x0002,
					name: 'private'
				}, {
					value: 0x0001,
					name: 'public'
				}
			],
			'nestedclass': [{
					value: 0x4000,
					name: 'enum'
				}, {
					value: 0x2000,
					name: 'annotation'
				}, {
					value: 0x1000,
					name: 'synthetic'
				}, {
					value: 0x0400,
					name: 'abstract'
				}, {
					value: 0x0200,
					name: 'interface'
				}, {
					value: 0x0010,
					name: 'final'
				}, {
					value: 0x0008,
					name: 'static'
				}, {
					value: 0x0004,
					name: 'protected'
				}, {
					value: 0x0002,
					name: 'private'
				}, {
					value: 0x0001,
					name: 'public'
				}
			]
		};


		var majorVersionLookup = {
			51: "J2SE 7",
			50: "J2SE 6.0",
			49: "J2SE 5.0",
			48: "JDK 1.4",
			47: "JDK 1.3",
			46: "JDK 1.2",
			45: "JDK 1.1",
		};

		return {
			lookupAccessFlagBitsByType: function(type) {
				return angular.copy(accessFlagBitsByType[type]);
			},
			lookupMajorVersion: function(majorVersion) {
				return majorVersionLookup[majorVersion];
			}
		};
	});

	jceCtrlModule.
	factory('javaClassParserService', function() {

		function convertFromInternal(internalClass) {
			return internalClass.replace(/\//g, ".");
		}

		function extractFieldDescriptor(descriptor) {
			return extractFieldType(descriptor);
		}

		function extractComponentType(descriptor) {
			return extractFieldType(descriptor);
		}

		function extractFieldType(descriptor) {
			return extractBaseType(descriptor) || extractObjectType(descriptor) || extractArrayType(descriptor);
		}


		function extractBaseType(descriptor) {
			var lookup = {
				'B': "byte",
				'C': "char",
				'D': "double",
				'F': "float",
				'I': "int",
				'J': "long",
				'S': "short",
				'Z': "boolean"
			};
			var baseTypeMatcher = /^([BCDFIJSZ])/,
				baseTypeConverter = function(match) {
					return lookup[match];
				},
				baseTypeFormatter = function(val) {
					return val;
				};
			return extractType(baseTypeMatcher, baseTypeConverter, baseTypeFormatter, descriptor);
		}

		function extractObjectType(descriptor) {
			var objectTypeMatcher = /^L([^;]*);/,
				objectTypeConverter = convertFromInternal,
				objectTypeFormatter = function(val) {
					return val;
				};
			return extractType(objectTypeMatcher, objectTypeConverter, objectTypeFormatter, descriptor);
		}

		function extractArrayType(descriptor) {
			var arrayTypeMatcher = /^\[(.*)/,
				arrayTypeConverter = extractComponentType,
				arrayTypeFormatter = function(val) {
					return val + "[]";
				};
			return extractType(arrayTypeMatcher, arrayTypeConverter, arrayTypeFormatter, descriptor);
		}

		function extractType(matcher, converter, formatter, descriptor) {
			var match = matcher.exec(descriptor),
				val = match && match[1] && converter(match[1]);
			if (val) {
				if (angular.isString(val)) {
					return {
						type: formatter(val),
						length: match[0].length
					};
				} else {
					return {
						type: formatter(val.type),
						length: match[0].length
					};
				}
			} else {
				return null;
			}
		}



		function isBaseType(descriptor) {
			var baseTypeMatcher = /^[BCDFIJSZ]$/;
			return !!baseTypeMatcher.exec(descriptor);
		}



		function parseFieldDescriptor(descriptor) {
			var extractedType = extractFieldDescriptor(descriptor);
			if (descriptor && extractedType.length === descriptor.length) {
				return extractedType.type;
			} else {
				return null;
			}
		}

		function parseComponentType(descriptor) {
			return parseFieldType(descriptor);
		}

		function parseFieldType(descriptor) {
			return parseBaseType(descriptor) || parseObjectType(descriptor) || parseArrayType(descriptor);
		}



		function parseBaseType(descriptor) {
			var lookup = {
				'B': "byte",
				'C': "char",
				'D': "double",
				'F': "float",
				'I': "int",
				'J': "long",
				'S': "short",
				'Z': "boolean"
			};
			if (descriptor && isBaseType(descriptor)) {
				return lookup[descriptor];
			} else {
				return null;
			}
		}

		function parseObjectType(descriptor) {
			var objectTypeMatcher = /^L(.*);$/,
				match = objectTypeMatcher.exec(descriptor),
				val = match && match[1] && convertFromInternal(match[1]);
			if (val) {
				return val;
			} else {
				return null;
			}
		}

		function parseArrayType(descriptor) {
			var arrayTypeMatcher = /^\[(.*)$/,
				match = arrayTypeMatcher.exec(descriptor),
				val = match && match[1] && parseComponentType(match[1]);
			if (val) {
				return val + "[]";
			} else {
				return null;
			}
		}


		function parseMethodSignature(signature) {
			var signatureMatcher = /^\((.*)\)(.*)$/,
				match = signatureMatcher.exec(signature),
				parameterDescriptors = match && (match[1] || match[1] === "") && parseMethodParameters(match[1]),
				returnDescriptor = match && match[2] && parseReturnDescriptor(match[2]);
			if (parameterDescriptors && returnDescriptor) {
				return returnDescriptor + " (" + parameterDescriptors.join(",") + ")";
			} else {
				return null;
			}
		}



		function parseMethodParameters(unparsedMethodParameters) {
			var remainingUnparsedMethodParameters = unparsedMethodParameters,
				methodParameters = [],
				extractedType = null;
			while (remainingUnparsedMethodParameters) {
				extractedType = extractFieldDescriptor(remainingUnparsedMethodParameters);
				if (extractedType) {
					methodParameters.push(extractedType.type);
					remainingUnparsedMethodParameters = remainingUnparsedMethodParameters.substring(extractedType.length);
				} else {
					throw new Error("Illegal method parameters descriptor: " + unparsedMethodParameters);
				}
			}
			return methodParameters;
		}

		function parseVoidDescriptor(descriptor) {
			if (descriptor === 'V') {
				return "void";
			} else {
				return null;
			}
		}

		function parseReturnDescriptor(descriptor) {
			return parseFieldType(descriptor) || parseVoidDescriptor(descriptor);
		}

		return {
			parseFieldDescriptor: function(descriptor) {
				var parsedDescriptor = parseFieldDescriptor(descriptor);
				if (parsedDescriptor) {
					return parsedDescriptor;
				} else {
					throw new Error("Illegal field descriptor: " + descriptor);
				}
			},
			parseMethodSignature: function(signature) {
				var methodSignature = parseMethodSignature(signature);
				if (methodSignature) {
					return methodSignature;
				} else {
					throw new Error("Illegal method signature: " + signature);
				}
			}
		};
	});

	jceCtrlModule.filter('words', function($log) {
		function formatByte(byte) {
			if (byte) {
				var val = byte.toString(16);
				if (val.length === 0) {
					return "00";
				} else if (val.length === 1) {
					return "0" + val.toUpperCase();
				} else {
					return val.toUpperCase();
				}
			} else {
				return "00";
			}
		}

		return function(bytecode, wordLength) {
			$log.log('filtering words');
			if (isNaN(wordLength)) {
				wordLength = 2;
			}

			var words = [];
			var length = bytecode.length;
			for (var i = 0; i < length; i += wordLength) {
				var word = "";
				for (var j = 0; j < wordLength; j++) {
					if (i + j >= length) {
						break;
					}
					word += formatByte(bytecode[i + j]);
				}
				words.push(word);
			}


			return words;
		};
	});

	jceCtrlModule.directive('jceAccessflags', function factory() {
		return {
			templateUrl: 'templates/accessFlags.html',
			replace: true,
			restrict: 'E',
			controller: function($scope, $log, javaClassInfoService) {
				var previousType, bits;

				$scope.parse = function(type, bytes) {
					$log.log('parsing accessflags', type, bytes);
					if (previousType !== type) {
						bits = javaClassInfoService.lookupAccessFlagBitsByType(type);
						previousType = type;
					}
					if (!bits) {
						throw new Error("unsupported accessflags type: " + type);
					}
					bits.forEach(function(bd) {
						bd.enabled = bd.value & bytes;
					});
					return bits;
				};
			},
			scope: {
				'value': '=',
				'type': '@'
			}
		};
	});

	jceCtrlModule.directive('jceAttributes', function factory($compile) {
		return {
			restrict: 'E',
			terminal: true,
			scope: {
				'attributes': '='
			},
			link: function(scope, element, attrs) {
				var template = '<div class="attributes">';
				console.log('current attributes',scope.attributes, angular.isArray(scope.attributes), scope.attributes.length > 0);
				if (angular.isArray(scope.attributes) && scope.attributes.length > 0) {
					template += '<ol start="0">';
					template += '<li ng-repeat="attribute in attributes">';
					template += '<jce:Attribute attribute="attribute"/>';
					template += '</li>';
					template += '</ol>';
				}
				template += '</div>';

				var newElement = angular.element(template);
				$compile(newElement)(scope);
				element.replaceWith(newElement);
			}
		};
	});

	jceCtrlModule.directive('jceAttribute', function factory() {
		return {
			templateUrl: 'templates/attribute.html',
			replace: true,
			restrict: 'E',
			scope: {
				'attribute': '='
			}
		};
	});

	jceCtrlModule.directive('jceClassversion', function factory() {
		return {
			templateUrl: 'templates/classVersion.html',
			replace: true,
			restrict: 'E',
			controller: function($scope, $log, javaClassInfoService) {

				$scope.lookupCommonVersionName = function(majorVersion) {
					return javaClassInfoService.lookupMajorVersion(majorVersion);
				};
			},
			scope: {
				'version': '='
			}
		};
	});

	jceCtrlModule.directive('jceClassname', function factory() {
		return {
			templateUrl: 'templates/className.html',
			replace: true,
			restrict: 'E',
			scope: {
				'name': '='
			}
		};
	});

	jceCtrlModule.directive('jceConstantpool', function factory() {
		return {
			templateUrl: 'templates/constantpool.html',
			replace: true,
			restrict: 'E',
			scope: {
				'constantpool': '='
			}
		};
	});

	jceCtrlModule.directive('jceConstantpoolentry', function factory() {
		return {
			templateUrl: 'templates/constantpoolentry.html',
			replace: true,
			restrict: 'E',
			scope: {
				'entry': '='
			}
		};
	});

	jceCtrlModule.directive('jceFields', function factory() {
		return {
			templateUrl: 'templates/fields.html',
			replace: true,
			restrict: 'E',
			scope: {
				'fields': '='
			}
		};
	});

	jceCtrlModule.directive('jceField', function factory() {
		return {
			templateUrl: 'templates/field.html',
			replace: true,
			restrict: 'E',
			controller: function($scope, $log, javaClassParserService) {
				$scope.parseDescriptor = function(descriptor) {
					return javaClassParserService.parseFieldDescriptor(descriptor);
				};
			},
			scope: {
				'field': '='
			}
		};
	});

	jceCtrlModule.directive('jceMethods', function factory() {
		return {
			templateUrl: 'templates/methods.html',
			replace: true,
			restrict: 'E',
			scope: {
				'methods': '='
			}
		};
	});

	jceCtrlModule.directive('jceMethod', function factory() {
		return {
			templateUrl: 'templates/method.html',
			replace: true,
			restrict: 'E',
			controller: function($scope, $log, javaClassParserService) {
				$scope.parseSignature = function(signature) {
					return javaClassParserService.parseMethodSignature(signature);
				};
			},
			scope: {
				'method': '='
			}
		};
	});

}());