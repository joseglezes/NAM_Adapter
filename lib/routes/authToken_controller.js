/**
 *    File:         routes/OnDemand_controller.js
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


var config = require('../config/config.js');
var superagent = require('superagent');
var proxy = require('../HTTPClient.js');
var logger = require('../logger.js');

var myToken = undefined;

exports.authToken = function (req, res, next) {
	var auth_token = req.headers['x-auth-token'];
	//console.log("token")
	//console.log(auth_token)
	
    if ((auth_token === undefined || auth_token == "" )&& req.headers['authorization'] !== undefined) {
        auth_token = atob(req.headers['authorization'].split(' ')[1]);
    }

	if (auth_token === undefined || auth_token == "") {
        console.log('Auth-token not found in request header');
        var auth_header = 'IDM uri = ' + config.account_host;
        res.set('WWW-Authenticate', auth_header);
		res.send(401, 'Auth-token not found in request header');
	} else {

				
		checkToken(auth_token, function (status, resp) {

            var userInfo = JSON.parse(resp);
            console.log('Access-token OK.');

            req.headers['X-Nick-Name'] = userInfo.nickName;
            req.headers['X-Display-Name'] = userInfo.displayName;
            
			next();

		}, function (status, e) {
			console.log("status")
			if (status === 404) {
                console.log('User access-token not authorized');
                res.send(401, 'User token not authorized');
            } else {
                console.log('Error in IDM communication ', e);
                res.send(503, 'Error in IDM communication');
            }
		});
	}
};

var checkToken = function(token, callback, callbackError) {

	
    var options = {
        host: config.keystone_host,
        port: config.keystone_port,
        path: '/v2.0/access-tokens/' + token,
        method: 'GET',
        headers: {'X-Auth-Token': myToken, 'Accept': 'application/json'}
    };
    
    //console.log(options)
    proxy.sendData('http', options, undefined, undefined, callback, function (status, e) {
    	//console.log(status);
        if (status === 401) {

            //console.log('Error validating token. Proxy not authorized in keystone. Keystone authentication ...');   
            authenticate (function (status, resp) {

                myToken = JSON.parse(resp).access.token.id;

                //console.log('Success authenticating. Auth-token: ', myToken);
                checkToken(token, callback, callbackError);

            }, function (status, e) {
                console.log('Error in IDM communication ', e);
                callbackError(503, 'Error in IDM communication');
            });
        } else {
            callbackError(status, e);
        }
    });
};

var authenticate = function(callback, callbackError) {

    var options = {
        host: config.keystone_host,
        port: config.keystone_port,
        path: '/v2.0/tokens',
        method: 'POST',
        headers: {}
    };
    var body = {auth: {passwordCredentials: {username: config.username, password: config.password}}}
    proxy.sendData('http', options, JSON.stringify(body), undefined, callback, callbackError);
};

var authenticate_user = function(callback, callbackError) {

    var options = {
        host: config.keystone_host,
        port: config.keystone_port,
        path: '/v2.0/tokens',
        method: 'POST',
        headers: {}
    };
    var body = {auth: {passwordCredentials: {username: config.userIDM, password: config.passIDM}}}
    proxy.sendData('http', options, JSON.stringify(body), undefined, callback, callbackError);
};

exports.checkToken = checkToken;
exports.authenticate = authenticate;
exports.authenticate_user = authenticate_user;