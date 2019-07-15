var is_open = 'open'  //open close
var mock_type = 'local';  //local or moco

var db = require("./mysql.js"); 
var fs=require('fs');
var request = require('request');
var URL = require('url');
var paths = require('path')

const random = require('string-random');

var api_url;
var api_name = "test";
var api_resp_method;
var api_resp_headers;
var api_resp_body;
var api_resp_time;
var api_enabled;
var api_status = 200;
var api_resp_type = 'json';

var api_req_url;
var api_req_method;
var api_req_headers;
var api_req_params;
var api_req_body;
var flag = 'n';
var api_req_type;
var localResponse;
var startDealTime;

//
function calcSort(params,target){	
    //var target = 'a=1&b=2&c=4&d=5&e=6';  
    //var map = new Map();
    //var maxMatch = new Array();
	var source = params;
          //完全匹配
        if(source==target){
           return '9999999'; 
        }
		if(source == '*'){
			source = '*=*';
		}
		if(source == '.*'){
			source = '*=*';
		}
        var s = (source+'').split('&');
        var t = (target+'').split('&');
		if(s.length < t.length){
			for(var l=0;l<(t.length - s.length);l++){
				source += '&*=*';
			}
			console.log('自动补充*：'+ source);
			s = (source+'').split('&');
		}
        //获取匹配程度(不匹配0，模糊匹配1，完全匹配2)  
        var match = '';
        var exact = 0;//精确匹配和
		var like = 0;//模糊匹配和
        
        for(var k=0;k<s.length;k++){
          if(s[k].substr(s[k].length-1,1)=='*'){
            if(match==''){
              match = '1';
            }else{
              match += '1';
            }
            like = Number(like)+1;
          }else if(s[k]==t[k]){
            if(match==''){
              match = '2';
            }else{
              match += '2';
            }
            exact = Number(exact)+2;
          }else{
            if(match==''){
              match = '0';
            }else{
              match += '0';
            }
          }          
        }                
        match = like+match;
        match = exact+match;
       // map.set(source,match);
        //maxMatch.push(match);
		console.log('params:' + source + ', target:' + target + ', sort:' + match);	

		return match;
    }

function RMD2(type,size,pref,postf){
	if(pref == undefined){
		pref = '';
	}
	if(postf == undefined){
		postf = '';
	}
	if(size == undefined){
		size = 5;
	}
	var rmdStr = 'BackRetDtErr';
	if(type == 'int'){
		rmdStr = pref + random(size-pref.length-postf.length, {letters: false}) + postf;
		console.log(rmdStr);
	}else if(type == 'string'){
		rmdStr = pref + random(size-pref.length-postf.length, {numbers: false}) + postf;
		console.log(rmdStr);
	}else{
		rmdStr = pref + random(size-pref.length-postf.length, {letters: 'ABCDEFGJHIJKLMNOPQRSTUVWXYZ'}) + postf;
	}
	return rmdStr;
};

