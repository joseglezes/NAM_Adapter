/**
 *    File:         NAMadapter.js
 *
 *    Authors:      Luis Fernando Garcia 
 *		    Jose Gonzalez
 *                  Universidad Politéctica de Madrid (UPM)
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
 *        Copyright (c) 2003-2008, Universidad Politécnica de Madrid (UPM)
 * 
 *                              All rights reserved.
 * 
 *     * Redistribution in binary form must reproduce the above copyright notice,
 *       this list of conditions and the following disclaimer in the documentation
 *       and/or other materials provided with the distribution.
 * 
 *    *  Neither the name of Universidad Politécnica de Madrid nor the names of its 
 *       contributors may be used to endorse or promote products derived from this 
 *       software without explicit prior written permission.
 * 
 * You are under no obligation whatsoever to provide any enhancements to Universidad 
 * Politécnica de Madrid,or its contributors.  If you choose to provide your enhance-
 * ments, or if you choose to otherwise publish or distribute your enhancement, in 
 * source code form without contemporaneously requiring end users to enter into a 
 * separate written license agreement for such enhancements, then you thereby grant 
 * Universidad Politécnica de Madrid, its contributors, and its members a non-exclusive, 
 * royalty-free, perpetual license to copy, display, install, use, modify, prepare 
 * derivative works, incorporate into the software or other computer software, dis-
 * tribute, and sublicense your enhancements or derivative works thereof, in binary 
 * and source code form.
 * 
 * DISCLAIMER - THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * “AS IS” AND WITH ALL FAULTS.  THE UNIVERSIDAD POLITECNICA DE MADRID, ITS CONTRI-
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

/**
 * NAM-XIFI
 * Module dependencies.
 */


var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , sessionController = require('./routes/session_controller.js') 
  , userController = require('./routes/user_controller.js')
  , partials = require ('express-partials')
  , config = require('./config/config.json')
  , commandController = require('./routes/command_controller.js')
  , pingctl = require('./routes/ping_controller.js')
  , bdwControler = require('./routes/bdw_controller.js')
  , owdControler = require('./routes/owd_controller.js')
  , plossControler = require('./routes/ploss_controller.js')
  , onDemandControler = require('./routes/onDemand_controller.js')
  , schedule = require('./routes/schedule_controller.js')
  , auth = require('./routes/authToken_controller.js')
  , mongoose = require('mongoose')
  , superagent = require('superagent')
  , logger = require('./logger')
  , nconf = require('nconf');


//
// Setup nconf to use (in-order):
//   1. Command-line arguments
//   2. Environment variables
//   3. A file located at './config/config.json'
//
nconf.argv()
     .env()
     .file({ file: __dirname +'/config/config.json' });


process.on('uncaughtException', function (err) {
	  logger.info('Caught exception: ' + err);
});


//Expose version through `pkginfo`

require('pkginfo')(module, 'version');


// Try to load the nam_adapter file `config.js` from the specified location.

try {
	logger.config.loadSync();
}
catch (ex) { }


var app = express();
var util = require('util');

// all environments

app.set('port', process.env.PORT || config.port_NAM_Adapter);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(partials());
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('perfsonarPASS'));
app.use(express.session());
    app.use(require('connect-flash')());

    // Helper dinamico:
    app.use(function(req, res, next) {
        // req.flash() 
        res.locals.flash = function() { return req.flash() };
        res.locals.session = req.session;
        next();
    });

app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));


app.use(function(err, req, res, next) {
	if (util.isError(err)) {
		next(err);
		} else {
			logger.info.error(err);
			req.flash('error', err);
			res.redirect('/');
		} 
	});

//development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
} else {
    app.use(express.errorHandler());
}



//connection database mongodb
mongoose.connect('mongodb://localhost/NAM_adapter', function(err, res) {
	  if(err) {
	    logger.error('ERROR: connecting to Database. ' + err);
	  } else {
	    logger.info('Connected to Database');
	  }
	  
});

var myToken = undefined;

/**
 * DB Modules 
 *
**/

routeTest = require('./routes/testshows')(app);
routeHostRegister = require('./routes/hosts')(app);
routeHostData = require('./routes/host_data')(app);
routeRegionRegister = require('./routes/regions')(app);
routeScheduledTest = require('./routes/scheduledMeasures')(app);


/**
 * 
 * Routes
 *
**/


// Config Routes


app.get('/login',  sessionController.new);
app.post('/login', sessionController.create);
app.get('/logout', sessionController.destroy);

app.get('/config/users/new', sessionController.requiresLogin,
			     userController.new);
app.get('/config/users', sessionController.requiresLogin,
			 userController.index);
app.delete('/config/users_all', sessionController.requiresLogin,
			    userController.delUsersAll);

app.get('/config/users/:id/edit', sessionController.requiresLogin,
			          userController.user);

app.post('/config/users', sessionController.requiresLogin,
			     userController.newUser);

app.put('/config/users/:id', sessionController.requiresLogin,
			     userController.updateUser);

app.get('/', routes.index);

app.get('/config', 
		sessionController.requiresLogin, 
		routes.config);

app.post('/config', 
		sessionController.requiresLogin, 
		routes.configChange);

app.get('/config/type/owd', 
		sessionController.requiresLogin, 
		routes.owd);
app.get('/config/:type', 
		sessionController.requiresLogin, 
		routes.scheduled);

app.get('/config/packetsloss', 
		sessionController.requiresLogin, 
		routes.packetsLoss);

