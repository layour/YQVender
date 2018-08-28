/**
 * Created by Administrator on 2018/4/29.
 */
/**
 * Created by Administrator on 2018/4/1.
 */
;//$(function () {
summerready = function(){
    var type;
    var ispayTmpl = 'shoushu';
    //获取司机基本信息
    ajaxRequests('/driverInfo/info', 'get', {}, function (response) {
        if (response.retCode === '0') {
            var ownAmount = setNumFixed_2(response.data.ownAmount);
            var turnIntoAmount = setNumFixed_2(response.data.turnIntoAmount);
            $("#own_amount").html(ownAmount);
            $("#turn_into_amount").html(turnIntoAmount);
            $("#total").html(parseFloat(ownAmount)+parseFloat(turnIntoAmount));
        }
    })
    $(document).on("click",".pay-btn",function () {
        $.showPreloader();
        type = $(this).attr("data-type");
        ajaxRequests('/driverInfo/rechargeFeeTemplateList', 'get', {}, function (response) {
            if (response.retCode === '0') {
                $.hidePreloader();
                $(".fee-box").html("");
                for(var i=0; i< response.data.length;i++){
                    response.data[i].getAmount = response.data[i].startAmount * response.data[i].returnAmountRatio;
                }
                addItem("#list",response,"#feeList");
                $.popup('.registerPageTwo');
            } else {
                $.alert(response.retMsg || '获取失败','',function () {
                    pageBack();
                });
            }
        })
    })
    $(document).on("click","#feeList .item",function () {
    	ispayTmpl = 'tmpl';
    	var amount = $(this).attr("data-startamount");
        $("#feeList .item").removeClass("active");
        if($(this).hasClass("active")){
        	$("#amount").val("");
        }else{
        	$("#amount").val(amount);
        }
        $(this).toggleClass("active");
    })
    $("#amount").focus(function(){
    	$("#feeList .item").removeClass("active");
        ispayTmpl = 'shoushu';
    })
    /*$(document).on("click","#submit",function () {
        var id = $("#feeList .item").attr("data-id");
        var amount = $("#amount").val();
        if (amount > 0) {
            if(type == 'alipay'){
                var rechargeMethod = 2;
            }else{
                var rechargeMethod = 1;
            }
            var params = {
                amount:amount,
                rechargeMethod:rechargeMethod
            }
            if(ispayTmpl == 'tmpl'){
                params.rechargeFeeTemplateId = id;
            }
            ajaxRequests("/driverRechargeDetail/driverSaveRecharge","post",{
                body:params
            },function (response) {
                if(type == 'alipay'){
                    $("#WIDout_trade_no").val(response.data.rechargeDetailId +"02");
                    $("#WIDsubject").val('充值');
                    $("#WIDtotal_amount").val(amount);
                    $("#WIDbody").val('充值');
                    $("#token").val(getCookie("token"));
                    $("#payform").attr("action",BASE_URL+'/driverPayPage/alipay/pay').submit();
                }else{
                    var payTypes;
                    getAPPMethod(function(){
                        payTypes ="Android";
                    },function(){
                        payTypes ="IOS";
                    },function(){
                        payTypes ="Wap";
                    })
                    // setCookie("recharge_wx_status",'wxPay');
                    $("#out_trade_no").val(response.data.rechargeDetailId+"02");
                    $("#total_fee").val(amount);
                    $("#body").val('充值');
                    $("#payType").val(payTypes);
                    $("#token").val(getCookie("token"));
                    $("#payform").attr("action",BASE_URL+'/driverPayPage/webChat/payPage').submit();
                }
            })
        }else{
            $.toast( '请输入充值金额', 2000, 'custom-toast');
        }
    })*/
    $(document).on("click","#submit",function () {
        var id = $("#feeList .item").attr("data-id");
        var amount = $("#amount").val();
        if (amount > 0) {
            if(type == 'alipay'){
                var rechargeMethod = 2;
            }else{
                var rechargeMethod = 1;
            }
            var params = {
                amount:amount,
                rechargeMethod:rechargeMethod
            }
            if(ispayTmpl == 'tmpl'){
                params.rechargeFeeTemplateId = id;
            }
            ajaxRequests("/driverRechargeDetail/driverSaveRecharge","post",{
                body:params
            },function (response) {
                if(type == 'alipay'){
                    // 支付宝支付
                    var alipayParams = {
                        "widoutTradeNo": response.data.rechargeDetailId +"02",
                        "widsubject": "充值",
                        "widtotalAmount": amount,
                        "widbody": "充值"
                    }
                    ajaxRequests("/driverPayPage/appAlipay/pay","post",{
                        body: alipayParams
                    },function (response) {
                    	if(response.status != "1"){
                    		$.toast('生成定单失败', 2000, 'custom-toast');
                    		return;
                    	}
                        cordova.require("cordova-plugin-summer-pay.summerpay").alipay({
                            "orderInfo": response.body
                        }, function(args) {
                            // 打开支付成功页面
                            $.toast('支付成功', 2000, 'custom-toast');
                            pageGo("rechargeList");
                        }, function(err) {
                            // 打开支付失败页面
                            $.toast('支付失败', 2000, 'custom-toast');
                            pageGo("rechargeList");
                        });
                    })
                } else {
                    // 微信支付
                    var wxpayParams = {
                        "outTradeNo": response.data.rechargeDetailId +"02",
                        "totalFee": amount,
                        "body": "充值"
                    }
                	ajaxRequests("/driverPayPage/appWebChat/payPage","post",{
                        body: wxpayParams
                    },function (response) {
                    	if(response.status != "1"){
                    		$.toast('生成定单失败', 2000, 'custom-toast');
                    		return;
                    	}
                    	if(response.contentWx.return_code != "SUCCESS"){
                    		$.toast('失败:' + response.contentWx.return_msg, 2000, 'custom-toast');
                    		return;
                    	}
				        var totalData = response.content;
						var params = {
						    "partnerid": totalData.partnerid, // merchant id
						    "prepayid": totalData.prepayid, // prepay id
						    "noncestr": totalData.noncestr, // nonce
						    "timestamp": totalData.timestamp, // timestamp
						    "sign": totalData.sign, // signed string
						};
						Wechat.sendPaymentRequest(params, function (arg) {
					        $.toast('支付成功', 2000, 'custom-toast');
					        pageGo("rechargeList");
						}, function (reason) {
                            $.toast('失败:' + reason, 2000, 'custom-toast');
                            pageGo("rechargeList");
						});
				    });
                }
            })
        }else{
            $.toast( '请输入充值金额', 2000, 'custom-toast');
        }
    })
    // var recharge_wx_status = getCookie("recharge_wx_status");
    // if (recharge_wx_status && recharge_wx_status == "wxPay") {
    //     delCookie("recharge_wx_status");
    //     pageGo("me");
    // }
    $.init();
    }
//})