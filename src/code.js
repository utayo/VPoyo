var project;

var init = function(){
	project = document.getElementById("project");
	var t = document.getElementById("tb");

	console.log("success");
}

var tool_bar_visible = function(){
	var toolBar = document.getElementById("tool_bar");
	var v;
	if(toolBar.style.visibility=="visible")v="hidden";
	else v="visible";
	toolBar.style.visibility=v;
}

var tool_bar_switch = function(name){
	if(name=="new"){
		console.log("Tool Bar Switch for New");
	}else if(name=="assign"){
		console.log("Tool Bar Switch for Assign");
	}else if(name=="other"){
		console.log("Tool Bar Switch for Other");
	}else{
		console.log("Error::"+name+" is not Exist...");
	}
}

init();
