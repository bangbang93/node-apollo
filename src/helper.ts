'use strict';

import assert from 'assert'

export default {
  // https://stackoverflow.com/questions/3710204/how-to-check-if-a-string-is-a-valid-json-string-in-javascript-without-using-try
  // 先判断是否是JSON String 格式，不是则直接返回原始string
  toJSON(str: string) {
    if (/^[\],:{}\s]*$/.test(str.replace(/\\["\\\/bfnrtu]/g, '@').
      replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
      replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
      return JSON.parse(str);
    } else {
      return str;
    }
  },

  mergeConfig(payload: any[]) {
    assert(Array.isArray(payload), 'Apollo config should be an array');
    const publicPayload = [];
    const privatePayload = [];
    for (let meta of payload) {
      if (meta.isPublic) {
        publicPayload.push(...this._itemsPick(meta.items, ['key', 'value']));
      } else {
        privatePayload.push(...this._itemsPick(meta.items, ['key', 'value']));
      }
    }
    // Apollo配置加载顺序如下，后加载的会覆盖前面的同名配置
    // -> 公开配置
    // -> 私有配置
    return Object.assign({}, ...privatePayload, ...publicPayload);
  },

  // 合并配置
  mergeConfigurations(payload: any[]) {
    assert(Array.isArray(payload), 'Apollo config should be an array');
    try {
      // 从缓存和非缓存获取的response报文不一致
      const confs = payload.map(pl => pl.data.content ? JSON.parse(pl.data.content) : (pl.data.configurations || pl.data));
      return Object.assign({}, ...confs);
    } catch(err) {
      assert(err, 'Apollo configs not be merged');
    }
  },

  _itemsPick(items: any, keys: string[]) {
    const ret = [];
    for (let item of items) {
      let obj: any = {};
      obj[item.key] = this.toJSON(item.value);
      ret.push(obj);
    }
    return ret;
  },

  // clientIp这个参数是可选的，用来实现灰度发布。 如果不想传这个参数，请注意URL中从?号开始的query parameters整个都不要出现。
  getConfigFromApolloUri(config: any) {
    // 读取环境变量
    const { configServerUrl, appId, clusterName, namespaceName, clientIp } = config;
    assert(configServerUrl, 'configServerUrl is required');
    assert(appId, 'appId is required');
    assert(clusterName, 'clusterName is required');
    assert(namespaceName, 'namespaceName is required');
    let apolloString;
    if (clientIp) {
      apolloString = `${configServerUrl}/configfiles/json/${appId}/${clusterName}/${namespaceName}?ip=${clientIp}`;
    } else {
      apolloString = `${configServerUrl}/configfiles/json/${appId}/${clusterName}/${namespaceName}`;
    }

    return apolloString;
  },

  // 获取集群下所有Namespace信息接口
  getAllConfigFromApolloUri(config: any) {
    const { configServerUrl, appId, clusterName, apolloEnv } = config;
    assert(configServerUrl, 'configServerUrl is required');
    assert(appId, 'appId is required');
    assert(clusterName, 'clusterName is required');
    let apolloString = `${configServerUrl}/openapi/v1/envs/${apolloEnv}/apps/${appId}/clusters/${clusterName}/namespaces`;

    return apolloString;
  },

  // 通过带缓存的Http接口从Apollo读取配置
  getConfigFromCacheUri(config: any) {
    const { configServerUrl, appId, clusterName, namespaceName, clientIp } = config;
    assert(configServerUrl, 'configServerUrl is required');
    assert(namespaceName, 'namespaceName is required');
    assert(appId, 'appId is required');
    assert(clusterName, 'clusterName is required');
    if (Array.isArray(namespaceName)) {
      if (namespaceName.length === 0) return [url('application')];
      return namespaceName.map(n => url(n));
    } else {
      return [url(namespaceName)];
    }
    function url(namespace: string) {
      if (clientIp) {
        return `${configServerUrl}/configfiles/json/${appId}/${clusterName}/${namespace}?ip=${clientIp}`
      } else {
        return `${configServerUrl}/configfiles/json/${appId}/${clusterName}/${namespace}`
      }
    }
  },
};

// 通过不带缓存的Http接口从Apollo读取配置
export function getConfigSkipCacheUri(config: any): string[] {
  const { configServerUrl, appId, clusterName, namespaceName, releaseKey, clientIp } = config;
  assert(configServerUrl, 'configServerUrl is required');
  assert(namespaceName, 'namespaceName is required');
  assert(appId, 'appId is required');
  assert(clusterName, 'clusterName is required');
  if (Array.isArray(namespaceName)) {
    if (namespaceName.length === 0) return [url('application')];
    return namespaceName.map(n => url(n));
  } else {
    return [url(namespaceName)];
  }
  function url(namespace: string) {
    if (clientIp) {
      return `${configServerUrl}/configs/${appId}/${clusterName}/${namespace}?releaseKey=${releaseKey}&ip=${clientIp}`
    } else {
      return `${configServerUrl}/configs/${appId}/${clusterName}/${namespace}?releaseKey=${releaseKey}`
    }
  }
}
