var project;
var tool_bar_opened = "new";
var selected_line_num;
var selected_var_name;
var selected_struct_num;
var dragged_area;
var dragged_fixed_value;
var serial_number;
var add_div;

var lines = [];
var variables;

var line = function(_number,_kind,_name,_value){
	this.number = _number;
	this.kind = _kind;
	if(_kind=="Var"){
		this.name = _name;
		this.var_value = new variable(_name);
		variables[_name] = this.var_value;
	}else if(_kind=="Assign"){
		this.name = _name;
		if(_value){
			this.var_value = variables[_name];
			this.assign_value = _value;
			this.type = null;
			if(_value!="BEFORE_ASSIGN")
				this.struct = new struct(_value);
		}else{
			console.log("please insert assign value...");
			window.alert("please insert assign value...");
		}
	}else if(_kind=="If"){
		this.condition = [];
		this.inner_lines = [];
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
		//console.log(str[prop]);
		for(var prop0 in str[prop]){
			if(prop0!=0){
				contents[contents.length] = new operator("-");
			}
			contents[contents.length] = new content(str[prop][prop0]);
			str0[str0.length] = str[prop][prop0];
		}
	}
	this.contents = contents;
	//console.log(contents);
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
	//this.type = undefined;
}

var add_new_line = function(kind,name,value){
	var l = lines.length;
	if(name){
		if(!variables[name]){
			if(kind=="Var"){
				lines[l] = new line(serial_number,kind,name,null);

				document.getElementById("new_var_input").value= "";
				serial_number++;
				add_all_lineView(add_div,lines);
			}
			//console.log(lines);
		}else{
			if(kind=="Assign"){
				lines[l] = new line(serial_number,kind,name,value);
				
				serial_number++;
				add_all_lineView(add_div,lines);
			}else{
				window.alert(name + " is already exist...");
				console.log(name+" is already exist...");
			}
		}
	}else{
		if(kind=="If"){
			if(selected_line_num==-1){
				lines[l] = new line(serial_number,kind,null,null);
				lines[l].inner_lines[0] = new line(0,"Start");
			}else{
				var parent = search_line(selected_line_num).inner_lines;
				parent[parent.length] = new line(serial_number,kind,null,null);
				parent[parent.length-1].inner_lines[0] = new line(0,"Start");
			}
			serial_number++;
			add_all_lineView(add_div,lines);
		}else{
			window.alert("Please insert variable name...");
			console.log("please insert variable name...");
		}
	}
	selected_line_num = -1;
}

var add_all_varView = function(){
	var hoge = document.getElementById("variable_list");
	while(hoge.firstChild)
		hoge.removeChild(hoge.firstChild);

	for(var prop in variables){
		add_new_varView(variables[prop].name);
	}
	vList_addButton();
}

var add_new_varView = function(name,area){
	if(!area){
		area = document.getElementById("variable_list");
	}

	var new_div = document.createElement("div");
	new_div.className = "v_element";
	new_div.innerHTML = name;
	new_div.id = name;

	area.appendChild(new_div);
	new_div.addEventListener("mousedown", function(){drag_start(name,new_div)},false);
}

var drag_classChange = function(div){
	if(div)
		div.className = "v_selected";
	var tar = document.getElementById("target");
	tar.classList.add("target_over");

	var eList = document.querySelectorAll(".v_element");
	for(var prop=0;prop<eList.length;prop++){
		eList[prop].classList.add("target_over");
	}

	var nList = document.querySelectorAll(".v_null");
	for(var prop=0;prop<nList.length;prop++){
		nList[prop].classList.add("target_over");
	}

	var trash = document.querySelector(".trash");
	trash.classList.add("target_over");
	var cTrash = document.querySelector(".cond_trash");
	cTrash.classList.add("target_over");
}

var drag_start = function(name,div){
	console.log("Dragging : "+name);
	console.log(div);
	//var v = document.getElementById(name);
	drag_classChange(div);

	selected_var_name = name;
	dragged_area = div;
}


