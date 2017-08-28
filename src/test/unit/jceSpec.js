(function() {
	"use strict";

	describe('jceCtrl', function() {

		it("will create jceCtrl module", function() {
			expect(angular.module('jceCtrl')).toBeDefined();
		});


		describe('javaClassParserService', function() {
			var javaClassParserService;
			beforeEach(function() {
				var $injector = angular.injector(['jceCtrl']);
				javaClassParserService = $injector.get('javaClassParserService');
			});

			describe('parseFieldDescriptor', function() {

				it('B', function() {
					expect(javaClassParserService.parseFieldDescriptor('B')).toEqual('byte');
				});

				it('C', function() {
					expect(javaClassParserService.parseFieldDescriptor('C')).toEqual('char');
				});

				it('D', function() {
					expect(javaClassParserService.parseFieldDescriptor('D')).toEqual('double');
				});

				it('F', function() {
					expect(javaClassParserService.parseFieldDescriptor('F')).toEqual('float');
				});

				it('I', function() {
					expect(javaClassParserService.parseFieldDescriptor('I')).toEqual('int');
				});

				it('J', function() {
					expect(javaClassParserService.parseFieldDescriptor('J')).toEqual('long');
				});

				it('S', function() {
					expect(javaClassParserService.parseFieldDescriptor('S')).toEqual('short');
				});

				it('Z', function() {
					expect(javaClassParserService.parseFieldDescriptor('Z')).toEqual('boolean');
				});

				it('reference', function() {
					expect(javaClassParserService.parseFieldDescriptor('Ljava/lang/String;')).toEqual('java.lang.String');
				});

				it('array', function() {
					expect(javaClassParserService.parseFieldDescriptor('[B')).toEqual('byte[]');
				});

				it('multi array', function() {
					expect(javaClassParserService.parseFieldDescriptor('[[[B')).toEqual('byte[][][]');
				});

				it('reference array', function() {
					expect(javaClassParserService.parseFieldDescriptor('[Ljava/lang/String;')).toEqual('java.lang.String[]');
				});

				it('unknown', function() {
					expect(function() {
						javaClassParserService.parseFieldDescriptor('xxx');
					}).toThrow();
				});
			});

			describe('parseMethodSignature', function() {

				it('no args and void', function() {
					expect(javaClassParserService.parseMethodSignature('()V')).toEqual('void ()');
				});

				it('arg and void', function() {
					expect(javaClassParserService.parseMethodSignature('(J)V')).toEqual('void (long)');
				});

				it('args and void', function() {
					expect(javaClassParserService.parseMethodSignature('(JJ)V')).toEqual('void (long,long)');
				});

				it('object args and void', function() {
					expect(javaClassParserService.parseMethodSignature('(Ljava/lang/String;)V')).toEqual('void (java.lang.String)');
				});

				it('no args and object', function() {
					expect(javaClassParserService.parseMethodSignature('()Ljava/lang/String;')).toEqual('java.lang.String ()');
				});

				it('no args and primative', function() {
					expect(javaClassParserService.parseMethodSignature('()Z')).toEqual('boolean ()');
				});

				it('object args and object', function() {
					expect(javaClassParserService.parseMethodSignature('(Ljava/lang/String;Ljava/lang/String;Z)Ljava/lang/String;')).toEqual('java.lang.String (java.lang.String,java.lang.String,boolean)');
				});

				it('unknown', function() {
					expect(function() {
						javaClassParserService.parseMethodSignature('xxx');
					}).toThrow();
				});
			});
		});
	});
}());