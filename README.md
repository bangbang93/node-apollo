[![NPM version][npm-image]][npm-url] [![David deps][david-image]][david-url] [![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/@bangbang93/node-apollo.svg?style=flat-square
[npm-url]: https://npmjs.org/package/@bangbang93/node-apollo
[download-image]: https://img.shields.io/npm/dm/@bangbang93/node-apollo.svg?style=flat-square
[download-url]: https://npmjs.org/package/@bangbang93/node-apollo

# node-apollo

携程 Apollo 配置中心 node SDK.

## Install

```bash
$ npm i node-apollo
```

Node.js >= 16.0.0 required.

## Features

- ✔︎ 适用 eggjs([egg-apollojs](https://github.com/yhj2009/egg-apollojs)), thinkjs 等 docker 部署项目
- ✔︎ 适用自己手动搭建的服务，可直接读取 JSON 格式的配置
- ✔︎ 增加支持 http/https 协议请求

## Usage

- See [examples](https://github.com/Quinton/node-apollo/tree/master/example)

## Methods

### apollo# `remoteConfigServiceFromCache(config)`

```javascript
const config = {
  configServerUrl: 'http://example.com',
  // configServerUrl: 'https://example.com', // Support https
  appId: '<appId>',
  clusterName: 'default',
  namespaceName: ['namespaceName1', 'namespaceName2'], // n1的配置会被n2配置覆盖
  // clientIp: '',
}
const result = await apollo.remoteConfigServiceFromCache(config)
```

> **NOTE:** 通过带缓存的 Http 接口从 Apollo 读取配置，详情请参考[Apollo 开放平台](https://github.com/ctripcorp/apollo/wiki/%E5%85%B6%E5%AE%83%E8%AF%AD%E8%A8%80%E5%AE%A2%E6%88%B7%E7%AB%AF%E6%8E%A5%E5%85%A5%E6%8C%87%E5%8D%97#12-%E9%80%9A%E8%BF%87%E5%B8%A6%E7%BC%93%E5%AD%98%E7%9A%84http%E6%8E%A5%E5%8F%A3%E4%BB%8Eapollo%E8%AF%BB%E5%8F%96%E9%85%8D%E7%BD%AE).

### apollo# `remoteConfigServiceSkipCache(config)`

```javascript
const config = {
  configServerUrl: 'http://example.com',
  // configServerUrl: 'https://example.com', // Support https
  appId: '<appId>',
  clusterName: 'default',
  namespaceName: ['namespaceName1', 'namespaceName2'], // n1的配置会被n2配置覆盖
  // clientIp: '', // optional
  // releaseKey: '', // optional
}
const result = await apollo.remoteConfigServiceSkipCache(config)
```

> **NOTE:** 通过不带缓存的 Http 接口从 Apollo 读取配置，详情请参考[Apollo 开放平台](https://github.com/ctripcorp/apollo/wiki/%E5%85%B6%E5%AE%83%E8%AF%AD%E8%A8%80%E5%AE%A2%E6%88%B7%E7%AB%AF%E6%8E%A5%E5%85%A5%E6%8C%87%E5%8D%97#13-%E9%80%9A%E8%BF%87%E4%B8%8D%E5%B8%A6%E7%BC%93%E5%AD%98%E7%9A%84http%E6%8E%A5%E5%8F%A3%E4%BB%8Eapollo%E8%AF%BB%E5%8F%96%E9%85%8D%E7%BD%AE).

### apollo# `remoteConfigService(config)`

```javascript
const config = {
  configServerUrl: 'http://example.com',
  // configServerUrl: 'https://example.com',  // Support https
  appId: '<appId>',
  clusterName: 'default',
  namespaceName: '', //no surport multi namespace name, optional
  apolloEnv: 'dev',
  token: '<apollo access token>', // required
  // clientIp: '',
}
const result = await apollo.remoteConfigService(config)
```

> **NOTE:** 读取携程 Apollo 配置，调用第三方应用接入 Apollo 开放平台， 详情请参考[Apollo 开放平台](https://github.com/ctripcorp/apollo/wiki/Apollo%E5%BC%80%E6%94%BE%E5%B9%B3%E5%8F%B0).


## License

[MIT](LICENSE)
