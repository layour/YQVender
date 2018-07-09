/**
 * Created by zhujinyu on 2018/2/7.
 */
var BASE_URL = '/app';

/**渲染模板*/
function getRenderTmpl(tmpl, data_set) {
    var template = $(tmpl).html();
    Mustache.parse(template);
    var rendered = Mustache.render(template, data_set);
    return rendered;
}

function addItem(tmpl, data_set, obj) {
    var reg = /demo/;
    if (reg.test(obj)) {
        data_set.list.map(function (currentValue) {
            currentValue.star = new Array();
            currentValue.star.length = currentValue.starNum;
            return currentValue;
        });
    }
    var rendered = getRenderTmpl(tmpl, data_set);
    console.log(rendered);
    $(obj).append(rendered);
}

/*获取经纬度*/
var location_current;

function getLngLat() {
    var map = new AMap.Map("mapContainer", {
        resizeEnable: true
    });
    map.plugin('AMap.Geolocation', function () {
        geolocation = new AMap.Geolocation({
            enableHighAccuracy: true,//是否使用高精度定位，默认:true
            timeout: 10000,          //超过10秒后停止定位，默认：无穷大
            buttonOffset: new AMap.Pixel(10, 20),//定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
        });
        map.addControl(geolocation);
        geolocation.getCurrentPosition();
        AMap.event.addListener(geolocation, 'complete', onComplete);//返回定位信息
        AMap.event.addListener(geolocation, 'error', onError);      //返回定位出错信息
    });

    //解析定位结果
    function onComplete(data) {
        var str = [];
        str.push(data.position.getLng());
        str.push(data.position.getLat());
        console.log(str);
        location_current = str
    }

    //解析定位错误信息
    function onError(data) {
        console.log("定位失败");
    }
}

/**跳转到地图*/
$(document).on('click', '.navigation', function () {
    var location_end = $(this).attr("data-end").split(",");
    // getLngLat();
    // GoDestination(location_current, location_end);
    window.gasstation.mapLocation({
        lng: location_end[0],
        lat: location_end[0]
    });
})

function GoDestination(currentlocation, endLocation) {
    var map = new AMap.Map("mapContainer");
    AMap.plugin(["AMap.Driving"], function () {
        var drivingOption = {
            policy: AMap.DrivingPolicy.LEAST_TIME,
            map: map
        };
        var driving = new AMap.Driving(drivingOption); //构造驾车导航类
        driving.search(currentlocation, endLocation, function (status, result) {
            driving.searchOnAMAP({
                origin: result.origin,
                destination: result.destination
            });
        });
    });
}

/**ajax请求封装*/
function ajaxRequest(params) {
    var token = getCookie("token")
    $.ajax({
        headers: {
            Accept: "application/json; charset=utf-8",
            token:token
        },
        url: BASE_URL + params.url,
        type: params.type,
        dataType: 'json',
        data: JSON.stringify(params.data),
        contentType: 'application/json',
        async: params.async || true,
        success: function (response) {
            params.callback && params.callback(response);
        }
    })
}
/**验证码倒计时*/
function Time(obj, times) {
    times = parseInt(times);
    var t = setInterval(function () {
        if (times === 0) {
            obj.attr("data-end", 1);
            obj.css("background", "#f00");
            clearInterval(t);
        }
        times -= 1;
        obj.html(times + "秒");
    }, 1000)
}

/**上传图片*/
function fromImgRequest(params) {
    var fileUpload = document.getElementById("uploadForm");
    var data = new FormData(fileUpload);
    console.log(data.get('file'));
    var type = data.get('file').type;
    var size = data.get('file').size;
    var maxSize = 100 * 1024 * 1024;
    var reg = /image/;
    if (!reg.test(type)) {
        $.toast("请上传图片", 3000);
        return;
    } else if (size > maxSize) {
        $.toast("图片大小不能超过100M", 3000);
        return;
    }
    $.ajax({
        url: BASE_URL + params.url,
        headers: {
            'Lairen-X-Requested-With': 'H5/5.3.2 (OS 100; iPhone 100s)'
        },
        type: 'post',
        async: true,
        data: data,
        cache: true,
        contentType: false,
        processData: false,
        dataType: "multipart/form-data",
        success: function (response) {
            params.callback && params.callback(JSON.parse(response));
        },
        error: function () {
            $.toast("上传失败", 3000);
        }
    });
}

function getQueryString(name) {

    var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');

    var r = window.location.search.substr(1).match(reg);

    if (r != null) {

        return unescape(r[2]);

    }

    return null;

}

