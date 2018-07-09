var version = '3.0.1';
function addResouceInit(data_css_add, data_js_add, isMap) {
    var base_url = '../../static/';
    var data_css = ['lib/sui/sm', 'lib/sui/sm-extend', 'base'];
    var data_js = ['lib/sui/sm', 'lib/sui/sm-extend', 'lib/sui/sm-city-picker', 'config', 'lib/mustache/mustache.min', 'base'];
    var meta_data = [
        {type: 'meta', content_type: 'name', name: 'viewport', content: 'width=device-width, height=device-height, user-scalable=no, initial-scale=1, minimum-scale=1, maximum-scale=1'},
        {type: 'meta', content_type: 'name', name: 'apple-mobile-web-app-capable', content: 'yes'},//删除默认的苹果工具栏和菜单栏
        {type: 'meta', content_type: 'name', name: 'apple-mobile-web-app-status-bar-style', content: 'white'},//让网页内容以应用程序风格显示，并使状态栏透明
        {type: 'meta', content_type: 'name', name: 'format-detection', content: 'telephone=no'},//备忽略将页面中的数字识别为电话号码或邮箱
        {type: 'meta', content_type: 'name', name: 'format-detection', content: 'email=no'},
        {type: 'meta', content_type: 'name', name: 'msapplication-tap-highlight', content: 'no'},
        {type: 'meta', content_type: 'http-equiv', 'http_equiv': 'Expires', content: '-1'},
        {type: 'meta', content_type: 'http-equiv', 'http_equiv': 'Cache-Control', content: 'no-cache'},
        {type: 'meta', content_type: 'http-equiv', 'http_equiv': 'Pragma', content: 'no-cache'},
    ]
    data_css = data_css.concat(data_css_add);
    data_js = data_js.concat(data_js_add);
    var docfrag_css = document.createDocumentFragment();
    var docfrag_js = document.createDocumentFragment();
    var docfrag_meta = document.createDocumentFragment();
    data_css.forEach(function (v) {
        var link = document.createElement("link");
        link.href = base_url + 'css/' + v + '.css?v=' + version;
        link.rel = "stylesheet";
        docfrag_css.appendChild(link);
    })
    data_js.forEach(function (v) {
        var script = document.createElement("script");
        script.src = base_url + 'js/' + v + '.js?v=' + version;
        docfrag_js.appendChild(script);

    })
    meta_data.forEach(function (v) {
        var meta = document.createElement("meta");
        if (v.content_type === "name") {
            meta.name = v.name;
        }
        if (v.content_type === "http-equiv") {
            meta.setAttribute("http-equiv", v.http_equiv)
        }
        meta.content = v.content;
        docfrag_meta.appendChild(meta);
    })
    console.log(docfrag_meta);
    document.head.appendChild(docfrag_meta);
    document.head.appendChild(docfrag_css);
    document.body.appendChild(docfrag_js);
    if (isMap) {
        var script_map = document.createElement("script");
        script_map.src = "http://webapi.amap.com/maps?v=1.3&key=c8d499635271ab4f9d449d35911e2cf1&plugin=AMap.ToolBar";
        document.body.appendChild(script_map);
        initGaode();
    }
}