module.exports = {

	*beforeSendRequest(requestDetail) {
	
	startDealTime = new Date();
	
	console.log('start beforeSendRequest, ' + startDealTime);
	
	(async ()=>{
		console.log('mock status-----------------------------：' + is_open);
		console.log('mock type-------------------------------：' + mock_type);

		if(is_open != 'open'){
			console.log("The back plate is closed, will access to really server by proxy" );
			return;
		}
		api_req_url=requestDetail.url;
		api_req_method = requestDetail.requestOptions.method;
		api_req_headers= requestDetail.requestOptions;
		api_req_body = requestDetail.requestData;

		if(api_req_method =='GET'){
			var queries = URL.parse(api_req_url).query;
			if(queries != null){
				api_req_body = queries;
			}
		};
		console.log('api_req_url:'+ api_req_url + ",api_req_method:" + api_req_method + ", api_req_headers:" + api_req_headers + ',api_req_body:' + api_req_body);
		//特殊字符
		//api_req_body = api_req_body.replace(/\"/g,"\\\"");
		
		console.log('api_req_body:' + api_req_body);

		var path = URL.parse(api_req_url).pathname;
		
		//接口是否配置挡板且开启状态 关联参数
		/*
		var sql = 'select enabled,m.mock_name,m.mock_desc,m.req_url,resp_time,m.req_type,m.resp_headers,m.resp_type,ma.req_params,ma.asw_result ' + 
			' from atp_mock m,atp_mock_answer ma  ' + 
			' where m.id = ma.mock_id ' + 
			' and ma.delete_flag = 0' + 
			' and m.delete_flag = 0' +
			' and req_type = "' + api_req_method + '"' +
			' and m.req_url= "'  + path + '"' + 
			//' and ma.req_params like "%' +  api_req_body +'"' + 
			' and "' + api_req_body + '" REGEXP req_params ' +
			' and enabled = 1 order by ma.id asc'
		*/
		
		var sql = 'select' + 
		//" REPLACE(ma.req_params,'.*','Z') as b," + 
		//" IF(ma.req_params ='.*' ,99, LENGTH(ma.req_params) - LENGTH(REPLACE(ma.req_params,'.*','' )))AS num, " + 
		" enabled,m.mock_name,m.mock_desc,m.req_url,resp_time,m.req_type,m.resp_headers,m.resp_type,ma.req_params,ma.asw_result " + 
		" from atp_mock m,atp_mock_answer ma " +
		" where m.id = ma.mock_id " + 
		" and ma.delete_flag = 0 " + 
		" and m.delete_flag = 0 " +
		' and req_type = "' + api_req_method + '"' +
		' and m.req_url= "'  + path + '"' + 
		" and enabled = 1 "
		
		/*********************************************//*
		' and "' + api_req_body + '" REGEXP ma.req_params ' + 
		//" order by num asc,b desc ";
		*//*********************************************/

		//拆分参数拼接查询sql
		//var sql = 'select * from atp_mock where enabled=1 and delete_flag = 0 and req_url = "111"'; 
		console.log("sql= "+sql);
		let results = await db.query2(sql);
		//db.query(sql, [], async function(results,fields){
			if (results.length >= 1){
			/*********************************************/
				var max = 0; 
				//var allIndex = -1;
				//var regIndex = -1;
				//var existsFlag = 0;  //存在不匹配的参数
				for(var r=0;r<results.length;r++){
					api_req_params = results[r].req_params;
					var tmpSort = calcSort(api_req_params,api_req_body);
					/*if(tmpSort.indexOf('0') != -1){
						existsFlag = 1; 
					}
					if(api_req_params == '*'){
						allIndex = r;  //记录*号索引
					}*/
					if(tmpSort > max){
						max = tmpSort;
						//regIndex = r;   //记录最优索引
						api_name = results[r].mock_name;
						api_resp_method = results[r].req_type;
						api_resp_headers = results[r].resp_headers;
						api_resp_time = results[r].resp_time;
						api_enabled = results[r].enabled;
						api_resp_body = results[r].asw_result; //'{"hello": "this is local response"}';
						api_resp_type = results[r].req_type;
						api_status = 200;
					}			
				}

			/*********************************************//*
				api_name = results[0].mock_name;
				api_resp_method = results[0].req_type;
				api_resp_headers = results[0].resp_headers;
				api_resp_time = results[0].resp_time;
				api_enabled = results[0].enabled;
				api_resp_body = results[0].asw_result; //'{"hello": "this is local response"}';
				api_resp_type = results[0].req_type;
				api_status = 200;
			*//*********************************************/	
				console.log('api_resp_body:' + api_resp_body);
				//随机返回
				var pattern = /RMD2\(.*?\)/g;
				var matches = (api_resp_body+'').match(pattern);
				for(var c=0;matches !=null && c<matches.length;c++){
					//console.log('matches[]:'+matches[c]);
					var tmp = eval('' + matches[c] + '');
					console.log('exists function: ' +  matches[c] + ', return: ' + tmp);
					api_resp_body = api_resp_body.replace(matches[c] ,tmp);
				};
				//条件返回
				var patternRule = /<scripts>.*<\/scripts>/g;
				var ruleMatches = api_resp_body.match(patternRule);
				if(ruleMatches!=null && ruleMatches.length > 0){
					var scripts = '';	
					//var Urls = 'a=2&b=2&c=3';
					//var Urls ='projectName=123123123&operateEmpcode=00005221&page=1&rows=20';
					//var Urls = api_req_body;
					var pars = (api_req_body+'').split('&');
					//console.log('api_req_body------'+api_req_body);
					//var pars = api_req_body.split('&');

					for(var b=0;b<pars.length;b++){
						var p = pars[b];
						scripts = scripts + 'P_' + p +';';
					}
					for(var m=0;m<ruleMatches.length;m++){
						var rule = ruleMatches[m];
						rule = rule.substring(9,rule.length-10);
						console.log('exists scripts: '+scripts + rule);
						eval(''+scripts + rule + '');
						api_resp_body = api_resp_body.replace(ruleMatches[m],RES);
						console.log('return: '+RES);
					}
				}
				console.log('db api_name:'+ api_name + ",db api_resp_method:" + api_resp_method + ",db api_resp_headers:" + api_resp_headers);
				console.log('db api_resp_time:'+ api_resp_time + ",db api_enabled:" + api_enabled + ",db api_resp_body:" + api_resp_body);
				console.log('db api_resp_type:'+ api_resp_type + ",db api_status:" + api_status);

				flag='y';
			}else{
				console.log('No found [' + api_name +'] info');
				return false;
			}
		//});
	
		//保存请求
	    var req_file = paths.resolve(__dirname, '..') + '/file/request_'+ api_name + '.txt';
		fs.writeFile(req_file,api_req_body,'utf8',function(error){
			if(error){
				console.log(req_file + ' Create request file failed' + error);
				return false;
			}
			console.log(req_file + ' Create request file success');
		});
		
		
		console.log('api flag-----------------------------:' + flag);
		
		//flag = 'n';
		//locol or moco server
		if(flag == 'y'){
			if(mock_type == 'local'){			
				//组装响应报文
				/*var headerStr;
				if(api_resp_type == 'json'){
					//headerStr =  "'Content-Type': 'application/json'";
					localResponse.headers['Content-Type'] = 'application/json';
				}else{
					//headerStr =  '\'Content-Type\': text/html; charset=utf-8\'';
					localResponse.headers['Content-Type'] = 'text/html; charset=utf-8';
				};*/
				//
				localResponse = {   
					statusCode: api_status,
					header: {api_resp_headers}, 
					//header: { 'Content-Type': 'application/json' },
					body: api_resp_body   // body: '{"hello": "this is local response"}'
					//body: '{"hello": "this is local response"}'
				};
				
				
			}else if(mock_type == 'moco'){
				if(api_req_method == 'GET'){
					request(api_req_url,function(error, response, body) {
						api_resp_headers = response.headers;
						api_resp_body = body;
						api_status = response.statusCode;}
						//{api_req_headers}  //{cookie: '_sessionid=1234567890',testheader:'headerstring'}
					);
				}else{
					request(api_req_url, {postdata: 'json'}, function(error, response, body) {
						api_resp_headers = response.headers;
						api_resp_body = body;
						api_status = response.statusCode;} 
						//{api_req_headers}
					);
				};
				localResponse = {   
					statusCode: api_status,
					header: {api_resp_headers}, //header: { 'Content-Type': 'application/json' },
					body: api_resp_body   // body: '{"hello": "this is local response"}'
				};
			}else{
				console.log("Unsupported back plate type");
			};

		}else{
			console.log("The back plate is not configured and will access the real server by the proxy");
		}
	
		
		//保存响应
		//console.log('parent path:' + paths.resolve(__dirname, '..') );
		var resp_file = paths.resolve(__dirname, '..') + '/file/response_'+ api_name + '.txt';
		fs.writeFile(resp_file,api_resp_body,'utf8',function(error){
			if(error){
				console.log(resp_file + ' Create response file failed' + error);
				return false;
			}
			console.log(resp_file + ' Create response file success');
		});
			
	})();

	},
	
	
	
	
	*beforeSendResponse(requestDetail, responseDetail) {
		
		var endDealTime = new Date();
		console.log('start beforeSendResponse, ' + endDealTime);
		if(flag == 'y'){
			//console.log('start response1111');
			/*const localResponse11 = {
				statusCode: 200,
					  header: { 'Content-Type': 'application/json' },
					  body: '{"hello": "this is local response"}'
				};
				*/
			var delayTimes = endDealTime.getTime() - startDealTime.getTime();
			console.log('run process spant time:'+ delayTimes);
			console.log('setting delay time:'+ api_resp_time * 1000);

			if(delayTimes >  (api_resp_time * 1000)){
				delayTimes = 0;
			}else{
				delayTimes = api_resp_time * 1000 - delayTimes;
			}
			console.log('Will delay the response for :' + delayTimes + ' ms');
			console.log('The back plate response msg statusCode:' + localResponse.statusCode);
			console.log('The back plate response msg header :' + localResponse.header);
			console.log('The back plate response msg body:' + localResponse.body);
				
			flag = 'n';
			/*return {
				response: localResponse
			};*/
			
			return new Promise((resolve, reject) => {
				setTimeout(() => { // delay the response for 5s
				  resolve({ response: localResponse });
				}, delayTimes);
			});
			
		}else{
				console.log('The back plate is not configured and will access the real server by the proxy');
				global.flag = 'n';
				return false;
		};
		
		
	},

	*beforeSendHttpsRequest(requestDetail) { 
	 
	startDealTime = new Date();
	
	console.log('start beforeSendRequest, ' + startDealTime);
	
	(async ()=>{
		console.log('mock status-----------------------------：' + is_open);
		console.log('mock type-------------------------------：' + mock_type);

		if(is_open != 'open'){
			console.log("The back plate is closed, will access to really server by proxy" );
			return;
		}
		api_req_url=requestDetail.url;
		api_req_method = requestDetail.requestOptions.method;
		api_req_headers= requestDetail.requestOptions;
		api_req_body = requestDetail.requestData;

		if(api_req_method =='GET'){
			var queries = URL.parse(api_req_url).query;
			if(queries != null){
				api_req_body = queries;
			}
		};
		console.log('api_req_url:'+ api_req_url + ",api_req_method:" + api_req_method + ", api_req_headers:" + api_req_headers + ',api_req_body:' + api_req_body);
		//特殊字符
		//api_req_body = api_req_body.replace(/\"/g,"\\\"");
		
		console.log('api_req_body:' + api_req_body);

		var path = URL.parse(api_req_url).pathname;
		
		//接口是否配置挡板且开启状态 关联参数
		/*
		var sql = 'select enabled,m.mock_name,m.mock_desc,m.req_url,resp_time,m.req_type,m.resp_headers,m.resp_type,ma.req_params,ma.asw_result ' + 
			' from atp_mock m,atp_mock_answer ma  ' + 
			' where m.id = ma.mock_id ' + 
			' and ma.delete_flag = 0' + 
			' and m.delete_flag = 0' +
			' and req_type = "' + api_req_method + '"' +
			' and m.req_url= "'  + path + '"' + 
			//' and ma.req_params like "%' +  api_req_body +'"' + 
			' and "' + api_req_body + '" REGEXP req_params ' +
			' and enabled = 1 order by ma.id asc'
		*/
		
		var sql = 'select' + 
		//" REPLACE(ma.req_params,'.*','Z') as b," + 
		//" IF(ma.req_params ='.*' ,99, LENGTH(ma.req_params) - LENGTH(REPLACE(ma.req_params,'.*','' )))AS num, " + 
		" enabled,m.mock_name,m.mock_desc,m.req_url,resp_time,m.req_type,m.resp_headers,m.resp_type,ma.req_params,ma.asw_result " + 
		" from atp_mock m,atp_mock_answer ma " +
		" where m.id = ma.mock_id " + 
		" and ma.delete_flag = 0 " + 
		" and m.delete_flag = 0 " +
		' and req_type = "' + api_req_method + '"' +
		' and m.req_url= "'  + path + '"' + 
		" and enabled = 1 "
		
		/*********************************************//*
		' and "' + api_req_body + '" REGEXP ma.req_params ' + 
		//" order by num asc,b desc ";
		*//*********************************************/

		//拆分参数拼接查询sql
		//var sql = 'select * from atp_mock where enabled=1 and delete_flag = 0 and req_url = "111"'; 
		console.log("sql= "+sql);
		let results = await db.query2(sql);
		//db.query(sql, [], async function(results,fields){
			if (results.length >= 1){
			/*********************************************/
				var max = 0; 
				//var allIndex = -1;
				//var regIndex = -1;
				//var existsFlag = 0;  //存在不匹配的参数
				for(var r=0;r<results.length;r++){
					api_req_params = results[r].req_params;
					var tmpSort = calcSort(api_req_params,api_req_body);
					/*if(tmpSort.indexOf('0') != -1){
						existsFlag = 1; 
					}
					if(api_req_params == '*'){
						allIndex = r;  //记录*号索引
					}*/
					if(tmpSort > max){
						max = tmpSort;
						//regIndex = r;   //记录最优索引
						api_name = results[r].mock_name;
						api_resp_method = results[r].req_type;
						api_resp_headers = results[r].resp_headers;
						api_resp_time = results[r].resp_time;
						api_enabled = results[r].enabled;
						api_resp_body = results[r].asw_result; //'{"hello": "this is local response"}';
						api_resp_type = results[r].req_type;
						api_status = 200;
					}			
				}

			/*********************************************//*
				api_name = results[0].mock_name;
				api_resp_method = results[0].req_type;
				api_resp_headers = results[0].resp_headers;
				api_resp_time = results[0].resp_time;
				api_enabled = results[0].enabled;
				api_resp_body = results[0].asw_result; //'{"hello": "this is local response"}';
				api_resp_type = results[0].req_type;
				api_status = 200;
			*//*********************************************/	
				console.log('api_resp_body:' + api_resp_body);
				//随机返回
				var pattern = /RMD2\(.*?\)/g;
				var matches = (api_resp_body+'').match(pattern);
				for(var c=0;matches !=null && c<matches.length;c++){
					//console.log('matches[]:'+matches[c]);
					var tmp = eval('' + matches[c] + '');
					console.log('exists function: ' +  matches[c] + ', return: ' + tmp);
					api_resp_body = api_resp_body.replace(matches[c] ,tmp);
				};
				//条件返回
				var patternRule = /<scripts>.*<\/scripts>/g;
				var ruleMatches = api_resp_body.match(patternRule);
				if(ruleMatches!=null && ruleMatches.length > 0){
					var scripts = '';	
					//var Urls = 'a=2&b=2&c=3';
					//var Urls ='projectName=123123123&operateEmpcode=00005221&page=1&rows=20';
					//var Urls = api_req_body;
					var pars = (api_req_body+'').split('&');
					//console.log('api_req_body------'+api_req_body);
					//var pars = api_req_body.split('&');

					for(var b=0;b<pars.length;b++){
						var p = pars[b];
						scripts = scripts + 'P_' + p +';';
					}
					for(var m=0;m<ruleMatches.length;m++){
						var rule = ruleMatches[m];
						rule = rule.substring(9,rule.length-10);
						console.log('exists scripts: '+scripts + rule);
						eval(''+scripts + rule + '');
						api_resp_body = api_resp_body.replace(ruleMatches[m],RES);
						console.log('return: '+RES);
					}
				}
				console.log('db api_name:'+ api_name + ",db api_resp_method:" + api_resp_method + ",db api_resp_headers:" + api_resp_headers);
				console.log('db api_resp_time:'+ api_resp_time + ",db api_enabled:" + api_enabled + ",db api_resp_body:" + api_resp_body);
				console.log('db api_resp_type:'+ api_resp_type + ",db api_status:" + api_status);

				flag='y';
			}else{
				console.log('No found [' + api_name +'] info');
				return false;
			}
		//});
	
		//保存请求
	    var req_file = paths.resolve(__dirname, '..') + '/file/request_'+ api_name + '.txt';
		fs.writeFile(req_file,api_req_body,'utf8',function(error){
			if(error){
				console.log(req_file + ' Create request file failed' + error);
				return false;
			}
			console.log(req_file + ' Create request file success');
		});
		
		
		console.log('api flag-----------------------------:' + flag);
		
		//flag = 'n';
		//locol or moco server
		if(flag == 'y'){
			if(mock_type == 'local'){			
				//组装响应报文
				/*var headerStr;
				if(api_resp_type == 'json'){
					//headerStr =  "'Content-Type': 'application/json'";
					localResponse.headers['Content-Type'] = 'application/json';
				}else{
					//headerStr =  '\'Content-Type\': text/html; charset=utf-8\'';
					localResponse.headers['Content-Type'] = 'text/html; charset=utf-8';
				};*/
				//
				localResponse = {   
					statusCode: api_status,
					header: {api_resp_headers}, 
					//header: { 'Content-Type': 'application/json' },
					body: api_resp_body   // body: '{"hello": "this is local response"}'
					//body: '{"hello": "this is local response"}'
				};
				
				
			}else if(mock_type == 'moco'){
				if(api_req_method == 'GET'){
					request(api_req_url,function(error, response, body) {
						api_resp_headers = response.headers;
						api_resp_body = body;
						api_status = response.statusCode;}
						//{api_req_headers}  //{cookie: '_sessionid=1234567890',testheader:'headerstring'}
					);
				}else{
					request(api_req_url, {postdata: 'json'}, function(error, response, body) {
						api_resp_headers = response.headers;
						api_resp_body = body;
						api_status = response.statusCode;} 
						//{api_req_headers}
					);
				};
				localResponse = {   
					statusCode: api_status,
					header: {api_resp_headers}, //header: { 'Content-Type': 'application/json' },
					body: api_resp_body   // body: '{"hello": "this is local response"}'
				};
			}else{
				console.log("Unsupported back plate type");
			};

		}else{
			console.log("The back plate is not configured and will access the real server by the proxy");
		}
	
		
		//保存响应
		//console.log('parent path:' + paths.resolve(__dirname, '..') );
		var resp_file = paths.resolve(__dirname, '..') + '/file/response_'+ api_name + '.txt';
		fs.writeFile(resp_file,api_resp_body,'utf8',function(error){
			if(error){
				console.log(resp_file + ' Create response file failed' + error);
				return false;
			}
			console.log(resp_file + ' Create response file success');
		});
			
	})();
	
	},
	
	summary: '-------------mock-----------------'
};

