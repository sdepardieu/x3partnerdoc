﻿/* SAGE - modified version of cookies directive script */
/* Cookies Directive - The rewrite. Now a jQuery plugin
 * Version: 2.0.1
 * Author: Ollie Phillips
 * 24 October 2013
 */

	
	
;(function($) {
	$.cookiesDirective = function(options) {
			
		// Default Cookies Directive Settings
		var settings = $.extend({
			//Options
			explicitConsent: false,
			position: 'bottom',
			duration: 15,
			limit: 0,
			message: null,				
			cookieScripts: null,
			/* SAGE - URL for policy */
			privacyPolicyUri: 'https://www.sage.com/en-gb/legal/privacy-and-cookies/',
			scriptWrapper: function(){},	
			// Styling
			fontFamily: 'Sage UI,Arial,Helvetica,sans-serif',
			fontColor: '#ffffff',
			fontSize: '1em',
			backgroundColor: '#000000',
			backgroundOpacity: '95',
			linkColor: '#ffffff',
			/* SAGE - added new settings below */
			sageMessageText: 'We use cookies on our website to provide you with the best experience. If you continue browsing, you are consenting to our use of these cookies, but if you would like to know more, including how you can change your settings, take a look at our ',
			sageLinkText: 'Privacy Notice.',
			sageButtonText: 'Accept and Close',
			sageButtonStyle: 'font-family: Sage UI,Arial,Helvetica,sans-serif; font-weight: 500; background: #007E45; color: #ffffff; border: 2px solid #007E45; padding: 8px 16px 8px 16px; border-radius: 32px; cursor: pointer; cursor: hand;'
			/* SAGE - end section */
		}, options);
		
		// Perform consent checks
		if(!getCookie('SageHelpcookiesDirective')) {
			/* SAGE - changed cookie name so it's unique */
			if(settings.limit > 0) {
				// Display limit in force, record the view
				if(!getCookie('cookiesDisclosureCount')) {
					setCookie('cookiesDisclosureCount',1,1);		
				} else {
					var disclosureCount = getCookie('cookiesDisclosureCount');
					disclosureCount ++;
					setCookie('cookiesDisclosureCount',disclosureCount,1);
				}
				
				// Have we reached the display limit, if not make disclosure
				if(settings.limit >= getCookie('cookiesDisclosureCount')) {
					disclosure(settings);		
				}
			} else {
				// No display limit
				disclosure(settings);
			}		
			
			// If we don't require explicit consent, load up our script wrapping function
			if(!settings.explicitConsent) {
				settings.scriptWrapper.call();
			}	
		} else {
			// Cookies accepted, load script wrapping function
			settings.scriptWrapper.call();
		}		
	};
	
	// Used to load external javascript files into the DOM
	$.cookiesDirective.loadScript = function(options) {
		var settings = $.extend({
			uri: 		'', 
			appendTo: 	'body'
		}, options);	
		
		var elementId = String(settings.appendTo);
		var sA = document.createElement("script");
		sA.src = settings.uri;
		sA.type = "text/javascript";
		sA.onload = sA.onreadystatechange = function() {
			if ((!sA.readyState || sA.readyState == "loaded" || sA.readyState == "complete")) {
				return;
			} 	
		}
		switch(settings.appendTo) {
			case 'head':			
				$('head').append(sA);
			  	break;
			case 'body':
				$('body').append(sA);
			  	break;
			default: 
				$('#' + elementId).append(sA);
		}
	}	 
	
	// Helper scripts
	// Get cookie
	var getCookie = function(name) {
		var nameEQ = name + "=";
		var ca = document.cookie.split(';');
		for(var i=0;i < ca.length;i++) {
			var c = ca[i];
			while (c.charAt(0)==' ') c = c.substring(1,c.length);
			if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
		}
		return null;
	}
	
	// Set cookie
	var setCookie = function(name,value,days) {
		if (days) {
			var date = new Date();
			date.setTime(date.getTime()+(days*24*60*60*1000));
			var expires = "; expires="+date.toGMTString();
		}
		else var expires = "";
		/* document.cookie = name+"="+value+expires+"; path=/ ;"; */ 
		/* SAGE - Use for HTTP only */
		document.cookie = name+"="+value+expires+"; path=/ ; SameSite=None; Secure;";
		/* SAGE - Use for HTTPS only */
	}
	
	// Detect IE < 9
	var checkIE = function(){
		var version;
		if (navigator.appName == 'Microsoft Internet Explorer') {
	        var ua = navigator.userAgent;
	        var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
	        if (re.exec(ua) != null) {
	            version = parseFloat(RegExp.$1);
			}	
			if (version <= 8.0) {
				return true;
			} else {
				if(version == 9.0) {
					if(document.compatMode == "BackCompat") {
						// IE9 in quirks mode won't run the script properly, set to emulate IE8	
						var mA = document.createElement("meta");
						mA.content = "IE=EmulateIE8";				
						document.getElementsByTagName('head')[0].appendChild(mA);
						return true;
					} else {
						return false;
					}
				}	
				return false;
			}		
	    } else {
			return false;
		}
	}

	// Disclosure routines
	var disclosure = function(options) {
		var settings = options;
		settings.css = 'fixed';
		
		// IE 9 and lower has issues with position:fixed, either out the box or in compatibility mode - fix that
		if(checkIE()) {
			settings.position = 'top';
			settings.css = 'absolute';
		}
		
		// Any cookie setting scripts to disclose
		var scriptsDisclosure = '';
		if (settings.cookieScripts) {
			var scripts = settings.cookieScripts.split(',');
			var scriptsCount = scripts.length;
			var scriptDisclosureTxt = '';
			if(scriptsCount>1) {
				for(var t=0; t < scriptsCount - 1; t++) {
					 scriptDisclosureTxt += scripts[t] + ', ';	
				}	
				scriptsDisclosure = ' We use ' +  scriptDisclosureTxt.substring(0,  scriptDisclosureTxt.length - 2) + ' and ' + scripts[scriptsCount - 1] + ' scripts, which all set cookies. ';
			} else {
				scriptsDisclosure = ' We use a ' + scripts[0] + ' script which sets cookies.';		
			}
		} 
		
		// Create overlay, vary the disclosure based on explicit/implied consent
		// Set our disclosure/message if one not supplied
		var html = ''; 
		html += '<div id="epd">';
		html += '<div id="cookiesdirective" style="position:'+ settings.css +';'+ settings.position + ':-300px;left:0px;width:100%;'		
		html += 'height:auto;background:' + settings.backgroundColor + ';opacity:.' + settings.backgroundOpacity + ';';
		html += '-ms-filter: “alpha(opacity=' + settings.backgroundOpacity + ')”; filter: alpha(opacity=' + settings.backgroundOpacity + ');';
		html += '-khtml-opacity: .' + settings.backgroundOpacity + '; -moz-opacity: .' + settings.backgroundOpacity + ';';
		html += 'color:' + settings.fontColor + ';font-family:' + settings.fontFamily + ';font-size:' + settings.fontSize + ';';
		html += 'text-align:center;z-index:1000;">';
		/* SAGE - updated this style */
		/* 
		html += '<div style="position:relative;height:auto;width:90%;padding:10px;margin-left:auto;margin-right:auto;">';
		*/
		html += '<div style="position:relative;height:auto;width:90%;max-width: 60rem;padding:10px;margin-left:auto;margin-right:auto;">';
			
		if(!settings.message) {
			if(settings.explicitConsent) {
				// Explicit consent message
				settings.message = 'This site uses cookies. Some of the cookies we ';
				settings.message += 'use are essential for parts of the site to operate and have already been set.';
			} else {
				// Implied consent message
				/* SAGE - removed default message */
				/* 
				settings.message = 'We have placed cookies on your computer to help make this website better.'; 
				*/
				settings.message = '';
				/* SAGE - end section */
			}		
		}	
		html += settings.message;
		
		// Build the rest of the disclosure for implied and explicit consent
		if(settings.explicitConsent) {
			// Explicit consent disclosure
			html += scriptsDisclosure + 'You may delete and block all cookies from this site, but parts of the site will not work.';
			html += 'To find out more about cookies on this website, see our <a style="color:'+ settings.linkColor + ';font-weight:bold;';
			html += 'font-family:' + settings.fontFamily + ';font-size:' + settings.fontSize + ';" href="'+ settings.privacyPolicyUri + '" target="_blank">privacy policy</a>.<br/>';
			html += '<div id="epdnotick" style="color:#ca0000;display:none;margin:2px;"><span style="background:#cecece;padding:2px;">You must tick the "I accept cookies from this site" box to accept</span></div>'
			html += '<div style="margin-top:5px;">I accept cookies from this site <input type="checkbox" name="epdagree" id="epdagree" />&nbsp;';
			html += '<input type="submit" name="explicitsubmit" id="explicitsubmit" value="Continue"/><br/></div></div>';
		
		} else {
			// Implied consent disclosure
			/*
			html += scriptsDisclosure + ' More details can be found in our <a style="color:'+ settings.linkColor + ';';
			html += 'font-weight:bold;font-family:' + settings.fontFamily + ';font-size:' + settings.fontSize + ';" href="'+ settings.privacyPolicyUri + '">privacy policy</a>.';
			html += '<div style="margin-top:5px;"><input type="submit" name="impliedsubmit" id="impliedsubmit" value="Do not show this message again"/></div></div>';	
			*/

			/* SAGE - replaced message section (above) with below  */
			html += scriptsDisclosure + settings.sageMessageText + '<a style="color:'+ settings.linkColor + ';';
			html += 'font-weight:500;font-family:' + settings.fontFamily + ';font-size:' + settings.fontSize + ';" href="'+ settings.privacyPolicyUri + '"  target="_blank">' + settings.sageLinkText +'</a> ';
			html += '<div style="display:inline-block; margin-left: 20px; margin-top: 8px;"><input type="submit" name="impliedsubmit" id="impliedsubmit" value="' + settings.sageButtonText + '" style="' + settings.sageButtonStyle + '"></div></div>';
			/* SAGE - end section */
			
		}		
		html += '</div></div>';
		$('body').append(html);
		
		// Serve the disclosure, and be smarter about branching
		var dp = settings.position.toLowerCase();
		if(dp != 'top' && dp!= 'bottom') {
			dp = 'top';
		}	
		var opts = new Array();
		if(dp == 'top') {
			opts['in'] = {'top':'0'};
			opts['out'] = {'top':'-300'};
		} else {
			opts['in'] = {'bottom':'0'};
			opts['out'] = {'bottom':'-300'};
		}		

		// Start animation
		$('#cookiesdirective').animate(opts['in'], 1000, function() {
			// Set event handlers depending on type of disclosure
			if(settings.explicitConsent) {
				// Explicit, need to check a box and click a button
				$('#explicitsubmit').click(function() {
					if($('#epdagree').is(':checked')) {	
						// Set a cookie to prevent this being displayed again
						setCookie('SageHelpcookiesDirective',1,365);
						/* SAGE - changed cookie name so it's unique */
						// Close the overlay
						$('#cookiesdirective').animate(opts['out'],1000,function() { 
							// Remove the elements from the DOM and reload page
							$('#cookiesdirective').remove();
							location.reload(true);
						});
					} else {
						// We need the box checked we want "explicit consent", display message
						$('#epdnotick').css('display', 'block'); 
					}	
				});
			} else {
				// Implied consent, just a button to close it
				$('#impliedsubmit').click(function() {
					// Set a cookie to prevent this being displayed again
					setCookie('SageHelpcookiesDirective',1,365);	
					/* SAGE - changed cookie name so it's unique */				
					// Close the overlay
					$('#cookiesdirective').animate(opts['out'],1000,function() { 
						// Remove the elements from the DOM and reload page
						$('#cookiesdirective').remove();
					});
				});
			}	
			
			// Set a timer to remove the warning after 'settings.duration' seconds
			setTimeout(function(){
				$('#cookiesdirective').animate({
					opacity:'0'
				},2000, function(){
					$('#cookiesdirective').css(dp,'-300px');
				});
			}, settings.duration * 1000);
		});	
	}
})(jQuery);