var num_drag_start = function(){
	drag_classChange();
	console.log("Dragging :Number")

	dragged_area = "number";
}

var str_drag_start = function(){
	drag_classChange();
	console.log("Dragging :String");

	dragged_area = "string";
}

var drop = function(area){
	var new_null;

	//	ドラッグされている変数があり、それがvariable_listから来ていない場合。
	//	ドラッグ元のdivを元の状態（Null）に戻す。
	if(selected_var_name){
		if(dragged_area.parentNode.id!="variable_list"){
			new_null = document.createElement("div");
			if(dragged_area.id=="target")
				new_null.id = "target";
			new_null.className = "v_null";
			new_null.innerHTML = "Nullaaa";
			new_null.addEventListener("mouseup",function(){drop(new_null)},false);
			var parent = dragged_area.parentNode;

			parent.insertBefore(new_null, dragged_area);
			parent.removeChild(dragged_area);	
		}
	}

	if(dragged_area=="number"){
		if(area.id=="target")
			window.alert("変数をいれてください。");
		else
			num_drop_window(area);
	}else if(dragged_area=="string"){
		if(area.id=="target")
			window.alert("変数をいれてください。");
		else
			str_drop_window(area);
	}else{
		if(!selected_var_name)
			return false;
		var sv;
		if(variables[selected_var_name]){
			sv = variables[selected_var_name].name;
		}else if(selected_var_name!="Null"){
			sv = selected_var_name;
		}
		console.log(area);
		if(area.id=="target"){
			//window.alert("Dropped to Target");
			var tar = document.getElementById("target");
			tar.className = "v_element";
			tar.innerHTML = sv;
			tar.addEventListener("mousedown", function(){drag_start(sv,tar)},false);	
		}else if(area){
			if(!area.parentNode)
				area = new_null;
			area.className = "v_element";
			area.innerHTML = sv;
			area.addEventListener("mousedown", function(){drag_start(sv,area);},false);
		}
	}
	dragged_area = null;
	selected_var_name = null;
}

var window_drop = function(){
	var sel = document.querySelector(".v_selected");
	if(sel){
		sel.className = "v_element";
		document.getElementById("target").classList.remove("target_over");
	}

	var eList = document.querySelectorAll(".v_element");
	for(var prop=0;prop<eList.length;prop++){
		if(eList[prop].classList.contains("target_over"))
			eList[prop].classList.remove("target_over");
	}

	var nList = document.querySelectorAll(".v_null");
	for(var prop=0;prop<nList.length;prop++){
		nList[prop].classList.remove("target_over");
	}

	var trash = document.querySelector(".trash")
	trash.classList.remove("target_over");
	var cTrash = document.querySelector(".cond_trash")
	cTrash.classList.remove("target_over");
}

var num_drop_window = function(area){
	var num = window.prompt("実数を入力してください。");
	if(num===null){
		window.alert("キャンセルされました。");
		}else{
		num = parseFloat(num);
		if(isNaN(num)){
			window.alert("実数でないと判断されました。");
		}else{
			console.log(area);
			if(area.id=="target")
				area = document.getElementById("target");
			area.className = "v_element";
			area.innerHTML = num;
			area.addEventListener("mousedown", function(){drag_start(num,area)},false);
		}
	}
}

var str_drop_window = function(area){
	var str = window.prompt("文字列を入力してください。");
	if(str==false){
		window.alert("キャンセルされました。");
		return false;
	}
	if(area.id=="target")
		area = document.getElementById("target");
	area.className = "v_element";
	area.innerHTML = "\"" + str + "\"";
	area.addEventListener("mousedown", function(){drag_start(str,area)},false);
}


