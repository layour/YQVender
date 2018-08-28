/**
 * Created by Administrator on 2018/4/29.
 */
;//$(function () {
summerready = function(){
    $(".saoma").on("click", function () {
    	var params = {zxing : false};
			ZBar.scan(params, function(args){
				 if(args.indexOf('https')!=-1){
                	 window.location.href=args.slice(args.lastIndexOf('/')+1,args.length); 
                }else{
	                 summer.toast({
				         msg: args,
				         duration:"long"
	                });
                }
			}, function(args){
			    summer.toast({
			        msg: "请扫描支付码",
			         duration:"long"
			    });
			});
      /*  getAPPMethod(function () {
            if (window.gasstation) {
                window.gasstation.zxingClick();
            }
        },function () {
            if(window.webkit){
                window.webkit.messageHandlers.zxingClick.postMessage(null);
            }
        })*/
    })
    }
//})