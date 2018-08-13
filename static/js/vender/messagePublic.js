/**
 * Created by Administrator on 2018/4/1.
 */
;//$(function () {
summerready = function(){
    var type = getQueryString('type');
    type = parseInt(type);
    var $unit = $(".unit");
    var $infoNum = $(".infoNum");
    var $mobile = $("#mobile");
    var $begin_city_picker = $("#begin_city_picker");
    var $end_city_picker = $("#end_city_picker");
    var params;
    if (type == 1) {
        var goodsTypeData = config.goods_type;
        var goodsTypeTmpl = '';
        goodsTypeData.forEach(function (v) {
            goodsTypeTmpl+="<option value='"+v.type+"'>"+v.name+"</option>";
        })
        console.log(goodsTypeTmpl);
        $("#goodsType").html(goodsTypeTmpl);

        setAddressChoose("#begin_city_picker",'选完请点击确定按钮');
        setAddressChoose("#end_city_picker",'选完请点击确定按钮');
    }

    $("#leaveTime").datetimePicker({
        value: getCurrentTime()
    });

    $("#infoPicPathUrl").on("click",function () {
        /* getAPPMethod(function () {
            if(window.gasstation){
                window.gasstation.getPhoto('messageInfo');
            }
        },function () {
            if(window.webkit){
                window.webkit.messageHandlers.getPhoto.postMessage("messageInfo");
            }
        },function () {
            $.alert("请下载app再进行操作！");
        }) */
        UM.actionsheet({
            title : '',
            items : ['拍照', '从相册中选择'],
            callbacks : [camera, openPhotoAlbum]
        });
        function camera() {
            summer.openCamera({
                compressionRatio : 0.5,
                callback : function(ret) {
                    var imgPath = ret.compressImgPath;
                    upload(imgPath);
                }
            });
        }
        function openPhotoAlbum() {
            summer.openPhotoAlbum({
                compressionRatio : 0.5,
                callback : function(ret) {
                    var imgPath = ret.compressImgPath;
                    upload(imgPath);
                }
            });
        }
        // 把图片流上传用户中心
        function upload(path) {
            summer.showProgress();
            var fileArray = [];
            var item = {
                fileURL : path,
                type : "image/jpeg",
                name : "file" 
            };
            fileArray.push(item);
            summer.multiUpload({
                fileArray : fileArray,
                params : {},
                SERVER : BASE_URL + "/common/upload/uploadFile"
            }, function(ret) {
                summer.hideProgress();
                summer.toast({
                    "msg" : "上传成功"
                });
                var photoPath = ret.data;
                $("#infoPicPathUrl").attr("src", BASE_URL + photoPath);
                $("#infoPicPath").val(photoPath);
            }, function(err) {
                summer.hideProgress();
                summer.toast({
                    "msg" : "上传失败"
                });
            });
        }
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
                url: '/venderInfo/checkMobile/' + mobile,
                type: 'get',
                callback: function (response) {
                    if (response.retCode === '0') {
                        $error_tip.html("");
                        $check_icon.css("display", "block");
                        $mobile.attr("data-checkMobile","1");
                    } else {
                        $error_tip.html(response.retMsg || "商家手机号与登录手机号不一致");
                        $check_icon.css("display", "none");
                        $mobile.attr("data-checkMobile","0");
                    }
                }
            }
            ajaxRequest(params);
        } else {
            $error_tip.html("请输入正确的手机号");
            $check_icon.css("display", "none");
            $mobile.attr("data-checkMobile","0");
        }
    }
    ajaxRequests('/venderInformationRelease/getAllInformationFeeTemplate', 'get', {}, function (response) {
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
        var infoPicPath = $("#infoPicPath").val();
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
                infoTitle:infoTitle,
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
            var infoPicPath = $("#infoPicPath").val();
            if (isNUll(infoPicPath)) {
                var infoPicPath = '../../static/img/siteImg.jpg';
            }
            params = {
                infoType: 2,
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
                infoTitle: infoTitle,
                infoPicPath:infoPicPath,
                infoDetail: $("#infoDetail").val(),
                goodsType: selectedDOM("#goodsType").val()
            }
            console.log(params);
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
                       case 'beginAddress':
                           $.alert("起始地省详细地址不可为空");
                           break;
                       case 'endProvinceId':
                       case 'endProvinceName':
                       case 'endCityId':
                       case 'endCityName':
                       case 'endCountyId':
                       case 'endCountyName':
                           $.alert("请重新选择目的地");
                           break;
                       case 'endAddress':
                           $.alert("目的地详细地址不可为空");
                           break;
                       case 'infoTitle':
                           $.alert("信息标题不可为空");
                           break;
                       case 'leaveTime':
                           $.alert("出发时间不可为空");
                           break;
                       case 'infoDetail':
                           $.alert("信息描述不可为空");
                           break;
                       case 'infoPicPath':
                           $.alert("信息图片不可为空");
                           break;
                       case 'goodsType':
                           $.alert("货物类型不可为空");
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
        var id = $(".item.active").attr("data-id");
        params.costTemplateId = id;
        var mobile = $mobile.val();
        var sms = $("#validateCode").val();
        if(isNUll(mobile)){
            $.toast("请输入登录手机号", 2000, 'custom-toast');
            return;
        }else if(isNUll(sms)){
            $.toast("请输入短信验证码", 2000, 'custom-toast');
            return;
        }else{
            ajaxRequests("/venderInfo/checkPayValidateCode/"+mobile+"/"+sms,"get","",function (result) {
                if (result.retCode === '0') {
                    ajaxRequests('/venderInformationRelease/venderPublishInfo', 'post', {
                        "body": params,
                    }, function (response) {
                        if (response.retCode === '0') {
                            $.alert(response.retMsg || '发布成功',function () {
                                pageGo("myMessage");
                            });
                        } else {
                            $.alert(response.retMsg || '发布失败');
                        }
                    })
                }else{
                    $.toast("短信验证码不正确，请重新输入", 3000);
                }
            })

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
    $.init();
   }
//})
function setImage(path) {
    if (browser.versions.ios) {
        path =path.imageUrl;
    }
    if(path){
        $("#infoPicPathUrl").attr("src","/app"+path);
        $("#infoPicPath").val(path);
    }
};