var trash_drop = function(){
	var root = dragged_area;
	if(root.parentNode.id=="variable_list"){
		console.log("Delete Variable: "+selected_var_name);
		delete variables[selected_var_name];
		add_all_varView();
	}else{
		/*
		dragged_area.innerHTML = "Null";
		dragged_area.className = "v_null";
		*/
		var new_null = document.createElement("div");
		if(dragged_area.id=="target")
			new_null.id = "target";
		new_null.className = "v_null";
		new_null.innerHTML = "Null";
		new_null.addEventListener("mouseup",function(){drop(new_null)},false);
		var parent = dragged_area.parentNode;

		parent.insertBefore(new_null, dragged_area);
		parent.removeChild(dragged_area);
	}
	selected_var_name = null;
}

var add_nullset = function(){
	var area = document.getElementById("assign_area");
	if(area.querySelector(".v_add"))
		area.removeChild(area.querySelector(".v_add"));
	add_opr();
	add_null();
	add_addButton();
}

var add_null = function(area){
	if(!area)
		area = document.getElementById("assign_area");

	var div = document.createElement("div");
	div.className = "v_null";
	div.innerHTML = "Null";
	div.addEventListener("mouseup",function(){drop(div)},false);

	area.appendChild(div);
}

var add_addButton = function(area){
	if(!area)
		area = document.getElementById("assign_area");

	var div = document.createElement("div");
	div.className = "v_add";
	div.innerHTML = "＋"
	div.title = "Add";
	div.addEventListener("click",function(){add_nullset()},false);

	area.appendChild(div);
}

var assign_restart_window = function(){
	var flag = window.confirm("エリアをリセットします。");
	if(flag)
		assign_restart();
}

var assign_restart = function(){
	var target = document.getElementById("target");
	var new_null = document.createElement("div");
	new_null.id = "target";
	new_null.className = "v_null";
	new_null.innerHTML = "Null";
	new_null.addEventListener("mouseup",function(){drop(new_null)},false);
	var parent = target.parentNode;

	parent.insertBefore(new_null, target);
	parent.removeChild(target);

	var area = document.getElementById("assign_area");
	while(area.firstChild)
		area.removeChild(area.firstChild);

	add_null();
	add_addButton();
	selected_var_name = null;
	dragged_area = null;
}

var assign_export_window = function(){
	if(!assign_export_check()){
		window.alert("未定義の項目があります。");
		return false;
	}

	if(window.confirm("代入を行います。")){
		assign_export();
	}
}

var assign_export_check = function(){
	var target_area = document.getElementById("target");
	var aList = document.getElementById("assign_area");
	if(target_area.className=="v_null"||aList.querySelector(".v_null"))
		return false;
	
	return true;
}

var assign_export = function(){
	var target_area = document.getElementById("target");
	var target;
	target = target_area.innerHTML;
	var aList = document.getElementById("assign_area").children;
	//var hoge = target_area.innerHTML + "=";
	var hoge = "";
	for(var prop in aList){
		var div = aList[prop];
		if(div.className=="v_element")
			hoge += div.innerHTML;
		else if(div.className=="v_opr"){
			var sel = div.querySelector("select");
			hoge+= sel.options[sel.selectedIndex].value;
		}
	}
	
	add_new_line("Assign", target, hoge);
}

var cond_restart_window = function(){
	var flag = window.confirm("エリアをリセットします。");
	if(flag)
		cond_restart();
}

var cond_restart = function(){
	var target = document.getElementById("cond_target");
	var new_cNull = document.createElement("div");
	new_cNull.className = "v_null";
	new_cNull.id = "cond_target";
	new_cNull.innerHTML = "Null";

	var parent = target.parentNode;
	parent.insertBefore(new_cNull, target);
	parent.removeChild(target);

	var area = document.getElementById("condition_area");

	while(area.firstChild)
		area.removeChild(area.firstChild);

	make_cBox();
	make_cAdd();
}

var vList_addButton = function(){
	var area = document.getElementById("variable_list");

	var div = document.createElement("div");
	div.className = "v_add";
	div.innerHTML = "＋";
	div.title = "変数を追加"
	div.addEventListener("click", function(){vList_addWindow()},false);

	area.appendChild(div);
}

