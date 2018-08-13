;//$(function () {
summerready = function(){
    'use strict';
    var id = getQueryString("id");
    var venderId = getCookie("id");
    var $venderResourceId = $("#venderResourceId");
    var $usedUnitFee = $("#usedUnitFee");
    var $consumNum = $("#consumNum");
    var $consumFee = $("#consumFee");
    //获取初始数据
    ajaxRequests('/venderBillDetail/oilGasReceivablesPre', 'post', {
        "body": {
            billDetailId: id
        },
    }, function (response) {
        if (response.retCode === '0') {
            var option='';
            var resourceOutDeviceNoTpl = '';
            var venderResourceList = response.data.venderResourceList;
            if (venderResourceList.length < 1) {
                $.alert("请先添加站点资源或等待资源审核通过再收款","",function () {
                    pageGo("OilAndGasList");
                })
            } else {
                $("#receipt").find(".list-block").removeClass("dis-n");
                for (var i = 0; i < venderResourceList.length; i++) {
                    var resourceGrade = venderResourceList[i].resourceGrade;
                    var resourceType = venderResourceList[i].resourceType;
                    if(resourceType==3){
                        var consumCategory = 2;
                    }else{
                        var consumCategory = 1;
                    }
                    option += '<option value="' + venderResourceList[i].id + '" data-unit="' + venderResourceList[i].usedUnitFee + '" data-consumCategory ="'+consumCategory+'">' + filterOilAndGasType(resourceGrade) + '</option>';
                }
                $venderResourceId.html(option);
                $usedUnitFee.val(response.data.venderResourceList[0].usedUnitFee);
            }
        }
    })

    /*油气类型选择*/
    $venderResourceId.on("change",function () {
        var unitFee = selectedDOM("#venderResourceId").attr("data-unit");
        $usedUnitFee.val(unitFee);
        $consumFee.val("");
        $consumNum.val("");
    })
    /*总价计算*/
    $consumNum.on('input',function () {
        if($(this).val()==""){
            $consumFee.val("");
        }else{
            var amount = $usedUnitFee.val()*$(this).val();
            $consumFee.val(setNumFixed2(amount));
        }
    })
    /*数量计算*/
    $consumFee.on('input',function () {
        if($(this).val()==""){
            $consumNum.val("");
        }else{
            var sumNum = $(this).val() / $usedUnitFee.val();
            $consumNum.val(setNumFixed2(sumNum));
        }
    })
    //收款
    $(".submit").on("click", function () {
        var type = $(this).attr("data-type");
        var venderResourceId = selectedDOM("#venderResourceId").val();
        var consumCategory = selectedDOM("#venderResourceId").data("data-consumCategory");
        var consumNum = $consumNum.val();
        var consumFee = $consumFee.val();
        var resourceOutDeviceNo = selectedDOM("#resourceOutDeviceNo").val();

        if(!venderResourceId){
            $.toast('请先选择油气资源',2000,'custom-toast');
            return false;
        }else if(!consumFee){
            $.toast('请输入消费金额',2000,'custom-toast');
            return false;
        }else if(!resourceOutDeviceNo){
            $.toast('请先选择喷枪号再支付',2000,'custom-toast');
            return false;
        }
        $(".mark").addClass("active");
        $(".pop").addClass("active");
    })
    $("#pay").on("click",function () {
        var type = $(this).attr("data-type");
        var venderResourceId = selectedDOM("#venderResourceId").val();
        var consumCategory = selectedDOM("#venderResourceId").data("data-consumCategory");
        var consumNum = $consumNum.val();
        var consumFee = $consumFee.val();
        var resourceOutDeviceNo = selectedDOM("#resourceOutDeviceNo").val();
        var mobile = $("#mobile").val();
        var validateCode = $("#validateCode").val();
        if(!mobile){
            $.toast('请先输入客户手机号',2000,'custom-toast');
            return false;
        }else if(!validateCode){
            $.toast('请先输入短信验证码',2000,'custom-toast');
            return false;
        }
        ajaxRequests('/venderBillDetail/oilGasReceivables', 'post', {
            "body": {
                venderResourceId: venderResourceId,
                consumNum: consumNum,
                consumFee: consumFee,
                resourceOutDeviceNo: resourceOutDeviceNo,
                mobile: mobile,
                validateCode: validateCode
            },
        }, function (response) {
            if (response.retCode === '0') {
                $(".mark").removeClass("active");
                $(".pop").removeClass("active");
                $("#mobile").val("");
                $("#validateCode").val("");
                $.alert(response.retMsg||'收款成功','',function () {
                    pageBack();
                })
            } else {
                $.alert(response.retMsg || '收款失败');
            }
        })
    })
    //关闭弹框
    $(document).on('click', '.mark', function () {
        $(".mark").removeClass("active");
        $(".pop").removeClass("active");
        $("#mobile").val("");
        $("#validateCode").val("");
    });
    //生成收款二维码
    $(".qrcode").on("click", function () {
        var venderResourceId = selectedDOM("#venderResourceId").val();
        var consumNum = $consumNum.val();
        var consumFee = $consumFee.val();
        var resourceOutDeviceNo = selectedDOM("#resourceOutDeviceNo").val();
        var mobile = $("#mobile").val();
        var validateCode = $("#validateCode").val();
        console.log(consumFee);
        if(!venderResourceId){
            $.toast('请先选择油气资源',2000,'custom-toast');
            return false;
        }else if(consumFee=="" && consumFee == 0){
            $.toast('请输入消费金额',2000,'custom-toast');
            return false;
        }else if(!resourceOutDeviceNo){
            $.toast('请先选择喷枪号',2000,'custom-toast');
            return false;
        }else {
            var param = {
                venderId: venderId,
                venderResourceId: venderResourceId,
                consumNum: consumNum,
                consumFee: consumFee,
                resourceOutDeviceNo: resourceOutDeviceNo
            }
            setCode(param);
        }
    })
    function setCode(params) {
        ajaxRequests('/venderBillDetail/oilGasQRCode', 'post', {
            "body": params,
        }, function (response) {
            if (response.retCode === '0') {
                // $("#qrcode").css("display","block");
                $("#qrcode").html("");
                console.log("https://m.zhongxinnengyuan.cn/app/html/driver/consumeDetail.html?mode=2&type=receipt&params="+response.data);
                var qrcode = new QRCode(document.getElementById("qrcode"), {
                    text:"https://m.zhongxinnengyuan.cn/app/html/driver/consumeDetail.html?mode=2&type=receipt&params="+response.data,
                    width: 128, //生成的二维码的宽度
                    height: 128, //生成的二维码的高度
                    colorDark : "#000000", // 生成的二维码的深色部分
                    colorLight : "#ffffff", //生成二维码的浅色部分
                    correctLevel : QRCode.CorrectLevel.H
                });
                var canvas=$("#qrcode").find('canvas').get(0);
                var data = canvas.toDataURL('image/jpg');
                var buttons1 = [
                    {
                        text: '<div style="width: 148px;height: 168px;margin: 0px  auto;"><img src="'+data+'" style="margin-top: 16px;padding: 2px;border: 1px solid #333;"></div>',
                        bold: true
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
            } else {
                $.alert(response.retMsg || '生成二维码失败');
            }
        })










    }
    $.init();
    }
//});