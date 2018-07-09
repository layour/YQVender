/**
 * Created by Administrator on 2018/4/9.
 */
;$(function () {
    $.init();
    $.showPreloader();
    var $businessLicensePath = $("#businessLicensePath");//营业执照
    var $gasLicensePath = $("#gasLicensePath");//燃气经营许可证
    var $dangerLicensePath = $("#dangerLicensePath");//危化品经营许可证
    var $oilLicensePath = $("#oilLicensePath");//成品油经营许可证
    var $invoicePath = $("#invoicePath");//发票信息图片
    var $sitePicPath = $("#sitePicPath");//油气站图片
    var type = parseInt(getCookie("companyType"));
    //判断要上传的资质
    switch (type) {
        case 1:
            $(".gasLicensePath").remove();
            // $(".sitePicPath").remove();
            break;
        case 2:
            $(".oilLicensePath").remove();
            // $(".sitePicPath").remove();
            break;
        case 3:
            $(".gasLicensePath").remove();
            $(".dangerLicensePath").remove();
            $(".oilLicensePath").remove();
            // $(".sitePicPath").remove();
            break;
    }
    $(".content").removeClass("dis-n");
    $.hidePreloader();
    //获取商家信息
    ajaxRequests('/venderInfo/info', 'get', {}, function (response) {
        if (response.retCode === '0') {
            $(".businessLicensePath  .photo").attr("src","/app"+response.data.businessLicensePath);
            $(".gasLicensePath  .photo").attr("src","/app"+response.data.gasLicensePath);
            $(".dangerLicensePath  .photo").attr("src","/app"+response.data.dangerLicensePath);
            $(".oilLicensePath  .photo").attr("src","/app"+response.data.oilLicensePath);
            $(".invoicePath  .photo").attr("src","/app"+response.data.invoicePath);
            $(".sitePicPath  .photo").attr("src","/app"+response.data.sitePicPath);
        }
    })

    $("#submit").on("click", function () {
        var businessLicensePath = $businessLicensePath.val();
        var gasLicensePath = $gasLicensePath.val();
        var dangerLicensePath = $dangerLicensePath.val();
        var oilLicensePath = $oilLicensePath.val();
        var invoicePath = $invoicePath.val();
        var sitePicPath = $sitePicPath.val();
        if(businessLicensePath||gasLicensePath||dangerLicensePath||oilLicensePath||invoicePath||sitePicPath){
            ajaxRequests('/venderInfo/venderEdit', 'post', {
                body: {
                    businessLicensePath: businessLicensePath==""?null:businessLicensePath,
                    gasLicensePath: gasLicensePath==""?null:gasLicensePath,
                    dangerLicensePath: dangerLicensePath==""?null:dangerLicensePath,
                    oilLicensePath: oilLicensePath==""?null:oilLicensePath,
                    invoicePath: invoicePath==""?null:invoicePath,
                    sitePicPath: sitePicPath==""?null:sitePicPath
                }
            }, function (response) {
                if (response.retCode === '0') {
                    $.alert(response.retMsg,'',function () {
                        pageGo("me");
                    });
                } else {
                    $.alert(response.retMsg);
                }
            })
        }else{
            $.toast("您还没有没有上传新的资质图片", 3000);
        }
    })
    /*上传*/
    $(document).on('click', '.upload', function () {
        var type  = $(this).attr("data-type");
        getAPPMethod(function () {
            if(window.gasstation){
                window.gasstation.getPhoto(type);
            }
        },function () {
            if(window.webkit){
                window.webkit.messageHandlers.getPhoto.postMessage(type);
            }
        },function () {
            $.alert('暂无图片上传功能');
        })
    })
})
function setImage(path,type) {
    if (browser.versions.ios) {
        path =path.imageUrl;
    }
    if(path){
        var itemBox = $("." + type);
        var url = path;
        var img = '<img src="/app' + url + '" class="photo"/>';
        itemBox.find(".imgBox").val(url);
        if(itemBox.find(".photo")){
        	itemBox.find(".photo").remove();	
        }
        itemBox.find(".item").append(img);
    }
};