var vList_addWindow = function(){
	var name = window.prompt("新規変数名を入力してください");
	if(name==""){
		vList_addWindow();
		return false;
	}else if(variables[name]){
		window.alert(name+" は既に登録されています。");
		return false;
	}else if(name){
		vList_add(name);
		return true;
	}
	return false;
}

var add_opr = function(area){
	if(!area)
		area = document.getElementById("assign_area");

	var opr = ["+","-","*","/"];
	var opr_value = ["＋","ー","×","÷"]

	var div = document.createElement("div");
	div.className = "v_opr";
	var sel = document.createElement("select");
	for(var prop in opr){
		var hoge = document.createElement("option");
		hoge.value = opr[prop];
		hoge.innerHTML = opr_value[prop];
		sel.appendChild(hoge);
	}	

	div.appendChild(sel);
	area.appendChild(div);
}

var vList_add = function(name){
	variables[name] = new variable(name);
	add_all_varView();
}

var select_struct = function(serial,line,area){
	var target = document.querySelector("#cond_target");
	console.log("hoge");
	if(selected_struct_num==serial){
		//選択されているstructがクリックされた場合。deselect.
		area.className = "if_struct";
		selected_struct_num = -1;

		var div = document.createElement("div");
		div.innerHTML = "Nullweeei";
		div.className = "v_null";
		div.id = "cond_target";
		var p = target.parentNode;
		p.insertBefore(div, target);
		p.removeChild(target);
	}else{
		//cond_targetが未選択の場合。insert
		//選択されているstructとクリックされたstructが違う場合。overwrite.
		var hoge = document.querySelector(".if_struct_selected");
		if(hoge)
			hoge.className = "if_struct";
		console.log(area);

		selected_struct_num = serial;
		area.className = "if_struct_selected";

		var n = area.parentNode.querySelector(".if_number").innerHTML;
		n = n.replace("<br>"," - ");
		target.innerHTML = n;
		target.className = "v_element";
	}
}

var make_cBox = function(){
	var area = document.getElementById("condition_area");
	var selValue = ["<", ">", "<=", ">=", "==", "!="]

	var box = document.createElement("div");
	box.className = "condition_box";

	var make_cElementDiv = function(){
		var cElementDiv = document.createElement("div");
		cElementDiv.className = "c_element_div";
		var cNull = document.createElement("div");
		cNull.className = "v_null";
		cNull.innerHTML = "Null";
		cNull.addEventListener("mouseup",function(){drop(cNull)},false);
		cElementDiv.appendChild(cNull);
		return cElementDiv;
	}

	var ce0 = new make_cElementDiv();
	var ce1 = new make_cElementDiv();

	var cOpt = document.createElement("div");
	cOpt.className = "c_opr";
	var cSel = document.createElement("div");
	cSel.className = "c_select";
	var cSelector = document.createElement("select");
	for(var prop in selValue){
		var opt = document.createElement("option");
		opt.innerHTML = selValue[prop];
		opt.value = selValue[prop];
		cSelector.appendChild(opt);
	}
	cSel.appendChild(cSelector);
	cOpt.appendChild(cSel);

	box.appendChild(ce0);
	box.appendChild(cOpt);
	box.appendChild(ce1);

	area.appendChild(box);
}

var make_cSet = function(){
	var area = document.getElementById("condition_area");
	var button = area.querySelector(".c_add");
	area.removeChild(button);

	make_cLogOpr();
	make_cBox();
	//make_cAdd();
}

var make_cAdd = function(){
	var area = document.getElementById("condition_area");

	var cAdd = document.createElement("div");
	cAdd.className = "c_add";
	cAdd.innerHTML = "＋";
	cAdd.addEventListener("click", make_cSet, false);

	area.appendChild(cAdd);
}

