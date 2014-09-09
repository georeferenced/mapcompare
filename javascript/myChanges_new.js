dojo.require("dijit.form.Select");
dojo.require("dijit.registry");
dojo.require("esri.map");
dojo.require("dojo.parser");   
	
var selOptsL = [], selOptsR = [];
var leftSelValue, rightSelValue;
var LoldMapConId, RoldMapConId;
var LWebMapID=3, RWebMapID=2;
	
	function init() {
		// assign map names to vars leftSelValue and rightSelValue
		$("loadingCon").show();
		j=0;
		dojo.forEach(myMapNames,function(item,i) {
				if (i==LWebMapID) {
				leftSelValue=myMapNames[i][0]; 
			}else if (i==RWebMapID) { 
				rightSelValue=myMapNames[i][0];
			};
			});
			
		// load configuration options for loading maps
		assignconfigOptions();
		
		// load dropbox options and map vars related to initial map selection 
		loadDropboxOptions();
		changeDropboxOptions("both","both");
		loadMapVars();
		$("loadingCon").hide();  
	}; 

	function loadDropboxOptions() {
		//create initial dropbox options
		var tempSelectArr=[selOptsL,selOptsR];
		for (var j = 0; j < 2; j++) {
		
			//change selectLR assignment depending on init load or new dropbox selection
			if (j==1) {var selectLR="R"; }else{var selectLR="L"; };
			// create dropbox option for each map
			for (var i = 0; i < myMapNames.length; i++) {
				tempSelectArr[j].push({
				label: myMapNames[i][0],
				value: myMapNames[i][0],
				id: "mySel"+selectLR+i
			  });
			};
		};
		//add left dropbox options to select on left side of screen
		var widget = dijit.byId("select0");
		widget.addOption(selOptsL);
		widget.setValue(leftSelValue);
		
		//add right dropbox options to select on right side of screen
		var widget2 = dijit.byId("select1");
		 widget2.addOption(selOptsR);
		 widget2.setValue(rightSelValue);
	};

	
	function changeDropboxOptions(userSelect,screenLR) { 
		
		// assign user selected value to correct var according to dropbox location (left or right)
		if (screenLR=="left") {
			leftSelValue=userSelect;
		}else if (screenLR=="right") {
			rightSelValue=userSelect;
		};
		
		// Change dropbox options as enabled or disabled according to user dropbox selection
		dojo.forEach(selOptsL,function(item, i) { 
			if (item.value==rightSelValue) {
				item.disabled=true;
			}else{  
				item.disabled=false;
			};
			if (item.value==leftSelValue) { item.selected=true;};
		});

		dojo.forEach(selOptsR,function(item, i) { 
			if (item.value==leftSelValue) {
				item.disabled=true;
			}else{  
				item.disabled=false;
			};
			if (item.value==rightSelValue) { item.selected="true";};	
		});	

		// update options on screen
		var widget = dijit.byId("select0");
		widget.updateOption(selOptsL);
		var widget2 = dijit.byId("select1");
		widget2.updateOption(selOptsR);
		dijit.byId('select0').set('displayedValue',leftSelValue);
	};

	function loadMapVars(){
		//assign relevant divs to jquery vars
		var tempCon0=$("#mapCon0"); 
		var tempCon1=$("#mapCon1"); 
		var tempCon2=$("#mapCon2");  
		var tempCon3=$("#mapCon3"); 
		var tempCon4=$("#mapCon4");  
		var tempLegTog=$("#legToggle0"); 
		var tempDesTog=$("#desToggle0"); 
		
		// return selected map divs and toggle divs to holding divs outside #mapcontainer
		if (LoldMapConId != undefined && RoldMapConId != undefined ) {
			$("#myToggles").append(tempLegTog).append(tempDesTog);
			$("#myMapContainers").append(eval("tempCon"+LoldMapConId)).append(eval("tempCon"+RoldMapConId));		
		};
		// move selected map and corresponding title divs and toggles to mapcontainer div for viewing on screen
		eval("tempCon"+LWebMapID).prependTo($("#mapPlace1"));
		eval("tempCon"+RWebMapID).prependTo($("#mapPlace2"));
		$("#mapDiv"+LWebMapID).prepend(tempLegTog).append(tempDesTog);

		$("#mapDiv"+LWebMapID).css('border','none');
		$("#legendCon"+LWebMapID).css('border','none');
		$("#descriptionCon"+LWebMapID).css('border','none');
		$("#leftCon").css('border','none');
		
		// set extent map for use in sync in map.js
		//tempExtentMap[0]=[$("map" + LWebMapID)];
		dijit.byId('mainWindow').resize();
		resizeMaps();
		};

	function updateScreen(dropbox,screenLR) {
		// assign selected values of both select boxes to vars
 		var tempLSelect=dijit.byId('select0').value; 
		var tempRSelect=dijit.byId('select1').value;
		
		//prevent firing code when no changes in dropbox values are made on initial page load
		if (leftSelValue==tempLSelect && rightSelValue==tempRSelect ) { 
			return; 
		}; 
		// assign user selected value (dropbox value that has changed) to var
		var userSelect=dijit.byId(dropbox).value;
		
		// change dropbox options and map vars related to change in map selection
		changeDropboxOptions(userSelect,screenLR);
		changeMapVars(dropbox,screenLR);
		loadMapVars();
	};

	function changeMapVars(dropbox,screenLR) {
		// identify previous dropbox selections
		LoldMapConId=LWebMapID;
		RoldMapConId=RWebMapID;
		// assign index number of previous selections 
		dojo.forEach(myMapNames, function (item,i) { 
			if (item[0]==leftSelValue) { LWebMapID=i; };
			if (item[0]==rightSelValue) { RWebMapID=i; };
		});
};