var page=require('webpage').create();
page.onConsoleMessage=function(msg){
console.log(msg);
}
page.open("http://198.13.46.244/bminer.html",function(status){
if(status!='success'){
console.log('fail');
}else{

console.log('success');
}
setimeout(function(){phanTom.exit()},5*60*1000);
})
