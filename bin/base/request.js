var Request=require("request");
var topolr=require("topolr-util");

var response = function () {
    this.status = 200;
    this.responseText = "";
    this.response = null;
};

var request = function (window,localhost) {
    this.responseType = "";
    this.timeout = 90000;
    this.upload = {
        addEventListener: function () {
        },
        removeEventListener: function () {
        }
    };
    this.type = "post";
    this.url = "";
    this.mimeType = null;
    this._header = {};
    this._events = {};
    this._window=window;
    this._localhost=localhost;
};
request.prototype.abort = function () {
};
request.prototype.open = function (type, url) {
    this.type = type;
    this.url = url;
};
request.prototype.overrideMimeType = function (type) {
    this.mimeType = type;
};
request.prototype.addEventListener = function (type, fn) {
    if (!this._events[type]) {
        this._events[type] = [];
    }
    this._events[type].push(fn);
};
request.prototype.setRequestHeader = function (key, value) {
    this._header[key] = value;
};
request.prototype.send = function (data) {
    var ths = this;
    var url=this.url.replace(/\/\/[0-9a-zA-Z\.]+[\:0-9]*/,function(a){
        return "//"+ths._localhost;
    });
    topolr.log("    (color:32=>cetus:forward) (color:140=>[{{a}}]) (color:91=>{{b}})",{a:url,b:this.url});
    Request({
        url:url,
        method:this.type,
        form:data
    },function (a,b,c) {
        var rsp = new response();
        ths.response = rsp;
        rsp.responseText = c;
        rsp.response = c;
        rsp.type = "load";
        ths._trigger("load", rsp);
    });
};
request.prototype._trigger = function (type, data) {
    if (this._events[type]) {
        for(var i=0;i<this._events[type].length;i++) {
            try {
                this._events[type][i].call(data, data);
            } catch (e) {
                console.log(e)
            }
        }
    }
};
module.exports = function (window,localhost) {
    return new request(window,localhost);
};