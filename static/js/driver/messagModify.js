/**
 * Created by Administrator on 2018/4/1.
 */
$(function () {
    $.showPreloader();
    var type = getQueryString('type');
    var id = getQueryString('id');
    var $begin_city_picker = $("#begin_city_picker");
    var $end_city_picker = $("#end_city_picker");
    var $beginAddress = $("#beginAddress");
    var $endAddress = $("#endAddress");
    var $leaveTime = $("#leaveTime");
    var $infoDetail = $("#infoDetail");
    var $infoPicPathUrl = $("#infoPicPathUrl");
    var $infoPicPath =$("#infoPicPath");
    var $infoTitle =$("#infoTitle");
    type = parseInt(type);
    var params;
    if (type == 1) {
        var carTypeData = config.vehicle_type;
        var carTypeTmpl = '';
        carTypeData.forEach(function (v) {
            carTypeTmpl+="<option value='"+v.type+"'>"+v.name+"</option>";
        })
        $("#carType").html(carTypeTmpl);
        setAddressChoose("#begin_city_picker",'选择起始地址');
        setAddressChoose("#end_city_picker",'目的地');
    }
    $leaveTime.datetimePicker({
        value: getCurrentTime()
    });
    $infoPicPathUrl.on("click",function () {
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
    $(document).on("click", "#submit", function (e) {
        var infoDetail = $infoDetail.val();
        var infoTitle = $infoTitle.val();
        var testResult = true;
        if(type == 3 ||type ==4){
            params = {
                id: id,
                infoType: type,
                infoDetail: infoDetail,
                infoTitle:infoTitle
            }
            if(isNUll(infoTitle)){
                $.alert("信息标题不可为空", '', function () {
                    testResult = false;
                    return false;
                });
            }else if (isNUll(infoDetail)) {
                $.alert("信息描述不可为空", '', function () {
                    testResult = false;
                    return false;
                });
            }else{
                ajaxRequests('/driverNoticeInfo/driverEditPublishInfo', 'post', {
                    "body": params,
                }, function (response) {
                    if (response.retCode === '0') {
                        $.alert(response.retMsg, '', function () {
                            pageBack();
                        })
                    } else {
                        $.alert(response.retMsg || '修改失败');
                    }
                })
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
            var beginAddress = $beginAddress.val();
            var endAddress = $endAddress.val();
            params = {
                id: id,
                infoType: 1,
                leaveTime: $leaveTime.val()+":00",
                infoDetail: $infoDetail.val(),
                carType: $("#carType").val(),
                carTypeDesc: selectedDOM("#carType").text(),
                infoTitle:infoTitle
            }
            if (beginProvinceId) {
                params.beginProvinceId = beginProvinceId;
                params.beginProvinceName = beginProvinceName;
                params.beginCityId = beginCityId;
                params.beginCityName = beginCityName;
                params.beginCountyId = beginCountyId;
                params.beginCountyName = beginCountyName;
            }
            if(beginAddress){
                params.beginAddress = beginAddress;
            }
            if (endProvinceId) {
                params.endProvinceId = endProvinceId;
                params.endProvinceName = endProvinceName;
                params.endCityId = endCityId;
                params.endCityName = endCityName;
                params.endCountyId = endCountyId;
                params.endCountyName = endCountyName;
            }
            if(endAddress){
                params.endAddress = endAddress;
            }
            if($infoPicPath.val()){
                params.infoPicPath = $infoPicPath.val();
            }else{
                params.infoPicPath = '';
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
            if (testResult) {
                ajaxRequests('/driverNoticeInfo/driverEditPublishInfo', 'post', {
                    "body": params,
                }, function (response) {
                    if (response.retCode === '0') {
                        $.alert(response.retMsg, '', function () {
                            pageBack();
                        })
                    } else {
                        $.alert(response.retMsg || '修改失败');
                    }
                })
            }
        }

    })
    $(document).on("click",".address-choose",function () {
        $(".address-choose").removeClass("active");
        $(this).addClass("active");
    })
    $(document).on("click",".close-picker",function () {
        var item = $(".address-choose.active");
        addressId(item);
    })
    ajaxRequests('/driverInformationRelease/getInformationRelease/' + id, "get", "", function (response) {
        if (response.retCode === '0') {
            $.hidePreloader();
            $(".content").removeClass("dis-n");
            var data = response.data;
            /*加载模板数据*/
            $("#carType").val(data.carType);
            $infoPicPathUrl.attr("src", data.infoPicPath ? '/app'+data.infoPicPath : '');
            $infoPicPath.val(data.infoPicPath);
            $infoTitle.val(data.infoTitle);
            $leaveTime.val(data.leaveTime?timestampToTime(data.leaveTime / 1000):"");
            $infoDetail.val(data.infoDetail);
            var beginAddress =  (response.data.beginProvinceName || "") + (response.data.beginCityName || "") +(response.data.beginCountyName || "") + (response.data.beginAddress || "");
            var endAddress = (response.data.endProvinceName || "") + (response.data.endCityName || "") + (response.data.endCountyName || "") +(response.data.endAddress || "");
            $begin_city_picker.val(beginAddress);
            $end_city_picker.val(endAddress);
            $beginAddress.val(data.beginAddress);
            $endAddress.val(data.endAddress);
        } else {
            $.toast(response.retMsg || '操作失败', 2000, 'custom-toast');
        }
    })
    $.init();
})
function setImage(path) {
    if (browser.versions.ios) {
        var pathSata = JSON.stringify(path)
        path =pathSata.imageUrl;
    }
    if(path){
        $("#infoPicPathUrl").attr("src","/app"+path);
        $("#infoPicPath").val(path);
    }
}