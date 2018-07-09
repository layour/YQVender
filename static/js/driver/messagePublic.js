/**
 * Created by Administrator on 2018/4/1.
 */
$(function () {
    var type = getQueryString('type');
    var id = getQueryString('id');
    var $begin_city_picker = $("#begin_city_picker");
    var $end_city_picker = $("#end_city_picker");
    var isPay = true;
    type = parseInt(type);
    var $unit = $(".unit");
    var $infoNum = $(".infoNum");
    var $mobile = $("#mobile");
    var params;
    if (type == 1) {
        var carTypeData = config.vehicle_type;
        var carTypeTmpl = '';
        carTypeData.forEach(function (v) {
            carTypeTmpl+="<option value='"+v.type+"'>"+v.name+"</option>";
        })
        $("#carType").html(carTypeTmpl);
        setAddressChoose("#begin_city_picker",'选完请点击确定按钮');
        setAddressChoose("#end_city_picker",'选完请点击确定按钮');
    }
    $("#leaveTime").datetimePicker({
        value: getCurrentTime()
    });
    $("#infoPicPathUrl").on("click",function () {
        getAPPMethod(function () {
            if(window.gasstation){
                window.gasstation.getPhoto('messageInfo');
            }
        },function () {
            if(window.webkit){
                window.webkit.messageHandlers.getPhoto.postMessage("messageInfo");
            }
        })
    })
    /*验证手机号是否存在*/
    function isMobileExist() {
        var mobile = $mobile.val();
        var _li = $mobile.parents("li");
        var $error_tip = _li.find(".error-tip");
        var $check_icon = _li.find(".check-icon");
        var reg = /^1[3|4|5|7|8][0-9]\d{4,8}$/;//判断手机号的正则
        if (reg.test(mobile) && mobile.length === 11) {
            var params = {
                url: '/driverInfo/checkMobile/' + mobile,
                type: 'get',
                callback: function (response) {
                    if (response.retCode === '0') {
                        $error_tip.html("");
                        $check_icon.css("display", "block");
                        isPay =true;
                    } else {
                        isPay= false;
                        $error_tip.html(response.retMsg || "商家手机号与登录手机号不一致");
                        $check_icon.css("display", "none");
                    }
                }
            }
            ajaxRequest(params);
        } else {
            $error_tip.html("请输入正确的手机号");
            $check_icon.css("display", "none");
        }
    }
    ajaxRequests('/driverInformationRelease/getAllInformationFeeTemplate', 'get', {}, function (response) {
        if (response.retCode === '0') {
            addItem("#list",response,"#feeList");
            $(".item").eq(0).addClass("active");
            $unit.html(response.data[0].totalFee);
            $infoNum.html(response.data[0].days);
        } else {
            $.alert(response.retMsg || '发布失败');
        }
    })
    $(document).on("click","#feeList .item",function () {
        $("#feeList .item").removeClass("active");
        $(this).addClass("active");
        var totalFee = $(this).find(".money").html();
        var num = $(this).find(".num").html();
        $unit.html(totalFee);
        $infoNum.html(num);
    })
    $(document).on("click", "#next", function (e) {
        $(this).removeClass("open-popup");
        var infoDetail = $("#infoDetail").val();
        var infoTitle = $("#infoTitle").val();
        if(type == 3 ||type ==4){
            params = {
                infoType: type,
                infoTitle: infoTitle,
                infoDetail: infoDetail

            }
            if(isNUll(infoTitle)){
                $.alert("信息标题不可为空", '', function () {
                    return false;
                });
            }else if (isNUll(infoDetail)) {
                $.alert("信息描述不可为空", '', function () {
                    return false;
                });
            } else {
                $.popup('#registerPageTwo');
            }
        }else{
            var beginProvinceId = $begin_city_picker.attr("data-provinceId");
            var beginProvinceName = $begin_city_picker.attr("data-provinceName");
            var beginCityId = $begin_city_picker.attr("data-cityId");
            var beginCityName = $begin_city_picker.attr("data-cityName");
            var beginCountyId = $begin_city_picker.attr("data-countyId");
            var beginCountyName = $begin_city_picker.attr("data-countyName");
            var endProvinceId = $end_city_picker.attr("data-provinceId");
            var endProvinceName = $end_city_picker.attr("data-provinceName");
            var endCityId = $end_city_picker.attr("data-cityId");
            var endCityName = $end_city_picker.attr("data-cityName");
            var endCountyId = $end_city_picker.attr("data-countyId");
            var endCountyName = $end_city_picker.attr("data-countyName");
            params = {
                infoType: 1,
                infoTitle: infoTitle,
                infoPicPath: $("#infoPicPath").val(),
                beginProvinceId: beginProvinceId,
                beginProvinceName: beginProvinceName,
                beginCityId: beginCityId,
                beginCityName: beginCityName,
                beginCountyId: beginCountyId,
                beginCountyName: beginCountyName,
                beginAddress: $("#beginAddress").val(),
                endProvinceId: endProvinceId,
                endProvinceName: endProvinceName,
                endCityId: endCityId,
                endCityName: endCityName,
                endCountyId: endCountyId,
                endCountyName: endCountyName,
                endAddress: $("#endAddress").val(),
                leaveTime: $("#leaveTime").val()+":00",
                infoDetail: $("#infoDetail").val(),
                carType: $("#carType").val(),
                carTypeDesc: selectedDOM("#carType").text()
            }
            var testResult = true;
            for(var i in params){
               if(isNUll(params[i])){
                   switch (i){
                       case 'beginProvinceId':
                       case 'beginProvinceName':
                       case 'beginCityId':
                       case 'beginCityName':
                       case 'beginCountyId':
                       case 'beginCountyName':
                           $.alert("请重新选择起始地地址");
                           break;
                       case 'infoTitle':
                           $.alert("信息标题不可为空");
                           break;
                       case 'endProvinceId':
                       case 'endProvinceName':
                       case 'endCityId':
                       case 'endCityName':
                       case 'endCountyId':
                       case 'endCountyName':
                           $.alert("请重新选择目的地");
                           break;
                       case 'endCountyName':
                           $.alert("请重新选择目的地");
                           break;
                       case 'beginAddress':
                           $.alert("起始地详细地址不可为空");
                           break;
                       case 'endAddress':
                           $.alert("目的地详细地址不可为空");
                           break;
                       case 'leaveTime':
                           $.alert("出发时间不可为空");
                           break;
                       case 'infoDetail':
                           $.alert("信息描述不可为空");
                           break;
                       case 'infoPicPath':
                           $.alert("车源图片不可为空");
                           break;
                       case 'goodsType':
                           $.alert("货物类型不可为空");
                           break;
                       case 'carType':
                       case 'carTypeDesc':
                           $.alert("车型选择不可为空");
                           break;
                   }
                   testResult = false;
                   return false;
               }
            }
            if(testResult){
                $.popup('#registerPageTwo');
            }
        }
    })
    $("#mobile").blur(function () {
        isMobileExist();
    })
    $(document).on("click", "#submit", function () {
        var mobile = $mobile.val();
        var validateCode = $("#validateCode").val();
        if(isNUll(mobile)){
            $.alert("请输入联系人手机");
            isPay =false;
            return;
        }
        if(isNUll($("#validateCode").val())){
            $.alert("请输入短信验证码");
            isPay =false;
            return;
        }
        ajaxRequests("/driverInfo/checkPayValidateCode/"+mobile+"/"+validateCode,"get","",function (result) {
            if (result.retCode === '0') {
                isPay =true;
                if(isPay){
                    var id = $(".item.active").attr("data-id");
                    params.costTemplateId = id;
                    ajaxRequests('/driverNoticeInfo/driverPublishInfo', 'post', {
                        "body": params,
                    }, function (response) {
                        if (response.retCode === '0') {
                            $.alert(response.retMsg,'',function () {
                                window.location.href="./message.html?type=2";
                                // pageGo("myMessage");
                                // pageBack();
                            })
                        } else {
                            $.alert(response.retMsg || '发布失败');
                        }
                    })
                }
            } else {
                isPay =false;
                $.toast("短信验证码不正确，请重新输入", 3000);
            }
        })
    })
    $(document).on("click",".address-choose",function () {
        $(".address-choose").removeClass("active");
       $(this).addClass("active");
    })
    $(document).on("click",".close-picker",function () {
        var item = $(".address-choose.active");
        addressId(item);
    })
    $.init();
})
function setImage(path) {
    if (browser.versions.ios) {
        path =path.imageUrl;
    }
    if(path){
        $("#infoPicPathUrl").attr("src","/app"+path);
        $("#infoPicPath").val(path);
    }
}