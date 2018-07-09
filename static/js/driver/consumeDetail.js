/**
 * Created by Administrator on 2018/4/1.
 */
;$(function () {
    var id = getQueryString("id");
    var mode = getQueryString("mode");
    var type = getQueryString("type");
    var params = getQueryString("params");
    var infoId = '';
    var pay_for_params = {};
    if (type == "receipt") {
        ajaxRequests('/driverPay/driverQRCode/' + params,'get','',function (response) {
            if (response.retCode === '0') {
                /*加载模板数据*/
                response.data.resourceGrade = filterOilAndGasType(response.data.resourceGrade);
                infoId = response.data.id;
                pay_for_params = {
                    venderId: response.data.venderId,
                    venderResourceId: response.data.venderResourceId,
                    consumCategory: response.data.consumCategory,
                    carNum: response.data.carNum,
                    resourceOutDeviceNo: response.data.resourceOutDeviceNo,
                    consumFee: response.data.consumFee,
                    payUseAmountType: response.data.payUseAmountType,
                    payOrigin: "receipt"
                }
                addItem("#list", response.data, ".list-block ul");
                if (mode && mode == 2) {
                    $(".content-block").removeClass("dis-n");
                }
            } else {
                $.toast(response.retMsg || '操作失败', 2000, 'custom-toast');
            }
        })
    }else{
        ajaxRequests('/driverBillDetail/billDetail/' + id,'get','',function (response) {
            if (response.retCode === '0') {
                /*加载模板数据*/
                response.data.consumTime = timestampToTime(response.data.consumTime/ 1000);
                response.data.resourceGrade = filterOilAndGasType(response.data.resourceGrade);
                infoId = response.data.id;
                addItem("#list", response.data, ".list-block ul");
                pay_for_params = {
                    unitFee:response.data.unitFee,
                    venderId: response.data.venderId,
                    resourceType: response.data.resourceType,
                    resourceGrade: response.data.resourceGrade,
                    venderResourceId: response.data.venderResourceId,
                    consumCategory: response.data.consumCategory,
                    carNum: response.data.carNum,
                    resourceOutDeviceNo: response.data.resourceOutDeviceNo,
                    consumFee: response.data.consumFee,
                    payType: response.data.payType
                }
                if (mode && mode == 2 || response.data.billStatus == 0) {
                    $(".content-block").removeClass("dis-n");
                }
            } else {
                $.toast(response.retMsg || '操作失败', 2000, 'custom-toast');
            }
        })
    }
    /*支付未支付订单*/
    $(document).on("click","#submit",function () {
        console.log(pay_for_params.payType)
        if (pay_for_params.payOrigin == "receipt") {
            var buttons1 = [
                {
                    text: '请选择',
                    label: true
                },
                {
                    text: '个人账户',
                    onClick: function() {
                        pay_for_params.payType = 1;
                        pay_for_params.payUseAmountType = 1;
                        accountPay(pay_for_params);
                    }
                },
                {
                    text: '转账账户',
                    onClick: function() {
                        pay_for_params.payType = 1;
                        pay_for_params.payUseAmountType = 2;
                        accountPay(pay_for_params);
                    }
                },
                {
                    text: '支付宝',
                    onClick: function() {
                        pay_for_params.payType = 3;
                        submitPay(function(response){
                        	var params = {
        	                            WIDout_trade_no:response.data.billDetailId,
        	                            WIDsubject:filterGoodsTypes(pay_for_params.consumCategory)+pay_for_params.consumFee+"元",
        	                            total_amount:pay_for_params.consumFee,
        	                            WIDbody:'订单支付'
        	                        }
        	                        alipayPay(params);
                        	})
                    }
                },
                {
                    text: '微信',
                    onClick: function() {
                        pay_for_params.payType = 2;
                        submitPay(function(response){
                        	var params = {
        	                            WIDout_trade_no:response.data.billDetailId,
        	                            WIDsubject:filterGoodsTypes(pay_for_params.consumCategory)+pay_for_params.consumFee+"元",
        	                            total_amount:pay_for_params.consumFee,
        	                            WIDbody:'订单支付'
        	                        }
                        	 		wxPay(params);
                        	})
                    }
                }
            ];
            var buttons2 = [
                {
                    text: '取消',
                    bg: 'danger'
                }
            ];
            var groups = [buttons1, buttons2];
            $.actions(groups);
        }else{
            switch (pay_for_params.payType){
                case 2:
                    pay_for_params.payType = 2;
                    var params = {
                        WIDout_trade_no:getQueryString("id"),
                        WIDsubject:filterGoodsTypes(pay_for_params.consumCategory)+pay_for_params.consumFee+"元",
                        total_amount:pay_for_params.consumFee,
                        WIDbody:'订单支付'
                    }
                    wxPay(params);
                    break;
                case 3:
                    pay_for_params.payType = 3;
                    var params = {
                        WIDout_trade_no:getQueryString("id"),
                        WIDsubject:filterGoodsTypes(pay_for_params.consumCategory)+pay_for_params.consumFee+"元",
                        total_amount:pay_for_params.consumFee,
                        WIDbody:'订单支付'
                    }
                    alipayPay(params);
                    break;
            }
        }
    });
    function submitPay(callback) {
        ajaxRequests('/driverPay/pay',"post",{
            body: pay_for_params
        },function (response) {
            if (response.retCode === '0') {
                if (pay_for_params.payType != 1) {
                    callback && callback(response);
                }else{
                    $.alert(response.retMsg||'支付成功','',function () {
                        pageGo("consumerList");
                    });
                }
            } else if(response.retCode === '2000'){
                $.alert('还差'+response.data.consumFeeRemainder+','+response.retMsg,'',function () {
                    window.location.reload();
                });
            }else{
                $.alert(response.retMsg,'',function () {
                    pageReload();
                });
            }
        })
    }
    function alipayPay(params) {
        $("#WIDout_trade_no").val(params.WIDout_trade_no+"01");
        $("#WIDsubject").val(params.WIDsubject);
        $("#WIDtotal_amount").val(params.total_amount);
        $("#WIDbody").val(params.WIDbody);
        $("#token").val(getCookie("token"));
        $("#payform").attr("action",BASE_URL+'/driverPayPage/alipay/pay').submit();
    }
    function wxPay(params) {
        var payTypes;
        getAPPMethod(function(){
            payTypes ="Android";
        },function(){
            payTypes ="IOS";
        },function(){
            payTypes ="Wap";
        })
        // setCookie("consume_wx_status",'wxPay');
        $("#out_trade_no").val(params.WIDout_trade_no+"01");
        $("#total_fee").val(params.total_amount);
        $("#body").val(params.WIDbody);
        $("#payType").val(payTypes);
        $("#token").val(getCookie("token"));
        $("#payform").attr("action",BASE_URL+'/driverPayPage/webChat/payPage').submit();
    }
    function accountPay(params) {
        if (params.consumFee > 0) {
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
            $.toast('消费金额小于0，请重新扫码',2000,'custom-toast');
        }
    }
    // var consume_wx_status = getCookie("consume_wx_status");
    // if (consume_wx_status && consume_wx_status == "wxPay") {
    //     delCookie("consume_wx_status");
    //     pageGo("consumerList");
    // }
    $.init();
})