/**
 *    File:         routes/regions.js
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

var logger = require('../logger.js');

module.exports = function(app) {

  var regions = require('../models/regions.js');

  
  //GET - Return all region in the DB
  findAllregions = function(req, res) {
  	regions.find({},{_id:0},function(err, regionss) {
  		if(!err) {
  			
  			//logger.info(JSON.stringify(regionss))
        	
  			res.json(regionss);
  		} else {
  			logger.info('ERROR: ' + err);
  		}
  	});
  };

  //GET - Return a region with specified ID
  findById = function(req, res) {
  	regions.find({id : req.params.id}, function(err, regions) {
  		if(!err) {
        
  			res.send(regions);
  		} else {
  			logger.info('ERROR: ' + err);
  			res.send('ERROR: ' + err);
  		}
  	});
  };

  //POST - Insert a new region in the DB 	
  	addregion = function(req, res) {
  	  	//logger.info('POST');
  	  	//logger.info(req.body);
  	  	
  	  	regions.find({ id: req.body.id},function(err, regionid) {
  	  		if(!err) {
  	  			//logger.info(regionid.length);
  	  			if(regionid.length==0){
  	  			  	var regionnew = new regions({
  	  			  		id:			req.body.id,
  	  			  		_link:	{ self: { href: req.body.link}}	
  	  			  		
  	  			  
  	  			  	});
  	  			  
  	  			  	regionnew.save(function(err) {
  	  					if(!err) {
  	  					  	logger.info('Region recorded');
  	  					} else {
  	  					  		logger.info('ERROR: ' + err);
  	  					}
  	  				});

  	  			  	res.send(regionnew);
  	  				
  	  			}else{
  	  				res.send("ERROR: Region already exists");
  	  			}
  	  		} else {
  	  			logger.info('ERROR: ' + err);
  	  		}
  	  	});
  	  	
  	  	



  	  };
  	
  	
  	
  //PUT - Update a register already exists
  updateregion = function(req, res) {
  	regions.findById(req.params.id, function(err, regions) {
  		
  		regions.idregion		=	req.body.idregion;
  		regions.domain		=	req.body.domain;
  		regions.type		=	req.body.type;
  		regions.date		=	req.body.date;
  		regions.time		=	req.body.time;
  		regions.hostSource	=	req.body.hostSource;
  		regions.hostDestination=req.body.hostDestination;
  		regions.result		=	req.body.result;

  		tetshow.save(function(err) {
  			if(!err) {
  				logger.info('Updated');
  			} else {
  				logger.info('ERROR: ' + err);
  			}
  			res.send(regions);
  		});
  	});
  }

  //DELETE - Delete a region with specified ID
  deleteregion = function(req, res) {
	  	logger.info('delete');
  		regions.findById(req.params.id, function(err, regions) {
  			if(regions!=null){
  			regions.remove(function(err) {
  				if(!err) {
  					logger.info('Removed');
  					res.send('Removed');
  				} else {
  					logger.info('ERROR: ' + err);
  					next(err);
  				}
  			});
  			}else{
  				res.send('Id not found');
  			}
  		
  	});

  };
  
  //DELETE - Delete all region 
  delregionAll = function(req, res) {
	  regions.remove(function(err) {
  				if(!err) {
  					logger.info('Removed BD');
  					res.send('Removed');
  				} else {
  					logger.info('ERROR: ' + err);
  					next(err);
  				}
  	

	  });
  };

  //Link routes and functions
  app.get('/monitoring/regions', findAllregions);
  app.get('/monitoring/regions/:id', findById);
  app.post('/monitoring/regions', addregion);
  app.put('/monitoring/regions/:id', updateregion);
  app.delete('/monitoring/regions/:id', deleteregion);
  app.delete('/monitoring/regions_all', delregionAll);

}