var make_cLogOpr = function(){
	var area = document.getElementById("condition_area");
	var cLogOpr = document.createElement("div");
	cLogOpr.className = "c_logOpr";

	var and = document.createElement("div");
	and.className = "c_logElement c_logSelected";
	and.title = "かつ";
	and.innerHTML = "&&";
	and.addEventListener("click", function(){change_cLogOpr(and)}, false);

	var or = document.createElement("div");
	or.className = "c_logElement";
	or.title = "または";
	or.innerHTML = "||";
	or.addEventListener("click", function(){change_cLogOpr(or)}, false);

	cLogOpr.appendChild(and);
	cLogOpr.appendChild(or);

	area.appendChild(cLogOpr);
}

var change_cLogOpr = function(area){
	var parent = area.parentNode;
	var hoge = parent.querySelector(".c_logSelected");
	if(!hoge){
		console.log("Error...");
		return false;
	}

	hoge.classList.remove("c_logSelected");
	area.classList.add("c_logSelected");
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
	//console.log(v.value);
}

var tbn = function(name){
	return "tool_bar_"+name;
}

var tool_bar_visible = function(){
	var toolBar = document.getElementById("tool_bar");
	var v;
	//console.log(toolBar.style.display);
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

var type_change = function(area_name){
	var as = document.getElementById("edit_assign");
	var co = document.getElementById("edit_condition");

	if(area_name=="Assign"){
		as.style.display = "block";
		co.style.display = "none";
		document.getElementById("type_assign").className = "type_selected";
		document.getElementById("type_condition").className = "type_unselected";
	}else if(area_name=="Condition"){
		as.style.display = "none";
		co.style.display = "block";
		document.getElementById("type_assign").className = "type_unselected";
		document.getElementById("type_condition").className = "type_selected";
	}
}

var tpChange0 = function(area_name){
	var as0 = document.getElementById("variable_list");
	var co0 = document.getElementById("other_list");

	if(area_name=="varList"){
		as0.style.display = "block";
		co0.style.display = "none";
		document.getElementById("var_list_bar").className = "as_bar";
		document.getElementById("other_list_bar").className = "as_bar as_unselected";
	}else if(area_name=="otherList"){
		as0.style.display = "none";
		co0.style.display = "block";
		document.getElementById("var_list_bar").className = "as_bar as_unselected";
		document.getElementById("other_list_bar").className = "as_bar";
	}
}

var add_all_lineView = function(area,list,layer){
	//var structArea = document.getElementById("struct_area");
	//console.log(list);
	
	if(area.className=="if")
		area = area.parentNode;
	
	//console.log(area);
	var structArea = area;
	var children = structArea.childNodes;
	
	if(area.id=="struct_area"){
		while(structArea.firstChild){
			structArea.removeChild(structArea.firstChild);
		}
		add_all_varView();
	}

	if(!layer)var layer = 0;

	for(var prop in list){
		if(list[prop]){
			serial = list[prop].number;
			if(list[prop].kind=="Var"){
				//console.log("::"+list[prop].name);
				add_new_lineView(serial,prop,"NEW_VARIABLE",list[prop].name,area,list,layer);
			}else if(list[prop].kind=="Assign"){
				//console.log(list[prop].value);
				add_new_lineView(serial,prop,"ASSIGN_VARIABLE",list[prop].name,area,list,layer);
			}else if(list[prop].kind=="If"){
				add_new_ifView(serial,prop,area,layer);
				var hoge = area.querySelectorAll('.if');
				hoge = hoge[hoge.length-1];

				add_all_lineView(hoge,list[prop].inner_lines,layer+1);
			}
		}
	}
}

var add_new_lineView = function(serial,number,value,name,area,parent,layer){
	var struct = area;
	/*
	if(document.querySelector(".box_selected")){
		struct = document.querySelector(".box_selected");
	}else{
		struct = document.querySelector("#struct_area");
	}*/

	var line = document.createElement("div");
	line.className = "line";

	for(var i=0;i<layer;i++){
		var blank = document.createElement("div");
		blank.className = "line_blank";
		line.appendChild(blank);
	}

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
	}else if(parent[number].assign_value=="BEFORE_ASSIGN"){
		str = " = Empty!";
	}else if(value=="ASSIGN_VARIABLE"){
		if(parent[number].type=="String")
			str = " = \"" + parent[number].assign_value + "\" : Assign Fixed String";
		else if(parent[number].type=="Number")
			str = " = " + parent[number].assign_value + " : Assign Fixed Number";
		else
			str = " = " + parent[number].assign_value;
	}

	str = name + str;
	lineStruct.innerHTML = str;
	line.appendChild(lineStruct);

	struct.appendChild(line);

	line.addEventListener("click", function(){select_line(serial,name,line)},false);
}

