#!/usr/bin/env node
 //var process = require('process');
var fs = require('fs');
var Buffer = require('buffer').Buffer;
var constants = require('constants');

var filename = process.argv[2];
var outputname = process.argv[3] || 'output.json';

var Binary2DecimalJsonStream = function() {
	this.readable = true;
	this.writable = true;
	this.counter = 0;
};
require("util").inherits(Binary2DecimalJsonStream, require("stream"));

Binary2DecimalJsonStream.prototype._transform = function(data) {
	if (data) {
		var tdata = "";
		var length = data.length;

		if(this.counter === 0) {
			tdata += "[";
		}

		for (var i = 0; i < length; i++) {
			if(this.counter !== 0) {
				tdata += ",";
			}
			tdata += data[i];

			this.counter++;
			if(this.counter % 16 === 0) {
				tdata+="\n";
			}
		}
		this.emit("data", tdata);
	} else {
		this.emit("data", "");
	}
};

Binary2DecimalJsonStream.prototype.write = function() {
	this._transform.apply(this, arguments);
};

Binary2DecimalJsonStream.prototype.end = function() {
	this._transform.apply(this, arguments);
	this.emit("data", "]");
	this.emit("end");
};


var fs = require("fs"),
	input = fs.createReadStream(filename),
	output = fs.createWriteStream(outputname),
	binary2DecimalJson = new Binary2DecimalJsonStream();

input
	.pipe(binary2DecimalJson)
	.pipe(output);