app.get('/config/scheduled/:id', 
		sessionController.requiresLogin, 
		routes.editScheduled);
app.put('/config/scheduled/:id', 
		sessionController.requiresLogin, 
		routes.changeScheduled,
		routes.index);

app.post('/config/scheduled/new', 
		sessionController.requiresLogin, 
		routes.schedule_new,
		routes.index);



//Webservices - Routes  

	
//WS-Route - On-Demand Test
app.get('/monitoring/host2host/:typeTest/:regionIdS-:hostIdS;:regionIdD-:hostIdD',

	onDemandControler.requiresAvailableRegions, 
	onDemandControler.requiresAvailableHosts,
	onDemandControler.runTest
);


//WS-Route - BDW
app.get('/monitoring/bdw/:regionD-:hostD', 
		auth.authToken, 
		bdwControler.testbw);
app.get('/monitoring/bdw/:regionD:hostD/:regionS:hostS', 
		auth.authToken, 
		bdwControler.testbwSource);
app.get('/monitoring/iperf/:ipS?', bdwControler.iperf_server);


//WS-Route - OWD
app.get('/monitoring/owd/:regionD-:hostD', 
		auth.authToken, 
		owdControler.testowd);
app.get('/monitoring/owd/:regionD-:hostD/:regionS-:hostS', 
		auth.authToken, 
		owdControler.testOwdSource);
app.get('/monitoring/owdserver/:time', owdControler.owd_server);


//WS-Route - ping
app.get('/monitoring/ping/:addressHost/:format?/:count?', pingctl.ping);

//WS-Route - ploss - Packet Loss
app.get('/monitoring/ploss/:regionD-:hostD', 
		auth.authToken, 
		plossControler.testploss);
app.get('/monitoring/ploss/:regionD:hostD/:regionS:hostS', 
		auth.authToken, 
		plossControler.testplossSource);
app.get('/monitoring/ploss/iperf/:ipS?', plossControler.iperf_server);

//WS-Route - Schedule test

app.post('/monitoring/schedule/:regionIdS-:hostIdS',
		 
		schedule.requiresAvailableHosts,
		auth.authToken,
		schedule.schedule
	);


app.post('/monitoring/schedule', schedule.scheduleTest);
app.get('/monitoring/schedule/bdw/:regionD-:hostD', bdwControler.testbw);
app.get('/monitoring/schedule/owd/:regionD-:hostD', owdControler.testowd);

app.put('/monitoring/schedule/scheduleId', auth.authToken, schedule.killSchedule);


//save host data

//
// Set a pid variable on `nconf`.
//
nconf.set('pid', process.pid);

nconf.save();

userController.addUser("userxifi", "userxifi", "xifiMaster2014")


var host_data = {
	  	  hostId: config.hostId,
	  	  regionId: config.regionId,
	  	  type: "vm",
	  	  ipAddress: config.ip_address.public_ip,
	  	  ip_address: config.ip_address,

	  	  port_NAM: config.port_NAM_Adapter,
	  	  packetLoss_status: config.packetLoss_status,
	  	  bdw_status: config.bdw_status,
	  	  owd_status: config.owd_status,
	  	  BDW_endpoint_dest_schedule: [ config.bdw_endpoint_default ],

	  	  OWD_endpoint_dest_schedule: [ config.owd_endpoint_default ]
	  		
	  };

// deleting all Active Scheduled Measures.
deleteAllActiveScheduled();
//Update Host Data from config file.
findAndUpdateHostData(host_data)


//Authentication IDM


logger.info(host_data)

auth.authenticate (function (status, resp) {

    myToken = JSON.parse(resp).access.token;

    logger.info('Success authenticating NAM. NAM Auth-token: ', myToken);
    
  //Auto-Register Host

    auth.authenticate_user (function (status, resp) {

        var token = JSON.parse(resp).access.token.id;

        logger.info('Success authenticating user. Auth-token: ', token);
        
        superagent.post(config.NAMFederationDatabase + '/regions/')
        .set('X-Auth-Token', token)
        .send({
        	"link": "http://138.4.47.33:3000/monitoring",
        	"id":   config.regionId
        			
        		
        })   
        .end(function(error,res){
        	if(!error){
        		//logger.info("Autoregister OK");
        	}else {
        		logger.error("Error: Autoregister fail, " + error);
        	}
          
        });
        
        superagent.post(config.NAMFederationDatabase + '/nam/hosts')
        .set('X-Auth-Token', token)
        .send(host_data)   
        .end(function(error,res){
        	
        	if(!error && res.statusCode==200){
        		
        		if(res.body.hostId){
        			logger.info("Autoregister OK");}
        		else {
        			logger.info(res.body);
        			logger.info("Host already exists in NAM DB")
        		}
        	}else {
        		
        		logger.error("Error: Autoregister fail, " + error);
        	}
          
        });  
        
        
    }, function (status, err) {
        logger.error('Error in keystone communication', err);
    });
      

    

}, function (status, e) {
    logger.error('Error in keystone communication', e);
});


//excecuting iperf server command - accepts tcp connections 

var command = 'iperf -f m -p ' + config.port_iperf_server + ' -s';

commandController.command_console(command);


//excecuting iperf server command - accepts udp connections

var command_u = 'iperf -f m -u -p ' + config.port_iperf_server + ' -s';

commandController.command_console(command_u);


http.createServer(app).listen(app.get('port'), function(){
  logger.info('NAM Adapter server listening on port ' + app.get('port'));
});