var add_new_ifView = function(serial,number,area,layer){
	var box = document.createElement("div");
	box.className = "box";

	var struct = document.getElementById("struct_area");
	var line = document.createElement("div");
	line.className = "if";

	var rest_width = 300;

	for(var i=0;i<layer;i++){
		var blank = document.createElement("div");
		blank.className = "line_blank";
		line.appendChild(blank);
		rest_width -= 10;
	}

	var lineNum = document.createElement("div");
	lineNum.innerHTML = number + "<br>If";
	lineNum.className = "if_number";
	line.appendChild(lineNum);
	var lineStruct = document.createElement("div");
	lineStruct.className = "if_struct";
	lineStruct.innerHTML = "true";
	var change_div = document.createElement("div");
	change_div.className = "if_option";
	change_div.innerHTML = "Exchange";
	var insert_div = document.createElement("div");
	insert_div.className = "if_option if_insert";
	insert_div.innerHTML = "Insert";
	var if_rest = document.createElement("div");
	if_rest.className = "if_rest";
	if_rest.style.width = rest_width+"px";


	line.appendChild(lineStruct);
	line.appendChild(change_div);
	line.appendChild(insert_div);
	line.appendChild(if_rest);
	box.appendChild(line);
	area.appendChild(box);

	change_div.addEventListener("click", function(){select_line(serial,name,line)},false);
	insert_div.addEventListener("click", function(){insert_line(serial,line)},false);
	if_rest.addEventListener("click", function(){select_line(serial,name,line)},false);
	lineNum.addEventListener("click", function(){select_line(serial,name,line)},false);
	line.addEventListener("mouseover", function(){if_option_view(serial,line,true)},false);
	line.addEventListener("mouseout", function(){if_option_view(serial,line,false)},false);

	lineStruct.addEventListener("click", function(){select_struct(serial,line,lineStruct)}, false);
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
		var sel = search_line(number);
		if(sel.kind=="If"){
			line_area.parentNode.className = "box";
		}else{
			line_area.className = "line";
		}
		tool_bar_switch('new');
		delete_button_change('stop');
	}else{
		if(selected_line_num==-1){
			//	ラインが選択されていない状態
			var sl = search_line(number,0);
			if(sl){
			if(sl.kind=="If"){
				console.log(number + " is If Block.");
				line_area.parentNode.className = "box_selected";
				line_area = line_area.parentNode;
				delete_button_change('active');
			}else{
				console.log(number + " is selected.");
				var el = document.querySelector(".line_selected");
				if(el!=null)el.className = "line";
				line_area.className = "line_selected";
				tool_bar_switch('assign');
				delete_button_change('active');
			}
			console.log(line_area);
			if(line_area.parentNode.className=="box"){
				var if_div = line_area.parentNode.querySelector(".if_insert");
				if_div.innerHTML = "Export";
			}
			selected_line_num = number;
			}
		}else{
			//	ほかのラインが選択されている状態（入れ替え）
			line_change(number,selected_line_num);
			selected_line_num = -1;
			tool_bar_switch('new');
			delete_button_change('stop');
		}
	}
}

