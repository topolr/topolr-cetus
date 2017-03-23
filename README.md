![topolr-cetus](https://github.com/topolr/topolr-cetus/raw/master/logo.png)
---------------------------
[![Build Status](https://travis-ci.org/topolr/topolr-cetus.svg?branch=master)](https://travis-ci.org/topolr/topolr-cetus)
[![npm version](https://badge.fury.io/js/topolr-cetus.svg)](https://badge.fury.io/js/topolr-cetus)
[![npm](https://img.shields.io/npm/dt/topolr-cetus.svg?maxAge=2592000)](https://www.npmjs.com/package/topolr-cetus)
[![license](https://img.shields.io/github/license/topolr/topolr-cetus.svg?maxAge=2592000)](https://github.com/topolr/topolr-cetus/blob/master/LICENSE)

Server side runtime of topolr web library


## Install

`> npm install topolr-cetus -g`


## Api

### option

```
{
    sitePath:"http://localhost:8080/blog/",
    srcPath:"front/src/",
    root:"option.root.blog",
    localhost:"localhost:8080",
    cache:{
        type:"file",
        path:"",
        cycle:1000
    }
}
```

### method

- getContenter(option) => get contenter object
- getRuntime() => get runtime object

### contenter

- getPageContent(url) => get html of url
- removeCache(url) => remove cache
- cleanCache() => clean cache
- isReady() => env is ready