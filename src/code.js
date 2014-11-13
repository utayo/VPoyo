var project;
var tool_bar_opened = "new";
var selected_line_num;

var lines = [];
var variables;

var line = function(_number,_kind,_name,_value){
	this.number = _number;
	this.kind = _kind;
	if(_kind=="Var"){
		this.var_value = new variable(_name);
		variables[_name] = this.var_value;
	}else if(_kind=="Assign"){
		if(_value){
			this.var_value = variables[_name];
			this.assign_value = _value;
			this.struct = new struct(_value);
		}else{
			console.log("please insert assign value...");
		}
	}
}


var struct = function(value){
	var contents = [];
	var str0 = [];
	var str = value.split("+");
	for(var prop in str){
		if(prop!=0)
			contents[contents.length] = new operator("+");
		str[prop] = str[prop].split("-");
		console.log(str[prop]);
		for(var prop0 in str[prop]){
			if(prop0!=0){
				contents[contents.length] = new operator("-");
			}
			contents[contents.length] = new content(str[prop][prop0]);
			str0[str0.length] = str[prop][prop0];
		}
	}
	this.contents = contents;
	console.log(contents);
}

var content = function(value){
	var elements = [];
	var str = value.split("*");
	var str0 = [];
	for(var prop in str){
		if(prop!=0)
			elements[elements.length] = new operator("*");
		str[prop] = str[prop].split("/");
		for(var prop0 in str[prop]){
			if(prop0!=0)
				elements[elements.length] = new operator("/");
			elements[elements.length] = new element(str[prop][prop0]);
		}
	}
	this.elements = elements;
}

var element = function(value){
	this.element = value;
}

var operator = function(kind){
	this.operator = kind;
}

var variable = function(_name){
	this.name = _name;
	this.value = null;
}

var add_new_line = function(kind,name,value){
	if(name){
		var l = lines.length;
		if(variables[name]===undefined){
			if(kind=="Var"){
				lines[l] = new line(l,kind,name,null);
				add_new_lineView(lines[l].number,"NEW_VARIABLE",name);
			}
			console.log(lines);
		}else{
			if(kind=="Assign"){
				lines[l] = new line(l,kind,name,value);
				add_new_lineView(lines[l].number,"ASSIGN_VARIABLE",name);
			}else{
				console.log(name+" is already exist...");
			}
		}
	}else{
		console.log("please insert variable name...")
	}
}

var test_assign = function(){
	console.log("test assign function");
	var v = document.f.assign_value.value;
	var n = document.getElementById("selector").value;
	assign(n,v);
}

var assign = function(name,value){
	console.log(name + " = " + value + ";");
	add_new_line("Assign",name,value);
}

var init = function(){
	project = document.getElementById("project");
	var t = document.getElementById("tb");
	lines[0] = new line(0,"Start");
	selected_line_num = -1;
	variables = new Object();

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

var add_new_lineView = function(number,value,name){
	var struct = document.getElementById("struct_area");
	var line = document.createElement("div");
	line.className = "line";
	var lineNum = document.createElement("div");
	lineNum.innerHTML = number;
	lineNum.className = "line_number";
	line.appendChild(lineNum);
	var lineStruct = document.createElement("div");
	lineStruct.className = "line_struct";
	if(value=="NEW_VARIABLE"){
		value = " : new variable";
		add_selector(name);	//test code;
	}else if(value=="ASSIGN_VARIABLE"){
		console.log(lines[number]);
		value = " = " + lines[number].assign_value;
	}
	
	value = name + value;
	lineStruct.innerHTML = value;
	line.appendChild(lineStruct);

	struct.appendChild(line);

	line.addEventListener("click", function(){select_line(number,name,line)},false);
}

var add_selector = function(name){
	var selector = document.getElementById("selector");
	var new_option = document.createElement("option");
	new_option.innerHTML = name;
	new_option.setAttribute("value",name);
	selector.appendChild(new_option);
}

var add_test_line = function(){
	//add_new_lineView('N','added line');
	var name = document.f.new_var.value;
  add_new_line('Var',name,null);
}

var select_line = function(number,name,line_area){
	if(selected_line_num==number){
		console.log(number + " is deselected.");
		selected_line_num = -1;
		line_area.className = "line";
	}else{
		console.log(number + " is selected.");
		var el = document.querySelector(".line_selected");
		if(el!=null)el.className = "line";
		selected_line_num = number;
		line_area.className = "line_selected";
	}
}

var submitStop = function(e){
	if(!e){
		var e = window.event;
	}
	if(e.keyCode==13){
		return false;
	}
}


init();