var insert_line = function(serial,line_div){
	//window.alert("You click "+serial+" :If");
	var val = search_line(selected_line_num);
	var if_line = search_line(serial);
	var l = if_line.inner_lines.length;

	search_line(selected_line_num,0,lines,null,"Delete");
	if(line_div.querySelector(".if_insert").innerHTML=="Insert"){
		if_line.inner_lines[l] = val;
	}else{
		lines[lines.length] = val;
	}
	selected_line_num = -1;

	add_all_lineView(add_div,lines);
}

var if_option_view = function(serial,if_div,flag){
	if(selected_line_num!=-1&&selected_line_num!=serial){
		var ex = if_div.querySelectorAll(".if_option");
		var ex0 = if_div.querySelector(".if_rest");
		var res;
		var res0;
		if(flag){
			res = "block";
			res0 = "none";
		}else{
			res = "none";
			res0 = "block";
		}
		for(var i=0;i<ex.length;i++){
			ex[i].style.display = res;
		}
		ex0.style.display = res0;
	}
}


var line_change = function(n,n0){
	//	selected_lineと選択されたlineを入れ替える
	console.log(n+"<=>"+n0);
	var nLine = search_line(n,0);
	var n0Line = search_line(n0,0);
	//console.log(nLine.number+"<==>"+n0Line.number);

	//search_line(n,0,lines,n0Line);
	//search_line(n0,0,lines,nLine);
	if(check_child(nLine,n0Line))exchange_line(n,n0);

	add_all_lineView(add_div,lines);
}

