/**
 * Created by Administrator on 2018/4/6.
 */
$(function () {
    var id = getQueryString("id");
    //生成燃料类型选择
    var $resourceType = $("#resourceType");//燃料类型选择
    var vender_resource = config.vender_resource;
    var companyType = getCookie("companyType");
    //初始化燃料类型
    function initResourceTypeDom() {
        var resourceTypeTpl = '<option value="">请选择燃料类型</option>';
        vender_resource.forEach(function (v, idx) {
            if (companyType == 1) {
                if (v.id == 1 || v.id == 2) {
                    resourceTypeTpl += '<option value="' + v.id + '" data-idx = "' + idx + '">' + v.name + '</option>';
                }
            }
            if(companyType == 2){
                if (v.id == 3) {
                    resourceTypeTpl += '<option value="' + v.id + '" data-idx = "' + idx + '">' + v.name + '</option>';
                }
            }
        })
        $resourceType.html(resourceTypeTpl);
        // initResourceGradeDom(0);
    }

    initResourceTypeDom();
    //初始化燃料详情
    function initResourceGradeDom(Indexes) {
        if (Indexes != '') {
            var listData = vender_resource[Indexes].subclass;
            var tpl = '';
            listData.forEach(function (v) {
                tpl += '<option value="' + v.type + '">' + v.name + '</option>';
            })
            $("#resourceGrade").html(tpl);
        }else{
            var tpl = '<option value="">请选择燃料详情</option>';
            $("#resourceGrade").html(tpl);
        }
    }
    //添加修改站点资源信息
    $("#submit").on("click", function () {
        var params = {
            resourceType: $resourceType.val(),
            resourceGrade: selectedDOM("#resourceGrade").val(),
            applyUnitFee: $("#applyUnitFee").val(),
            storeStatus: $("input[name='storeStatus']").val()
        }
        if(id){
            params.id = id;
        }
        ajaxRequests('/venderResource/venderResourceOilGasAddOrUpdate', 'post', {
            "body": params
        }, function (response) {
            if (response.retCode === '0') {
                pageGo("OilAndGasList");
            } else {
                $.toast(response.retMsg || '添加失败', 2000, 'custom-toast');
            }
        });
    });
    //燃料详情选择
    $resourceType.on("change", function () {
        var idx = selectedDOM("#resourceType").attr("data-idx");
        initResourceGradeDom(idx);
    })
    if(id){
        ajaxCompleteRequests("/venderResource/venderResourceDetail/"+id,"get","",function (response) {
            if (response.retCode === '0') {
                $resourceType.val(response.data.resourceType);
                var idx = selectedDOM("#resourceType").attr("data-idx");
                initResourceGradeDom(idx);
                $("#resourceGrade").val(response.data.resourceGrade);
                $("#applyUnitFee").val(response.data.applyUnitFee);
            } else {
                $.alert('网络异常,刷新后获取', "", function () {
                    window.location.reload();
                });
            }
        })

    }
    $.init();
})
