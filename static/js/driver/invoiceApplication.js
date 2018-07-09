;$(function () {
    $.showPreloader();
    var $city_picker = $("#city_picker");
    var $address = $("#address");
    setAddressChoose("#city_picker",'请选择邮寄地址');
    var type = getQueryString("type");
    var amount = getCookie("amount");
    var billDetails = getCookie("billDetails");
    $("#amount").text(amount);
    $("#invoiceAmount").text(amount);
    var params;
    var postFee;
    ajaxRequests('/driverInfo/getPostFee','get','',function (response) {
        if (response.retCode === '0') {
            postFee = response.data;
            $("#postFee").html(postFee);
            $.hidePreloader();
            $(".content").removeClass("dis-n");
        }else{
            pageReload();
        }
    })
    $(document).on("click","#pay",function () {
        var billDetails = getCookie("billDetails");
        var receiptorAddress = $city_picker.val()+$address.val();
        var receiptorName = $("#receiptorName").val();
        var receiptorMobile = $("#receiptorMobile").val();
        var postcode = $("#postcode").val();
        var invoiceType = $("input[name='invoiceType']:checked").val();
        var payUseAmountType = $("#pay_type").val()
        params = {
            billDetails: billDetails.split(","),
            amount: getCookie("amount"),
            postFee: postFee,
            receiptorAddress:receiptorAddress,
            receiptorMobile:receiptorMobile,
            receiptorName:receiptorName,
            postcode:postcode,
            invoiceType:invoiceType,
            title:'个人',
            taxId:111,
            invoiceNo:111,
            payUseAmountType:payUseAmountType
        }
        if(receiptorName==""){
            $.alert("接收方姓名不可为空");
            return;
        }else if(receiptorMobile==""){
            $.alert("接收方手机号不可为空");
            return;
        }else if(receiptorAddress==""){
            $.alert("邮寄地址不可为空");
            return;
        }else if(postcode==""){
            $.alert("邮政编码不可为空");
            return;
        }else{
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
        }
    })
    $(document).on("click",".close-picker",function () {
        var item = $(".address-choose");
        addressId(item);
    })
    function submitPay() {
        ajaxRequests('/driverBillDetail/driverInvoiceApply','post',{body:params},function (result) {
            if (result.retCode === '0') {
                $.alert(result.retMsg,'',function () {
                    delCookie("billDetails");
                    delCookie("amount");
                    pageBack();
                });
            } else {
                $.toast(result.retMsg || '申请失败', 2000, 'custom-toast');
            }
        })
    }
    $.init();
})