var check_child = function(n,n0){
	//どちらかがブロックで、もう片方を内包していないかをチェックする
	/*
	1 if(){
		2 alert();
	}
	これで1と2を交換するとすごいことになるので避ける
	*/
	var check = function(a,b){
		if(a.inner_lines){
			var ln = a.inner_lines;
			for(var prop in ln){
				console.log(b.number+" ## "+ln[prop].number);
				if(ln[prop].number==b.number){
					window.alert("ERROR!");
					return false;
				}
			}
		}
		return true;
	}

	if(!check(n,n0)||!check(n0,n))return false;

	return true;
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
		ipt.querySelector(".text").focus();
		//console.log(ipt.querySelector(".text"));
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

var tb_new_if = function(){
	var hoge = document.getElementById("new_if");
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

var make_new_if = function(){
	add_new_line("If",null,null);
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

var remake_assign_line = function(value,type){
	var l = selected_line_num;
	if(l!=-1){
		var line = search_line(l);
		var par = search_line(l,0,lines,null,"ParentBox");

		if(line.kind=="Var"){
			var name = line.name;
			add_new_line("Assign",name,"BEOFRE_ASSIGN");
			l = par.length-1;
		}	
		var selected_line = par[l];

		par[l].struct = new struct(value);
		par[l].assign_value = value;
		par[l].type = type;
		selected_line_num = -1;
		delete_button_change('stop');
		add_all_lineView(add_div,lines);
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
	//add_all_lineView(add_div,lines);
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
			remake_assign_line(num,"Number");
			div.querySelector('input').value = "";
			tb_fixed_num();
			tool_bar_switch('new');
		}
}

var tb_assign_fixed_string = function(e){
	if(!e)
		var e = window.event;
	if(e.keyCode==13){
		assign_fixed_string();
	}
}

var assign_fixed_string = function(){
	var div = document.getElementById("assign_str");
	var str = div.querySelector("input").value;
	
	remake_assign_line(str,"String");
	div.querySelector("input").value = "";
	tb_fixed_str();
	tool_bar_switch('new');
}

var delete_button_change = function(hoge){
	var dButton = document.getElementById("delete_button");
	dButton.className = hoge;
}

var delete_line = function(){
	if(document.getElementById("delete_button").className=='active'){
		/*
		var l = selected_line_num;
		lines.splice(l);
		*/
		search_line(selected_line_num,0,lines,null,"Delete");

		selected_line_num = -1;
		add_all_lineView(add_div,lines);
		document.getElementById("delete_button").className = 'stop';
	}
}

var make_code = function(){
	console.log(lines);
	var code = "";
	for(var prop in variables){
		code += ("var + " + variables[prop].name + ";</br>");
	}

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

var addIf = function(num){
	if(lines[num].kind=="If"){
		var div = document.querySelector(".box_selected");
		add_new_lineView(1,"NEW_VARIABLE","a");
		div.className = "box";
		return "If";
	}
}

var search_line = function(serial,layer,list,assign_line,type){
	//	serial_numberでlineを検索する
	if(layer==0||!list){
		list = lines;
	}

	for(var prop in list){
		if(list[prop].number==serial){
			if(assign_line){
				console.log(assign_line.name+"==>"+list[prop].name);
				list[prop] = assign_line;
				return true;
			}else{
				console.log("==>"+list[prop].number);
				answer = list[prop];
				if(type=="Delete"){
					list = list.splice(prop,1);
					console.log(list);
					return true;
				}else if(type=="ParentBox"){
					window.alert("(^ω^)");
					return list;
				}else{
					return list[prop];
				}
			}
		}else if(list[prop].kind=="If"){
			console.log("IF BLOCK");
			var res = search_line(serial,layer+1,list[prop].inner_lines,assign_line,type);
			if(res)
				return res;
		}
	}

	if(layer==0&&!answer){
		console.log(serial+" is NOT FOUND...");
		//return -1;
	}
}

var exchange_line = function(n1,n2,layer,list){
	if(!list||!layer){
		list = lines;
		layer = 0;
	}

	var add,res,pl;

	for(var prop in list){
		if(list[prop].number==n1){
			res = n2;
			if(layer!=0){
				return res;
			}
		}else if(list[prop].number==n2){
			res = n1;
			if(layer!=0){
				return res;
			}
		}else if(list[prop].kind=="If"){
			res = exchange_line(n1,n2,layer+1,list[prop].inner_lines);
		}
		if(res&&layer==0){
			if(res==n1)add = n2;
			else add = n1;
			pl = search_line(res);
			search_line(res,0,lines,search_line(add));
			break;
		}
	}

	if(layer==0){
		search_line(add,0,lines,pl);
	}
	//console.log(lines);
}


window.onload = function(){
	project = document.getElementById("project");
	window.addEventListener("mouseup", function(){window_drop()}, false);
	var t = document.getElementById("tb");
	lines[0] = new line(0,"Start");
	selected_line_num = -1;
	selected_struct_num = -1;
	serial_number = 1;
	variables = new Object();
	add_div = document.querySelector('#struct_area');

	var as0 = document.getElementById("var_list_bar");
	var co0 = document.getElementById("other_list_bar");
	as0.addEventListener("click", function(){tpChange0("varList")},false);
	co0.addEventListener("click", function(){tpChange0("otherList")},false);

	var as = document.getElementById("type_assign");
	as.addEventListener("click", function(){type_change("Assign")},false);
	var co = document.getElementById("type_condition");
	co.addEventListener("click", function(){type_change("Condition")},false);

	var other_num = document.getElementById("other_num");
	other_num.addEventListener("mousedown", function(){num_drag_start()}, false);

	var other_str = document.getElementById("other_str");
	other_str.addEventListener("mousedown", function(){str_drag_start()}, false);

	var target = document.getElementById("target");
	target.addEventListener("mouseup",function(){drop(target)},false);

	var insert = document.querySelector(".insert");
	insert.addEventListener("click", function(){assign_export_window()},false);

	var restart = document.querySelector(".restart");
	restart.addEventListener("click", function(){assign_restart_window()}, false);

	var trash = document.querySelector(".trash");
	trash.addEventListener("mouseup", function(){trash_drop()},false);

	var condRestart = document.querySelector(".cond_restart");
	condRestart.addEventListener("click", cond_restart_window,false);

	var condTrash = document.querySelector(".cond_trash");
	condTrash.addEventListener("mouseup", function(){trash_drop()},false);

	add_null();
	add_addButton();
	vList_addButton();

	make_cBox();
	make_cAdd();


	console.log(add_div);
}
