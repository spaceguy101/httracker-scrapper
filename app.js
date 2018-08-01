var path = require('path');
var fs = require('fs-extra');
var sitesFolder = path.resolve('/home/shreyas/travel_website_scrap');

var klaw = require('klaw');
var through2 = require('through2');

var includeHtmlFilter = through2.obj(function (item, enc, next) {
  if (item.path.indexOf('.html') > -1) this.push(item);
  next();
});

var allEmails = [];
var allPhoneNumbera = [];
var finalString = "";


  function processFile(path){
  	fileToString(path,function(err,string){
      finalString = finalString + string;
  	});
  }

  function fileToString(path,cb){
  	fs.readFile(path, function (err, data) {
	    if (err) throw err;
	    cb(err,data.toString());
	});
  }

  var emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;

  function extractEmailFromString(string){
  	var array = string.match(emailRegex);
  	if(array){
	    allEmails = array.filter(function(item, pos) {
	        return array.indexOf(item) == pos;
	    });
	    console.log('Emails found :' );
	    console.log(allEmails);
  	}

  }

  var phoneNumberRegex  = /((\+*)((0[ -]+)*|(91 )*)(\d{12}|\d{10}))|\d{5}([- ]*)\d{6}/gi; 

  function extractPhoneNumber(string){
    //var whiteSpaceRemoveString = string.replace(/\s/g,'');
    var array = string.match(phoneNumberRegex);
    if(array){
	    allPhoneNumbera = array.filter(function(item, pos) {
	        return array.indexOf(item) == pos;
	    });
	    console.log('Phone Number found :' );
	    console.log(allPhoneNumbera);
    }

  }

  function walkFolder(htmlFolder,cb){

    klaw(htmlFolder)
    .pipe(includeHtmlFilter)
	.on('error', function(err){
		includeHtmlFilter.emit('error', err);
	})
    .on('data', function(item){processFile(item.path);})
    .on('end', function() {
      extractEmailFromString(finalString);
      extractPhoneNumber(finalString);
      cb();
    });

  }

  var allSitesFolders = fs.readdirSync(sitesFolder)
                        .map(file => path.join(sitesFolder, file))
                        .filter(path => fs.statSync(path).isDirectory());

  var forEach = require('async-foreach').forEach;

  forEach(allSitesFolders, function(item, index, arr) {
    var done = this.async();
    walkFolder(item,done);
  }, function(){
    console.log('All done');
    fs.writeJsonSync('./phoneNumber.json', allPhoneNumbera);
    fs.writeJsonSync('./emails.json', allEmails);
  });



