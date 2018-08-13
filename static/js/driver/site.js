

;//$(function () {
summerready = function(){
    var id = getQueryString("id");
    var $venderResourceId = $("#resourceGrade");
    var $amount_box = $(".amount-box");
    var $price = $(".price");
    var $consumFee =  $("#consumFee");
    var $amount =  $(".amount");
    var $total =  $(".total");
    var typeName ;
    $.showPreloader();
    /*一键加油前获取司机信息*/
    ajaxRequests('/driverVender/driverAddOilGas', "post", {
        body: {
            venderId: id
        }
    }, function (response) {
        if (response.retCode === '0') {
            /*加载模板数据*/
            var dataList = response.data.vender;
            var venderResourceList = response.data.venderResourceList;
            var driverData	 = response.data.driver;
            var companyTpe = dataList.companyType;
            var siteInfo = getType(companyTpe);
            typeName = siteInfo.btnName;
            var data = $.extend(dataList, siteInfo);
            data.star = new Array();
            data.star.length = data.starNum;

            addItem("#detail_demo", data, "#detailList");

            var ownAmount = driverData.ownAmount || 0;
            var turnIntoAmount = driverData.turnIntoAmount || 0;
            $(".ownAmount").append('<span class="pl5">(豆:'+ownAmount+')</span>');
            $(".turnIntoAmount").append('<span class="pl5">(余额:'+turnIntoAmount+')</span>');
            $(".lefAmount").html(ownAmount+turnIntoAmount);
            $("#carNum").val(driverData.carNum);

            var option = '';
            for (var i = 0; i < venderResourceList.length; i++) {
                var resourceGrade = venderResourceList[i].resourceGrade;
                option += '<option value="' + venderResourceList[i].id + '" data-unit="' + venderResourceList[i].usedUnitFee + '">' + filterOilAndGasType(resourceGrade) + '</option>';
            }
            $venderResourceId.html(option);
            $price.html(venderResourceList[0].usedUnitFee);
            $(".content").removeClass("dis-n");
            $.hidePreloader();
        } else {
            $.alert(response.retMsg || '操作失败');
        }
    })
    /*选择类型*/
    $(document).on("change", "#resourceGrade", function () {
        var price = setNumFixed2(selectedDOM("#resourceGrade").attr("data-unit"));
        $(".price").html(price);
        $consumFee.val('');
        $amount.html('');
        $total.val('');
    })
    /*根据数量计算金额*/
    $(document).on("input", ".total", function () {
        var total_num = $(this).val();
        var price = $price.text();
        var amount_total = total_num * price;
        amount_total = amount_total > 0 ? setNumFixed_2(amount_total) : '';
        $consumFee.val(amount_total);
        $amount.html(amount_total);
        if($amount_box.hasClass("dis-n")){
            $amount_box.removeClass("dis-n");
        }
    })
    /*根据金额计算数量*/
    $(document).on("input", "#consumFee", function () {
        var consumFee = $(this).val();
        var price = $price.text();
        var total_num = consumFee / price;
        total_num = total_num > 0 ? setNumFixed2(total_num) : '';
        $total.val(total_num);
        $amount.html(consumFee);
    })
    $("#carNum").on("click",function () {
        var carType = $(this).val();
        if (carType == "") {
            pageGo("register-added");
        }
    })
    /*提交支付*/
    $(document).on("click", "#submit", function () {
        var amount = $consumFee.val();
        var total = $total.val();
        var carType = $("#carNum").val();
        if (carType == "") {
            $.alert("您的信息不完善，请先去完善信息" || '操作失败','',function () {
                pageGo("register-added");
            });
            return;
        }
        if (amount > 0 && total > 0) {
            var type = selectedDOM("#pay_type").val();
            if (type == 1) {
                ajaxRequests("/driverInfo/checkPayPwdExist","get",{},function (response) {
                    if (response.retCode === '0') {
                        /*密码校验*/
                        $.prompt('请输入支付密码', function (value) {
                            ajaxRequests('/driverInfo/driverCheckPayPwd','post',{
                                "body":  {
                                    'payPwd': value
                                }
                            },function (result) {
                                if (result.retCode === '0') {
                                    submitPay();//提交支付
                                } else {
                                    $.alert(result.retMsg || '操作失败');
                                }
                            })
                        });
                    } else {
                        $.alert(response.retMsg||"去设置支付密码",'',function () {
                            pageGo("setPassWord");
                        });
                    }
                })
            }else{
                submitPay(function (response) {
                    /*var params = {
                        WIDout_trade_no:response.data.billDetailId,
                        WIDsubject:filterGoodsTypes(response.data.consumCategory)+response.data.consumFee+"元",
                        total_amount:setNumFixed_2(response.data.consumFee),
                        WIDbody:typeName
                    }*/
                    var params = {
                        "widoutTradeNo":response.data.billDetailId + "01",
                        "widsubject":filterGoodsTypes(response.data.consumCategory)+response.data.consumFee+"元",
                        "widtotalAmount":setNumFixed_2(response.data.consumFee),
                        "widbody":typeName
                    }
                    if (type == 2) {
                        wxPay(params);
                    }
                    if (type == 3) {
                        alipayPay(params);
                    }
                });
            }
        }else{
            $.toast('请输入消费金额和数量',2000,'custom-toast');
        }
    })
    function submitPay(callback) {
        var carNum = $("#carNum").val();
        var venderResourceId = $("#resourceGrade").val();
        var consumCategory = 1;
        var resourceOutDeviceNo = $("#resourceOutDeviceNo").val();
        var payType = $("#pay_type").val();
        var consumFee = setNumFixed_2($consumFee.val());
        var payUseAmountType = selectedDOM("#pay_type").attr("data-payUseAmountType");
        if(!venderResourceId){
            $.toast('请先选择油气资源',2000,'custom-toast');
            return false;
        }else if(!consumFee){
            $.toast('请输入消费金额',2000,'custom-toast');
            return false;
        }else if(!resourceOutDeviceNo){
            $.toast('请先选择喷枪号再支付',2000,'custom-toast');
            return false;
        }else if(!payType){
            $.toast('请先选择付款方式再支付',2000,'custom-toast');
            return false;
        }else{
            ajaxRequests('/driverPay/pay',"post",{
                body: {
                    venderId: id,
                    venderResourceId: venderResourceId,
                    consumCategory: consumCategory,
                    carNum: carNum,
                    resourceOutDeviceNo: resourceOutDeviceNo,
                    consumFee: consumFee,
                    payType: payType,
                    payUseAmountType: payUseAmountType
                }
            },function (response) {
                if (response.retCode === '0') {
                    if (payType != 1) {
                        if (response.data.returnGiftAmount > 0) {
                            $.alert("支付完成后，您将获得平台返现的" + response.data.returnGiftAmount + "能源豆", '', function () {
                                callback && callback(response);
                            });
                        } else {
                            callback && callback(response);
                        }
                    }else{
                        pageGo("consumerList");
                    }
                } else if(response.retCode === '2000'){
                    $.alert('还差'+response.data.consumFeeRemainder+','+response.retMsg,'',function () {
                        var consumFee = response.data.consumFeeRemainder;
                        var price = $price.text();
                        var total_num = consumFee / price;
                        total_num = total_num > 0 ? setNumFixed2(total_num) : '';
                        $total.val(total_num);
                        $amount.html(consumFee);
                        $("#consumFee").val(consumFee);
                    });
                }else {
                    $.alert(response.retMsg,'',function () {
                       pageReload();
                    });
                }
            })
        }
    }
    function alipayPay(params) {
        /*$("#WIDout_trade_no").val(params.WIDout_trade_no);
        $("#WIDsubject").val(params.WIDsubject);
        $("#WIDtotal_amount").val(params.total_amount);
        $("#WIDbody").val(params.WIDbody);
        $("#token").val(getCookie("token"));
        $("#payform").attr("action",BASE_URL+'/driverPayPage/alipay/pay').submit();*/
       
        ajaxRequests("/driverPayPage/appAlipay/pay","post",{
            body: params
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
                pageGo("consumerList");
            }, function(err) {
                // 打开支付失败页面
                $.toast('支付失败', 2000, 'custom-toast');
                pageGo("consumerList");
            });
        })
    }
    
    function wxPay(params) {
    	/*var payTypes;
    	getAPPMethod(function(){
    		payTypes ="Android";
    	},function(){
    		payTypes ="IOS";
    	},function(){
    		payTypes ="Wap";
    	})
    	// setCookie("site_wx_status",'wxPay');
        $("#out_trade_no").val(params.WIDout_trade_no);
        $("#total_fee").val(params.total_amount);
        $("#body").val(params.WIDbody);
        $("#payType").val(payTypes);
        $("#token").val(getCookie("token"));
        $("#payform").attr("action",BASE_URL+'/driverPayPage/webChat/payPage').submit();*/
       
       	var wxpayParams = {
            "outTradeNo": params.widoutTradeNo,
            "totalFee": params.widtotalAmount,
            "body": params.widbody
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
		        pageGo("consumerList");
			}, function (reason) {
                $.toast('失败:' + reason, 2000, 'custom-toast');
                pageGo("consumerList");
			});
	    });
    }
    // var site_wx_status = getCookie("site_wx_status");
    // if(site_wx_status&&site_wx_status=="wxPay"){
    // 	delCookie("site_wx_status");
    // 	pageGo("consumerList");
    // }
    $.init();
    }
//});