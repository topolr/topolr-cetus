var contenter=require("./bin/contenter");
var runtime=require("./bin/base/runtime");

module.exports={
    getContenter:function (option) {
        return contenter(option);
    },
    getRuntime:function (option) {
        return runtime(option);
    }
};