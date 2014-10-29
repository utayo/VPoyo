var project;
var tool_bar_opened = "new";

var init = function(){
	project = document.getElementById("project");
	var t = document.getElementById("tb");

	console.log("success");
}

var tbn = function(name){
	return "tool_bar_"+name;
}

var tool_bar_visible = function(){
	var toolBar = document.getElementById("tool_bar");
	var v;
	console.log(toolBar.style.display);
	if(toolBar.style.display=="block") v="none";
	else v="block";
	toolBar.style.display=v;
	document.getElementById(tbn(tool_bar_opened)).style.display=v;
}

var tool_bar_switch = function(name){
	if(name==tool_bar_opened){
		console.log(name+" is already opened...");
		return 0;
	}else if(name=="new"){
		console.log("Tool Bar Switch for New");
	}else if(name=="assign"){
		console.log("Tool Bar Switch for Assign");
	}else if(name=="other"){
		console.log("Tool Bar Switch for Other");
	}else{
		console.log("Error::"+name+" is not Exist...");
		return -1;
	}
	document.getElementById("tool_bar_"+name).style.display="block";
	document.getElementById("tool_bar_"+tool_bar_opened).style.display="none";
	tool_bar_opened = name;
}

var add_new_line = function(){
	var struct = document.getElementById("struct_area");
	var line = document.createElement("div");
	line.className = "line";
	var lineNum = document.createElement("div");
	lineNum.innerHTML = "N";
	lineNum.className = "line_number";
	line.appendChild(lineNum);
	var lineStruct = document.createElement("div");
	lineStruct.className = "line_struct";
	lineStruct.innerHTML = "added line";
	line.appendChild(lineStruct);

	struct.appendChild(line);
}

init();
