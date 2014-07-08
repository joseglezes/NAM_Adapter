/**
 *    File:         config/js
 *
 *    Author:       Luis Fernando Garcia 
 *    				Jose Gonzalez
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
 * config file
 */
/*

var config = {
		
//Host Identification
  federation : "XIFI",  	
  // Proceed to change this value for your concrete regionId:"Madrid",
  regionId : "Madrid",
  hostId:"192.168.1.134",
  
//Proceed to change this value for your concrete type machine: virtual machine (vm) or physical machine (phy) 
  type : "vm",

// IP addresses
//Proceed to change this value for your concrete IP addresses
  ip_address : {	
	  local_ip:"192.168.1.134",
	  public_ip:"192.192.168.1.134",
	  private_federation_ip:"10.0.1.3",
		 
  },  
  
// NAM parameters

  bdw_status:"true",
  owd_status:"true",
  packetLoss_status:"undefined",
  port_NAM_Adapter:"3000",
  
//Proceed to change this value for the iperf port that you want use.
  port_iperf_server:"5001",
  ntp_server : "hora.rediris.es",
  
//Proceed to change this value for your concrete NGSI 
  NGSIAdapter_url:"http://localhost:5005/",


// OWD Scheduler

  limit_scheduledTest : 6,


  owd_endpoint_default : {
		regionId: 	"Madrid",
		hostId: 	"192.168.1.134",
		frequency:  1,     
		// minutes
		type: "owd"
	},


// BDW Scheduler
	
	bdw_endpoint_default : {
		regionId: 	"Madrid",
		hostId: 	"192.168.1.134",
		frequency:  1,	
		// minutes
		
		type:  "bdw"
	},



//DB Global
//url access DB Regions, hosts and services NAM

	ls_global:"http://192.168.1.134:3000/monitoring",



// Others NAM parameters don't modify these parameters 

	account_host : 'https://account.lab.fi-ware.org',

	  keystone_host : 'cloud.lab.fi-ware.org',
	  keystone_port : 4731,

	  username : 'pepProxy',
	  password : 'pepProxy',
	  userIDM : 'NAMadapter',
	  passIDM : 'namadapter'
	  

};

module.exports = config;*/

module.exports = require("./config.json");





