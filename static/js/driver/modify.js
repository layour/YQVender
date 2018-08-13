/**
 * Created by Administrator on 2018/3/29.
 */
;//$(function () {
summerready = function(){
    $.showPreloader();
    var  $city_picker = $("#city_picker");
    function getDriverInfo() {
        ajaxRequests('/driverInfo/info','get','',function (response) {
            if (response.retCode === '0') {
                var userName = response.data.userName;
                $("#userName").val(userName);
                $("#headImgPath").attr("src", BASE_URL+response.data.headImgPath);
                $("#headImgPath").attr("data-headImgPath", response.data.headImgPath);
                $("#sex").val(response.data.sex);
                $("#mobile").val(response.data.mobile);
                $("#carNum").val(response.data.carNum);
                $("#carNum").attr("readonly","readonly");
                if(response.data.carType==1){
                    $("#carType").val("加油车");
                }else {
                    $("#carType").val("加气车");
                }

                var address = (response.data.provinceName||"")+(response.data.cityName||"")+(response.data.countyName||"");
                $city_picker.val(address);
                $city_picker.attr("readonly","true");
                $('.content').removeClass("dis-n");
                $.hidePreloader();
            } else {
                $.toast(response.retMsg || '登录失败', 2000, 'custom-toast');
            }
        })
    }
    getDriverInfo();
    $("#headImgPath").on("click",function () {
        /* getAPPMethod(function () {
            if(window.gasstation){
                window.gasstation.getPhoto('modifyDriverInfo');
            }
        },function () {
            if(window.webkit){
                window.webkit.messageHandlers.getPhoto.postMessage("modifyDriverInfo");
            }
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
                    "msg" : "头像修改成功"
                });
                var photoPath = ret.data;
                $("#headImgPath").attr("src", BASE_URL + photoPath);
                $("#headImgPath").attr("data-headImgPath", photoPath);
                
            }, function(err) {
                summer.hideProgress();
                summer.toast({
                    "msg" : "头像修改失败"
                });
            });
        }
    })
    $(document).on("click","#save",function () {
        var id = getCookie("id");
        var headImgPath = $("#headImgPath").attr("data-headImgPath");
        var userName = $("#userName").val();
        var sex = selectedDOM("#sex").val();
        var provinceId = $city_picker.attr("data-provinceId");
        var provinceName = $city_picker.attr("data-provinceName");
        var cityId = $city_picker.attr("data-cityId");
        var cityName = $city_picker.attr("data-cityName");
        var countyId = $city_picker.attr("data-countyId");
        var countyName = $city_picker.attr("data-countyName");
        var mobile = $("#mobile").val();
        var params = {
            url:'/driverInfo/updateDriverInfo',
            type: 'post',
            data:{
                body:{
                    id:id,
                    headImgPath:headImgPath,
                    userName:userName,
                    sex:sex,
                    provinceId:provinceId,
                    provinceName:provinceName,
                    cityId:cityId,
                    cityName:cityName,
                    countyId:countyId,
                    countyName:countyName,
                    mobile:mobile
                }
            },
            callback:function (response) {
                if (response.retCode === '0') {
                    $.alert(response.retMsg,'',function () {
                        pageBack();
                    })
                }else{
                    $.toast(response.retMsg || '修改失败', 2000, 'custom-toast');
                }
            }
        }
        ajaxRequest(params);
    })
    setAddressChoose("#city_picker",'选完请点击确定按钮');
    $(document).on("click",".close-picker",function () {
        addressId($city_picker);
    })
    $.init();
    }
//})
function setImage(path) {
    if (browser.versions.ios) {
        path =path.imageUrl;
    }
    if(path){
        $("#headImgPath").attr("src","/app"+path);
        $("#headImgPath").attr("data-headImgPath",path);
    }
}