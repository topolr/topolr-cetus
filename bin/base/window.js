var topolr = require("topolr-util");
var request = require("./request");
var formdata = require("./formdata");
var blob = require("./blob");
var storage = require("./storage");
var doc = require("./dom");
var history=require("./history");
var location=require("./location");

var win = function (option) {
    var ths=this;
    this.document = doc(option.page);
    this.navigator = {
        appCodeName:"Mozilla",
        appName:"Netscape",
        appVersion:"5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.99 Safari/537.36",
        cookieEnabled:true,
        onLine:true,
        language:"zh-CN",
        platform:"Win32",
        product:"Gecko",
        productSub:"20030107",
        vendor:"Topolr Cetus",
        vendorSub:"",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.143 Safari/537.36"
    };
    this.Function = global.Function;
    this.JSON = global.JSON;
    this.innerWidth = 0;
    this.innerHeight = 0;
    this.pageXOffset = 0;
    this.pageYOffset = 0;
    this.localStorage = new storage();
    this.eventlistener = {};
    this.FormData = formdata;
    this.Blob = blob;
    this.File = blob;
    this.encodeURIComponent = global.encodeURIComponent;
    this.onpopstate = null;
    this.basePath = option.sitePath;
    this.location = location(this,option.sitePath);
    this.history=history(this);
    this.XMLHttpRequest=function () {
        return request(ths,option.localhost);
    };
};
win.prototype.getComputedStyle = function () {
    return {
        getPropertyValue: function () {
            return 0;
        }
    }
};
win.prototype.addEventListener = function (type, fn) {
    if (!this.eventlistener[type]) {
        this.eventlistener[type] = [];
    }
    this.eventlistener[type].push(fn);
};
win.prototype.removeEventListener = function (type, fn) {
    if (this.eventlistener[type]) {
        var a = this.eventlistener[type].indexOf(fn);
        if (a !== -1) {
            this.eventlistener[type].splice(a, 1);
        }
    }
};
win.prototype.dispatchEvent = function (event) {
    var _parent = this;
    event.target = this;
    while (_parent) {
        event.currentTarget = _parent;
        if (_parent.eventlistener && _parent.eventlistener[type]) {
            var events = _parent.eventlistener[type];
            for (var i in events) {
                events[i].call(_parent, event);
            }
        }
        if (event._stop) {
            break;
        }
        _parent = _parent.parentNode;
    }
};

module.exports = function (option) {
    return new win(option);
};