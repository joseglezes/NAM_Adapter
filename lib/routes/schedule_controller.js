/**
 *    File:         routes/schedule_controller.js
 *
 *    Author:       Luis Fernando Garcia 
 *                  Polytechnic University of Madrid (UPM)
 *
 *    Date:         07/10/2014
 *
 *    Description:  XIMM-NAM Adapter - 
 *
 *    License:
 * 
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 * 
 *     * Redistributions of source code must retain the following copyright notice,
 *       this list of conditions and the disclaimer below.
 * 
 *        Copyright (c) 2003-2008, Polytechnic University of Madrid (UPM)
 * 
 *                              All rights reserved.
 * 
 *     * Redistribution in binary form must reproduce the above copyright notice,
 *       this list of conditions and the following disclaimer in the documentation
 *       and/or other materials provided with the distribution.
 * 
 *    *  Neither the name of Polytechnic University of Madrid nor the names of its 
 *       contributors may be used to endorse or promote products derived from this 
 *       software without explicit prior written permission.
 * 
 * You are under no obligation whatsoever to provide any enhancements to Polytechnic 
 * University of Madrid,or its contributors.  If you choose to provide your enhance-
 * ments, or if you choose to otherwise publish or distribute your enhancement, in 
 * source code form without contemporaneously requiring end users to enter into a 
 * separate written license agreement for such enhancements, then you thereby grant 
 * Polytechnic University of Madrid, its contributors, and its members a non-exclusive, 
 * royalty-free, perpetual license to copy, display, install, use, modify, prepare 
 * derivative works, incorporate into the software or other computer software, dis-
 * tribute, and sublicense your enhancements or derivative works thereof, in binary 
 * and source code form.
 * 
 * DISCLAIMER - THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * “AS IS” AND WITH ALL FAULTS.  THE POLYTECHNIC UNIVERSITY  OF MADRID, ITS CONTRI-
 * BUTORS, AND ITS MEMBERS DO NOT IN ANY WAY WARRANT, GUARANTEE, OR ASSUME ANY RES-
 * PONSIBILITY, LIABILITY OR OTHER UNDERTAKING WITH RESPECT TO THE SOFTWARE. ANY E-
 * XPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRAN-
 * TIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT
 * ARE HEREBY DISCLAIMED AND THE ENTIRE RISK OF SATISFACTORY QUALITY, PERFORMANCE,
 * ACCURACY, AND EFFORT IS WITH THE USER THEREOF.  IN NO EVENT SHALL THE COPYRIGHT
 * OWNER, CONTRIBUTORS, OR THE UNIVERSITY CORPORATION FOR ADVANCED INTERNET DEVELO-
 * PMENT, INC. BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY,
 * OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTIT-
 * UTE GOODS OR SERVICES; REMOVAL OR REINSTALLATION LOSS OF USE, DATA, SAVINGS OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILIT-
 * Y, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHE-
 * RWISE) ARISING IN ANY WAY OUT OF THE USE OR DISTRUBUTION OF THIS SOFTWARE, EVEN
 * IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 * 
 */




// import the necessary modules
var config = require('../config/config.json');
var scheduledMeasuare = require('../models/scheduledMeasures.js');
var superagent = require('superagent');
var dateformat = require('dateformat');
var logger = require('../logger.js');

//var cronJob = require('cron').CronJob;


//constants
var TIMEOUT = 30000;




