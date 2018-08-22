var path = require('path');
var fs = require('fs-extra');
var sitesFolder = path.resolve('/home/pranav/travel_website_scrap1');

var klaw = require('klaw');
var through2 = require('through2');



var allEmails = [];
var allPhoneNumbera = [];

  function processFile(path){
    return fs.readFileSync(path).toString();
  }

  var emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;

  function extractEmailFromString(string){
  	var array = string.match(emailRegex);
  	if(array){
	    allEmails = allEmails.concat(array);
  	}
  }

  var phoneNumberRegex  = /((\+*)((0[ -]+)*|(91 )*)(\d{12}|\d{10}))|\d{5}([- ]*)\d{6}/gi; 

  function extractPhoneNumber(string){
    //var whiteSpaceRemoveString = string.replace(/\s/g,'');
    var array = string.match(phoneNumberRegex);
    if(array){
	    allPhoneNumbera = allPhoneNumbera.concat(array);
    }
  }

  function walkFolder(htmlFolder,cb){

  var finalString = "";
  var includeHtmlFilter = through2.obj(function (item, enc, next) {
    if (item.path.indexOf('.html') > -1) this.push(item);
    next();
  });

  klaw(htmlFolder)
    .pipe(includeHtmlFilter)
	.on('error', function(err){
		includeHtmlFilter.emit('error', err);
	})
    .on('data', function(item){finalString = finalString + processFile(item.path);})
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
    console.log(item);
    walkFolder(item,done);
  }, function(){
    console.log('All done');
    fs.writeJsonSync('./phoneNumber1.json', {phone:allPhoneNumbera});
    fs.writeJsonSync('./emails.json1', {email:allEmails});
  });



