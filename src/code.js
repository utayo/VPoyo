var project;
var tool_bar_opened = "new";
var selected_line_num;

var lines = [];
var variables;

var line = function(_number,_kind,_name,_value){
	this.number = _number;
	this.name = _name;
	this.kind = _kind;
	if(_kind=="Var"){
		this.var_value = new variable(_name);
		variables[_name] = this.var_value;
	}else if(_kind=="Assign"){
		if(_value){
			this.var_value = variables[_name];
			this.assign_value = _value;
			if(_value!="BEFORE_ASSIGN")
				this.struct = new struct(_value);
		}else{
			console.log("please insert assign value...");
			window.alert("please insert assign value...");
		}
	}
}

var struct = function(value){
	//	文字列を演算子で分割し、各要素に分けて保存する
	var contents = [];
	var str0 = [];
	var str = String(value);
	str = str.split("+");
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
	this.type = undefined;
}

var add_new_line = function(kind,name,value){
	if(name){
		var l = lines.length;
		if(variables[name]===undefined){
			if(kind=="Var"){
				lines[l] = new line(l,kind,name,null);
				add_new_lineView(lines[l].number,"NEW_VARIABLE",name);
				document.f.new_var.value= "";
				add_all_lineView();
			}
			console.log(lines);
		}else{
			if(kind=="Assign"){
				lines[l] = new line(l,kind,name,value);
				if(value!="BEFORE_ASSIGN"){
					add_new_lineView(lines[l].number,"ASSIGN_VARIABLE",name);
				}else{
					add_new_lineView(lines[l].number,"BEFORE_ASSIGN",name);
				}
				add_all_lineView();
			}else{
				window.alert(name + " is already exist...");
				console.log(name+" is already exist...");
			}
		}
	}else{
		window.alert("Please insert variable name...");
		console.log("please insert variable name...");
	}
	selected_line_num = -1;
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

var add_expression = function(){
	var v = document.f.assign_value;
	var opr = document.getElementById("opr").value;
	var n = document.getElementById("selector").value;
	v.value += opr + n;
	console.log(v.value);
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

var add_all_lineView = function(){
	var structArea = document.getElementById("struct_area");
	var children = structArea.childNodes;
	while(structArea.firstChild){
		structArea.removeChild(structArea.firstChild);
	}
	for(var prop in lines){
		if(lines[prop].kind=="Var"){
			add_new_lineView(lines[prop].number,"NEW_VARIABLE",lines[prop].name);
		}else if(lines[prop].kind=="Assign"){
			console.log(lines[prop.value]);
			add_new_lineView(lines[prop].number,"ASSIGN_VARIABLE",lines[prop].name);
		}
	}
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

	var str;

	if(value=="NEW_VARIABLE"){
		str = " : new variable";
		all_add_selector(name);	//test code;
	}else if(lines[number].assign_value=="BEFORE_ASSIGN"){
		str = " = Empty!";
	}else if(value=="ASSIGN_VARIABLE"){
		str = " = " + lines[number].assign_value;
	}

	str = name + str;
	lineStruct.innerHTML = str;
	line.appendChild(lineStruct);

	struct.appendChild(line);

	line.addEventListener("click", function(){select_line(number,name,line)},false);
}

var all_add_selector = function(){
	//	セレクターを全削除してからvariablesの中身を追加
	var selector = document.getElementById("assign_var_selector");
	while(selector.firstChild){
		selector.removeChild(selector.firstChild);
	}
	for(var prop in variables){
		var new_option = document.createElement("option");
		new_option.innerHTML = variables[prop].name;
		new_option.setAttribute("value",variables[prop].name);
		selector.appendChild(new_option);
	}
}

var add_selector = function(name){
	var selector = document.getElementById("assign_var_selector");
	add_option(selector,name);
}

var add_option = function(node,option){
	var new_option = document.createElement("option");
	new_option.innerHTML = option;
	new_option.setAttribute("value",option);
	node.appendChild(new_option);
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
		tool_bar_switch('new');
		delete_button_change('stop');
	}else{
		if(selected_line_num==-1){
			//	ラインが選択されていない状態
			console.log(number + " is selected.");
			var el = document.querySelector(".line_selected");
			if(el!=null)el.className = "line";
			selected_line_num = number;
			line_area.className = "line_selected";
			tool_bar_switch('assign');
			delete_button_change('active');
		}else{
			//	ほかのラインが選択されている状態（入れ替え）
			line_change(number,selected_line_num);
			selected_line_num = -1;
			tool_bar_switch('new');
			delete_button_change('stop');
		}
	}
}

var line_change = function(n,n0){
	console.log(lines[n]);
	console.log(lines[n0]);
	var tmp = lines[n];
	lines[n] = lines[n0];
	lines[n].number = n;
	lines[n0] = tmp;
	lines[n0].number = n0;


	add_all_lineView();
}

var tb_new_var = function(){
	var nv = document.getElementById("new_var");
	var txt = nv.querySelector(".tool_text");
	var ipt = nv.querySelector(".tool_input");

	if(txt.style.display=="none"){
		txt.style.display = "block";
		ipt.style.display = "none";
	}else {
		ipt.querySelector("input").value = "";
		txt.style.display = "none";
		ipt.style.display = "block";
	}
}

var tb_new_assign = function(){
	var hoge = document.getElementById("assign_new_var");
	var txt = hoge.querySelector(".tool_text");
	var selector = hoge.querySelector(".assign_selector");

	if(txt.style.display=="none"){
		txt.style.display = "block";
		selector.style.display = "none";
	}else {
		txt.style.display = "none";
		selector.style.display = "block";
	}
}

var tb_fixed_num = function(){
	var hoge = document.getElementById("assign_num");
	var txt = hoge.querySelector(".tool_text");
	var input = hoge.querySelector(".tool_input");

	if(txt.style.display=="none"){
		txt.style.display = "block";
		input.style.display = "none";
	}else {
		txt.style.display = "none";
		input.style.display = "block";
	}
}

var tb_fixed_str = function(){
	var hoge = document.getElementById("assign_str");
	var txt = hoge.querySelector(".tool_text");
	var input = hoge.querySelector(".tool_input");

	if(txt.style.display=="none"){
		txt.style.display = "block";
		input.style.display = "none";
	}else {
		txt.style.display = "none";
		input.style.display = "block";
	}
}

var make_new_assign_line = function(){
	var div = document.getElementById("assign_new_var");
	var selector = div.querySelector("select");
	var left_var = selector.value;
	if(left_var!="NO_VARIABLES"){
		add_new_line("Assign",left_var,"BEFORE_ASSIGN");
		tb_new_assign();
	}
}

var remake_assign_line = function(value){
	var l = selected_line_num;
	if(l!=-1){
		if(lines[l].kind=="Var"){
			var name = lines[l].name;
			add_new_line("Assign",name,"BEOFRE_ASSIGN");
			tb_new_assign();
			l = lines.length-1;
		}	
		var selected_line = lines[l];
		console.log(selected_line);
		lines[l].struct = new struct(value);
		lines[l].assign_value = value;
		lines[l].var_value.type = "Number";
		selected_line_num = -1;
		delete_button_change('stop');
		add_all_lineView();
	}else{
		window.alert("Please Select Line...");
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

var tb_make_new_var = function(e){
	if(!e)
		var e = window.event;
	if(e.keyCode==13){
		new_var_hoge();
	}
}

var new_var_hoge = function(){
	var tbNewVar = document.getElementById("new_var");
	add_new_line('Var',tbNewVar.querySelector("input").value,null);
	tb_new_var();
	add_all_lineView();
}

var tb_assign_fixed_num = function(e){
	if(!e)
		var e = window.event;
	if(e.keyCode==13){
		assign_fixed_hoge();
	}
}

var assign_fixed_hoge = function(){
	var div = document.getElementById("assign_num");
		var num = div.querySelector('input').value;
		if(isNaN(num)){
			window.alert(num+" is not Number...");
		}else{
			num = parseFloat(num);
			remake_assign_line(num);
			div.querySelector('input').value = "";
		}
}

var delete_button_change = function(hoge){
	var dButton = document.getElementById("delete_button");
	dButton.className = hoge;
}

var delete_line = function(){
	if(document.getElementById("delete_button").className=='active'){
		var l = selected_line_num;
		lines.splice(l);
		selected_line_num = -1;
		add_all_lineView();
		document.getElementById("delete_button").className = 'stop';
	}
}



var make_code = function(){
	console.log(lines);
	var code = "";
	for(var prop in lines){
		var l = lines[prop];
		if(l.kind=="Var"){
			code += "var " + l.name + ";</br>";
		}else if(l.kind=="Assign"){
			code += l.name + "=" + l.assign_value + ";</br>";
		}
	}
	var storage = sessionStorage;
	storage.setItem('code',code);

	var x = window.open("script.html","");
}

var put_code = function(){
	var storage = sessionStorage;
	var code = storage.getItem('code');
	document.getElementById("code_area").innerHTML = code;
}


init();