/*筛选可服务列表*/
function filter(datas) {
    if (!datas) {
        return;
    }
    var list = datas.split(",");
    var result = {
        isFirst: false,
        isSecond: false,
        isThree: false,
        isFour: false,
        isFive: false
    };
    list.forEach(function (value) {
        switch (value) {
            case '1':
                result.isFirst = true;
                break;
            case '2':
                result.isSecond = true;
                break;
            case '3':
                result.isThree = true;
                break;
            case '4':
                result.isFour = true;
                break;
            case '5':
                result.isFive = true;
                break;
        }
    })
    return result;
}

/*获取商家类型*/
function getType(companyTpe) {
    var siteInfo = {
        isFillingStation: false,
        isGAS: false,
        isLogisticsProviders: false,
        isFillingStation: false,
        title: ''
    }
    switch (parseInt(companyTpe)) {
        case 1:
            siteInfo.isFillingStation = true;
            siteInfo.title = "加油站";
            siteInfo.btnName = '一键加油';
            break;
        case 2:
            siteInfo.isGAS = true;
            siteInfo.title = "加气站";
            siteInfo.btnName = '一键加气';
            break;
        case 3:
            siteInfo.isLogisticsProviders = true;
            siteInfo.title = "物流商";
            break;
        case 4:
            siteInfo.isbusinesses = true;
            siteInfo.title = "其他商家";
            break;
    }
    return siteInfo;
}
/*货物类型过滤*/
function filterGoodsTypes(type) {
    var typeName = '';
    switch (type){
        case 1:
            typeName = '汽油';
            break;
        case 2:
            typeName = '柴油';
            break;
        case 3:
            typeName = '天然气';
            break;
        case 4:
            typeName = '液化气';
            break;
    }
    return typeName;
}
/*商家类型过滤*/
function filterCompanyTypes(type) {
    var typeName = '';
    switch (type){
        case 1:
            typeName = '加油站';
            break;
        case 2:
            typeName = '加气站';
            break;
    }
    return typeName;
}
/*时间戳转化为日期*/
function timestampToTime(timestamp) {
    var date = new Date(timestamp * 1000);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
    Y = date.getFullYear() + '-';
    M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
    D = date.getDate() + ' ';
    h = date.getHours() + ':';
    m = date.getMinutes() + ':';
    s = date.getSeconds();
    return Y+M+D+h+m+s;
}
//设置cookies
function setCookie(name,value){
    var Days = 30;
    var exp = new Date();
    exp.setTime(exp.getTime() + Days*24*60*60*1000);
    document.cookie = name + "="+ escape (value) + ";expires=" + exp.toGMTString()+";path=/";
}

//读取cookies
function getCookie(name){
    var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");

    if(arr=document.cookie.match(reg))

        return unescape(arr[2]);
    else
        return null;
}

