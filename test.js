var topolr=require("topolr-util");
var cetus=require("./bin/contenter");
var a=cetus({
    sitePath:"http://localhost:8080/blog/",
    srcPath:"front/src/",
    root:"option.root.blog",
    localhost:"localhost:8080",
    cache:{
        type:"file",
        // path:"/Users/wangjinliang/caplr/topolr-blog/cache/",
        path:"G:/spark/topolr-blog/cache/",
        cycle:1000
    }
});
a.getPageContent("http://localhost:8080/blog/index").then(function (content) {
    console.log("> 1"+content);
    return a.getPageContent("http://localhost:8080/blog/detail?id=3");
}).then(function (at) {
    console.log("> 2"+at);
    return a.getPageContent("http://localhost:8080/blog/detail?id=6");
}).then(function (at) {
    console.log("> 3"+at);
    return a.getPageContent("http://localhost:8080/blog/detail?id=16");
}).then(function (at) {
    console.log("> 4"+at);
    return a.getPageContent("http://localhost/topolr-blog/index.html");
}).error(function (at,b) {
    console.error(">>   "+at);
});

