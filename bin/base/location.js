var location=function (window,url) {
    var info=location.getURLInfo(url);
    this.hash=info.hash||"";
    this.host=info.host||"";
    this.hostname=info.hostname||"";
    this._href=info.href||"";
    this.origin=info.origin||"";
    this.pathname=info.pathname||"";
    this.port=info.port||"";
    this.protocol=info.protocol||"";
    this.search=info.search||"";
    this._window=window;
};
Object.defineProperty(location.prototype,"href", {
    enumerable: true,
    configurable: true,
    get: function() {
        return this._href;
    },
    set: function(a) {
        var info=location.getURLInfo(a);
        this.hash=info.hash||"";
        this.host=info.host||"";
        this.hostname=info.hostname||"";
        this.origin=info.origin||"";
        this.pathname=info.pathname||"";
        this.port=info.port||"";
        this.protocol=info.protocol||"";
        this.search=info.search||"";
        this._window.history._add(a);
    }
});
location.getURLInfo=function (url) {
    var a=url.trim();
    var searchn=a.split("?");
    var search="";
    var hash="";
    var ct="";
    if(searchn[1]){
        var m=searchn[1].split("#");
        search=m[0];
        hash=m[1]||"";
        ct=searchn[0];
    }else{
        var hashn=a.split("#");
        if(hashn[1]){
            hash=hashn[1];
        }
        ct=hashn[0];
    }
    var protocol=a.split(":")[0];
    var b=ct.substring(protocol.length+3).split("/");
    var hostn=b.shift().split(":");
    var host=hostn[0];
    var port=hostn[1]||"";
    return {
        hash:hash?"#"+hash:"",
        host:host,
        hostname:host,
        href:a,
        origin:protocol+"://"+host,
        pathname:"/"+b.join("/"),
        port:port,
        protocol:protocol,
        search:search?"?"+search:""
    };
};
location.prototype.reload=function () {
};
location.prototype.replace=function () {
};
module.exports=function (window,url) {
    return new location(window,url);
}