//删除cookies
function delCookie(name){
    var exp = new Date();
    exp.setTime(exp.getTime() - 1);
    var cval=getCookie(name);
    if(cval!=null)
        document.cookie= name + "="+cval+";expires="+exp.toGMTString();
}
//判断是否为空
function isNUll(param) {
    if (param == "" || typeof(param) == "undefined") {
        return true;
    } else {
        return false;
    }
}
//获取select选中值
function selectedDOM(obj) {
    return $(obj).find("option").not(function(){ return !this.selected });
}
/*三级联动*/
function ProvinceCityDistrict(range) {
    function addIndex(data){
        for(var i=0;i<data.children.length;i++){
            data.children[i].index=i;
        }
        return data;
    }
    var addressData='';
    $.getJSON('../../static/js/lib/address.json',function (data) {
        addressData = {children: data};
        var datas = {children: data};
        addItem("#option",addIndex(datas),range+".province-box");
    })
    function resetSelect(obj) {
        selectedDOM(obj).text("请选择");
        selectedDOM(obj).val("");
    }
    $(document).on("change",range+".address",function () {
        var _this = $(this);
        var type = _this.attr("data-type");
        switch (type){
            case 'province':
                $(range+".city-box").html("");
                $(range+".county-box").html("");
                var val = _this.find("option").not(function(){ return !this.selected }).attr("data-id");
                $(this).attr("current-index",val);
                addItem("#option",addIndex(addressData.children[val]),range+".city-box");
                resetSelect(_this.parents(".address-box").find(".city"));
                resetSelect(_this.parents(".address-box").find(".county"));
                break;
            case 'city':
                $(range+".county-box").html("");
                var val = $(range+".province").find("option").not(function(){ return !this.selected }).attr("data-id");
                var vals = $(this).find("option").not(function(){ return !this.selected }).attr("data-id");
                $(this).attr("current-index",vals);
                addItem("#option",addIndex(addressData.children[val].children[vals]),range+".county-box");
                resetSelect(_this.parents(".address-box").find(".county"));
                break;
        }
    })
}
//消费类别
function consumType(type) {
    // 1:加油，2:加气,4:维修,5：信息发布,6:邮寄费
    contentType = '';
    switch (type) {
        case 1:
            contentType = '加油';
            break;
        case 2:
            contentType = '加气';
            break;
        case 4:
            contentType = '维修';
            break;
        case 5:
            contentType = '信息发布';
            break;
        case 6:
            contentType = '邮寄费';
            break;
    }
    return contentType;
}
//检验参数是否为空
function checkParams(params) {
    var isTrue = true;
    for (var i in params) {
        if (isNUll(params[i])) {
            isTrue = false;
            switch (i) {
                case 'mobile':
                    $.alert('手机号不能为空', 1000, 'custom-toast');
                    break;
                case 'validateCode':
                    $.alert('手机验证码不能为空', 1000, 'custom-toast');
                    break;
                case 'idCard':
                    $.alert('身份证号不能为空', 1000, 'custom-toast');
                    break;
                case 'loginPwd':
                    $.alert('密码不能为空', 1000, 'custom-toast');
                    break;
                case 'rePwd':
                    $.alert('确认密码不能为空', 1000, 'custom-toast');
                    break;
                case 'userName':
                    $.alert('用户名不能为空', 1000, 'custom-toast');
                    break;
                case 'carNum':
                    $.alert('车牌号不能为空', 1000, 'custom-toast');
                    break;
                case 'carType':
                    $.alert('请选择汽车类型', 1000, 'custom-toast');
                    break;
            }
            return false;
        } else {
            switch (i) {
                case 'mobile':
                    var reg = /^1[3|4|5|7|8][0-9]\d{4,8}$/;//判断手机号的正则
                    if (reg.test(params[i]) && params[i].length === 11) {
                        isTrue = true;
                    } else {
                        $.alert('手机号输入格式不正确', 1000, 'custom-toast');
                        isTrue = false;
                        return false;
                    }
                    break;
                case 'validateCode':
                    if (params[i].length === 6) {
                        isTrue = true;
                    } else {
                        $.alert('手机验证码输入格式不正确', 1000, 'custom-toast');
                        isTrue = false;
                        return false;
                    }
                    break;
                case 'idCard':
                    var reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;//判断身份证号是否合法
                    if (reg.test(params[i])) {
                        isTrue = true;
                    } else {
                        $.alert('身份证输入不合法', 1000, 'custom-toast');
                        isTrue = false;
                        return false;
                    }
                    break;
                case 'loginPwd':
                case 'rePwd':
                    if (params[i].length === 6) {
                        isTrue = true;
                    } else {
                        $.alert('请输入6位密码', 1000, 'custom-toast');
                        isTrue = false;
                        return false;
                    }
                    break;

            }
            isTrue = true;
        }
    }
    return isTrue;
}
//发送验证码
function sendMSM(obj) {
    /**发送验证码*/
    obj.on("click", function () {
        var _this = $(this);
        if (_this.attr("data-end") === "1") {
            //判断倒计时是否结束
            var times = _this.attr("data-timeout");

            var data = {
                mobile: $("#mobile").val()
            };
            if (checkParams(data)) {
                var params = {
                    url: '/common/sms/sendValidateCode/1/'+data.mobile,
                    type: 'get',
                    callback: function (response) {
                        if (response.retCode === '0') {
                            Time(obj, times);
                            _this.attr("data-end", 0);
                            _this.css("background", "#999");
                        }else{
                            $.alert(response.retMsg || '验证码发送失败', 500, 'custom-toast');
                        }
                    }
                }
                ajaxRequest(params);
            }
        }
    })
};
/*获取城市id*/
function addressId(obj) {
    var cityJson,pid,sid,qid,pname,sname,qname;
    $.getJSON('./static/js/lib/address.json',function (data) {
        cityJson = data;
        var val = $("#begin_city_picker").val();
        for(var i in cityJson){
            if (val.indexOf(cityJson[i].name) != -1) {
                pid = cityJson[i].code;
                pname = cityJson[i].name;
                var second = cityJson[i].sub;
                for (var j in second) {
                    if (val.indexOf(second[j].name) != -1) {
                        sid = second[j].code;
                        sname = second[j].name;
                        var three = second[j].sub;
                        for (var m in three) {
                            if (val.indexOf(three[m].name) != -1) {
                                qid = three[m].code;
                                qname =  three[m].name;
                            }
                            return;
                        }
                    }
                    return;
                }
            }
            return;
        }
        obj.attr("data-provinceId",pid);
        obj.attr("data-provinceName",pname);
        obj.attr("data-cityId",sid);
        obj.attr("data-cityName",sname);
        obj.attr("data-countyId",qid);
        obj.attr("data-countyName",qname);
    })
}