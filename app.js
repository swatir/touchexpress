/*
Copyright (c) 2011, Groupon. All rights reserved.
Author: Swati Raju
version: 1.0.0
/**
 * Module dependencies.
 */

var express = require('express');

var app = module.exports = express.createServer();

var http = require('http');

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

//HELPERS: to do - move to it's own directory and path. /helpers/dealsHelper.js
app.helpers({
  decodeHTMLSpecialChars: function(str){
    return str.replace(/&gt;/g , ">").replace(/</g, "&lt;").replace(/"/g, "&quot;");
  },
  groupon_conditions_ul_touch: function(campaign){
    var expires = campaign.options[0].expiresAt;
    var tokens = expires.split("T");
    return "Expires " + tokens[0];
  },
  getArea: function(deal){
    var area = deal.division_name
    if (deal.areas && deal.areas.length){
      var permalink = deal.areas[0];
      var tokens = permalink.split("-");
      area = "";
      for(t in tokens){
        if (tokens.hasOwnProperty(t)) area += tokens[t].charAt(0).toUpperCase() + tokens[t].substring(1) + " ";
       }
    }
    return area;
  }
});

var property = require("./property.js");    
app.dynamicHelpers ({
  styles: function () {
    return property.create ();
  },
  bottom: function () {
    return property.create ();
  }
});

// Routes
// to do: move all interaction to API to it's own data model module
app.get('/', function(req, res){
  
  var options = {
    host: 'api.groupon.com',
    port: 80,
    path: '/v2/deals.json?division_id=chicago&client_id=xxx',
    method: 'GET'
  };

  var featured = {};
  
  var request = http.request(options, function(response) {
    var apiResponse = "";
    response.setEncoding('utf8');
    response.on('data', function (chunk) {
      apiResponse += chunk;
    });
    response.on('end', function () {
      var jsonResponse = JSON.parse(apiResponse);
      var deals = jsonResponse.deals;
      var campaign = {};
      var sideDeals = [];
      console.log(deals.length);
      for(i in deals){
        if (deals[i].placementPriority == "featured"){
          campaign = deals[i];
          console.log(campaign);
        } else {
          sideDeals.push(deals[i]);
        }
      }
      res.render('deals/show', {
        title: "Groupon Deal of the Day",
        campaign: campaign,
        sideDeals: sideDeals
      });
    });
  });
  // write data to request body
  request.end();  
  
});

app.listen(3000);
console.log("Express server listening on port %d", app.address().port);
