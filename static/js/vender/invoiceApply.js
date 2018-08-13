/**
 * Created by Administrator on 2018/4/18.
 */
;//$(function () {
summerready = function(){
    'use strict';
    var id = getQueryString("id");
    var taxId;
    var invoiceTitle;
    var userName;
    var userMobile;
    var amount;
    var $begin_city_picker = $("#begin_city_picker");
    setAddressChoose("#begin_city_picker",'选完请点击确定按钮');
    ProvinceCityDistrict(".address1 ");//地址三级联动
    $(document).on("click",".close-picker",function () {
        var item = $(".address-choose.active");
        addressId(item);
    })
    //获取初始数据
    ajaxRequests('/venderInvoiceApply/oilGasInvoiceApplyPre', 'post', {
        "body": {
            rechargeDetailId: id
        },
    }, function (response) {
        if (response.retCode === '0') {
            var rechargeDetailData = response.data.rechargeDetail;
            var venderData = response.data.vender;
                taxId = venderData.taxId;
            invoiceTitle = venderData.invoiceTitle;
            userName = venderData.userName;
            userMobile = venderData.mobile;
            amount = rechargeDetailData.allowInvoiceAmount;
            var data = {
                rechargeAmount:rechargeDetailData.rechargeAmount,
                allowInvoiceAmount:rechargeDetailData.allowInvoiceAmount,
                rechargeMethod:getRechargeMethod(rechargeDetailData.rechargeMethod),
                userMobile:rechargeDetailData.userMobile,
                rechargeTime:timestampToTime(rechargeDetailData.rechargeTime/ 1000),
                invoiceTitle:invoiceTitle,
                taxId:taxId,
            }
            console.log(data);
            addItem("#list",data,"#listDom");
            console.log(response);
        }
    })

    //申请发票
    $("#submit").on("click", function () {
        //地址拼接
        var receiptorAddress = $begin_city_picker.val()+$("#detailAddress").val();
        var receiptorMobile = $("#receiptorMobile").val();
        var receiptorName = $("#receiptorName").val();
        var postcode = $("#postcode").val();
        var voiceType = $("input[name='voiceType']").val();
        ajaxRequests('/venderInvoiceApply/oilGasInvoiceApply', 'post', {
            "body": {
                userName: userName,
                userMobile: userMobile,
                title: invoiceTitle,
                amount: amount,
                taxId: taxId,
                receiptorAddress: receiptorAddress,
                receiptorMobile: receiptorMobile,
                receiptorName: receiptorName,
                postcode: postcode,
                voiceType: voiceType,
                rechargeDetailId: id

            },
        }, function (response) {
            if (response.retCode === '0') {
                console.log(response);
                window.history.back();
            } else {
                $.alert(response.retMsg || '收款失败');
            }
        })
    })
    $.init();
    }
//});