exports.scheduleTest = function(req, res, next) {

	var auth_token = req.headers['x-auth-token'];
	logger.info("params tst:");
	logger.info(req.params);
	logger.info(req.body);
	//logger.info("token - schedule")
	//logger.info(auth_token);
	
	//Check minimal parameters 
	if (req.body.type && req.body.hostDestination && req.body.frequency){
		
		var interval_default = 20;
		//Check active scheduledTests
		scheduledMeasuare.count({ active: true }, function (err, count) {
			
	  		if(!err) {
	  		logger.info('Number active ScheduledTest: ' + count);
	  			
	  		    // Checking limit scheduledTest is not exceeded
	  			if(config.limit_scheduledTest > count){
	  				//logger.info("scheduled valid");
	  				
	  				var cp = require('child_process');

	  				var n = cp.fork(__dirname + '/schedule.js');
		    		
	  				// 
		    		n.on('message', function(m) {
		    		  //logger.info('PARENT got message:', m);
		    		  
		    		  scheduledMeasuare.findById(m.scheduleId, function(err, scheduledm) {
		    			  scheduledm.measures.push(m.measureId);
		    			  //logger.info(scheduledm);
		    			  scheduledm.save(function(err) {
		    				  if(!err) {
				      	    	logger.info('Saved');
				      	    	
		    				  } else {
				      	    	logger.error('ERROR: ' + err);
				      	    	
		    				  }
				      	    
		    			  });
	
			      		});
		    		  
		    		});
	  				
	  				var scheduledmeasuare = new scheduledMeasuare({
	  			   	  
	  			    	idSchedule:			req.body.type + "-" + Date.now(),
	  			    	domain:				config.federation + '-' + config.regionId,
	  			    	host:				req.headers.host  || config.scheduler_endpoint_default,
	  			      	type:				req.body.type,
	  			      	startDate:			dateformat(new Date(), 'yyyy-mm-dd H:MM:ss'),
	  			      	regionIdSource:		req.body.regionIdSource,
	  			      	hostSource:			req.body.hostSource || req.headers.host,
	  			      	regionIdDestination: req.body.regionIdDestination,
	  			      	hostDestination:	req.body.hostDestination,
	  			    	endDate:			req.body.EndDate || null,
	  			    	frequency:			req.body.frequency || interval_default,
	  			   	    countMeasures:		0,	    
	  			   	    processId:			n.pid,
	  			   	    active:				true
	  			    	
	  				});
	  				
	
	  				
	  			    scheduledmeasuare.save(function(err) {
	  			    	if(!err) {
	  			    		logger.info('Created ScheduledTest '+ scheduledmeasuare.type+ " - interval: " + scheduledmeasuare.frequency);
	  			    		res.send("mesuare scheduled");
	  			    		
	  			    		// send init data scheduled  
	  			    		//logger.info(scheduledmeasuare);
	  			    		n.send(scheduledmeasuare);
	  			    		//n.send(auth_token)
	  			    		//schedu (scheduledmeasuare);

	  			    	} else {
	  			    		logger.error('ERROR: ' + err);
	  			    		res.send('ERROR: ' + err);
	  		    		
	  		    		}
	  			    	
	  			    });
	  			    
	  			    
	  		    
	  		    
	  				
	  			}else {
	  				
	  				res.send('ERROR: exceeded limit sheduled test');
	  			}
	  			
	  			
	  		} else {
	  			logger.error('ERROR: ' + err);
	  			res.send('ERROR: ' + err);
	  		}
	  	});
		
		
	}else {
		res.send('Error: invalid parameters');
	}
	
};



exports.killSchedule = function (req, res, next){
	
	if (req.body.scheduledId){
		
		scheduledMeasuare.findById(req.body.scheduledId, function(err, scheduledm) {
  			
			scheduledm.active = false;
			scheduledm.EndDate = new Date();
			process.on('uncaughtException', function(err) {
				logger.info('Caught exception: ' + err);
			});
			
			scheduledm.save(function(err) {
				if(!err) {
					logger.info('scheduledTest '+scheduledm._id+' Stop');
					process.kill(scheduledm.processId, 'SIGHUP');
					
				} else {
					logger.error('ERROR: ' + err);
					
				}
				
			});
			//logger.info(scheduledm);
			
			
		});
		
		res.send('scheduleTest stop OK');
	
	}else {
		res.send('Error: invalid parameters');
	}

};


exports.requiresAvailableHosts = function (req, res, next) {
	
	logger.info("Check hosts Link available");
	//logger.info(req.body);
	//logger.info(req.params)
	
	
	// Check Source Host is available
	if (req.body.regionId && req.body.hostId && req.body.frequency && req.body.type ){
		
		var base_url = config.ls_global + '/regions/'+req.params.regionIdS+ '/hosts/' ;
		
		var hosts_ip ={
				
				source: "",
				regionIdDestination :"",
				destination :"",
				port_source: "",
				port_destination: "",				
				frequency :req.body.frequency,
				typeTest: req.body.type
		
		};
		logger.info(base_url + req.params.hostIdS);
		superagent.get(base_url + req.params.hostIdS)
	      .end(function(error, resp){
	    	  if(error){
	        		logger.info("Source Host not found _ error");
	        		res.send("Source Host no found");
	        	}else{
	        			        		
	        		if(resp.body!= null && typeof(resp.body) == 'object'&& resp.body.length > 0 ){
	        			
	        			if("ipAddress" in resp.body[0]){
	        				
	        				base_url = config.ls_global + '/regions/'+req.body.regionId+ '/hosts/';
	        				
	        				hosts_ip.source = resp.body[0].ipAddress;
	        				hosts_ip.port_source = resp.body[0].port_NAM  || 3000;
	        				
	        				
		        			// Check destination region is available
	        				logger.info(base_url + req.body.hostId);
		        			superagent.get(base_url + req.body.hostId)
		        		      .end(function(error, resp){
		        		    	  if(error){
		        		        		logger.info("Host Destination not found");
		        		        		res.send("Host Destination no found");
		        		        	}else{
		        		        		
		        		        		if(resp.body!= null && typeof(resp.body) == 'object'&& resp.body.length > 0 ){
		        		        			
		        		        			if("ipAddress" in resp.body[0]){
		        		        				hosts_ip.regionIdDestination = resp.body[0].regionId;
		        		        				hosts_ip.destination = resp.body[0].ipAddress;	
		        		        				hosts_ip.port_destination = resp.body[0].port_NAM  || 3000;
		        		        				
		        			        			req.post = hosts_ip;

		        			                    next();
		        			        			
		        			        		}else{
		        			        			logger.info("Destination Host not found _ Prueba aqui");
		        			        			res.send("Destination Host no found");
		        			        			
		        			        		}
		        		        		}else{
		        		        			logger.info("Destination Host not found");
		        		        			res.send("Destination Host no found");
		        		        			
		        		        		}
		        		        		
	
		        		        		
		        		        	}
		        		        });
		        			
		        		}else{
		        			logger.info("Source Host not foun");
		        			res.send("Source Host no found");
		        			
		        		}
	        		}else{
	        			logger.info("Source Host not found");
	        			res.send(" Source Host no found");
	        			
	        		}
	        		
	        		
	        		
	        		
	        		
	        		
	        	}
	        });
	      
    	
		
		
	}else{
		logger.info('Error: invalid parameters');
		res.send('Error: invalid parameters');
	}
};

exports.schedule = function (req, res, next) {
	
	var auth_token = req.headers['x-auth-token'];
	
	var path_call = 'http://localhost:'+req.post.port_source+'/monitoring/schedule' 
		//logger.info("params sch")
	//logger.info(req.params)	
	//logger.info(req.post);
		
	// Send schedule
	
	superagent.post(path_call)
	 .set('X-Auth-Token', auth_token)
      .send({
    	  type: req.post.typeTest,
    	  regionIdSource: req.params.regionIdS,
    	  hostSource: req.post.source + ':'+ req.post.port_source,
    	  regionIdDestination: req.post.regionIdDestination,
    	  hostDestination: req.post.destination + ':'+ req.post.port_destination,
    	  frequency: req.post.frequency
    	  
      })
      .end(function(e,resp){
        if (e){
        	
        	logger.error("Error mesuare scheduled " , e);
        	res.send(503, "Error mesuare scheduled ");
        	
        }else {
        	res.send("mesuare scheduled");
        	
        }
        
      });
    
};

exports.scheduleTest_Local = function(scheduledData) {

	logger.info(scheduledData);

	var interval_default = 20;
	//Check active scheduledTests
	scheduledMeasuare.count({ active: true }, function (err, count) {
		
  		if(!err) {
  		logger.info('Number active ScheduledTest: ' + count);
  			
  		    // Checking limit scheduledTest is not exceeded
  			if(config.limit_scheduledTest > count){
  				//logger.info("scheduled valid");
  				
  				var cp = require('child_process');

  				var n = cp.fork(__dirname + '/schedule.js');
	    		
  				// 
	    		n.on('message', function(m) {
	    		  //logger.info('PARENT got message:', m);
	    		  
	    		  scheduledMeasuare.findById(m.scheduleId, function(err, scheduledm) {
	    			  scheduledm.measures.push(m.measureId);
	    			  //logger.info(scheduledm);
	    			  scheduledm.save(function(err) {
	    				  if(!err) {
			      	    	logger.info('Saved');
			      	    	
	    				  } else {
			      	    	logger.error('ERROR: ' + err);
			      	    	
	    				  }
			      	    
	    			  });

		      		});
	    		  
	    		});
  				
  				var scheduledmeasuare = new scheduledMeasuare({
  			   	  
  			    	idSchedule:			scheduledData.type + "-" + Date.now(),
  			    	domain:				config.federation + '-' + config.regionId,
  			      	type:				scheduledData.type,
  			      	startDate:			dateformat(new Date(), 'yyyy-mm-dd H:MM:ss'),
  			      	regionIdSource:		config.regionId,
  			      	hostSource:			config.hostId + ":" + config.port_NAM_Adapter,
  			      	regionIdDestination: scheduledData.regionId,
  			      	hostDestination:	scheduledData.hostId,
  			    	endDate:			scheduledData.EndDate || null,
  			    	frequency:			scheduledData.frequency || interval_default,
  			   	    countMeasures:		0,	    
  			   	    processId:			n.pid,
  			   	    active:				true
  			    	
  				});
  				

  				
  			    scheduledmeasuare.save(function(err) {
  			    	if(!err) {
  			    		logger.info('Created ScheduledTest '+ scheduledmeasuare.type+ " - interval: " + scheduledmeasuare.frequency);
  			    		
  			    		
  			    		// send init data scheduled  
  			    		//logger.info(scheduledmeasuare);
  			    		n.send(scheduledmeasuare);
  			    		//n.send(auth_token)
  			    		//schedu (scheduledmeasuare);

  			    	} else {
  			    		logger.error('ERROR: ' + err);
  			    		
  		    		
  		    		}
  			    	
  			    });
  			    
  			    
  		    
  		    
  				
  			}else {
  				
  				logger.info('ERROR: exceeded limit sheduled test');
  			}
  			
  			
  		} else {
  			logger.error('ERROR: ' + err);
  			logger.info('ERROR: ' + err);
  		}
  	});

};

