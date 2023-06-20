'use strict';

import assert from 'assert'
import fs from 'fs'
import got from 'got'
import helper, {getConfigSkipCacheUri} from './helper'

// Apollo开放平台接入方式
export async function remoteConfigService (config: any): Promise<Record<string, string>> {
  assert(config, 'param config is required');
  assert(config.token, 'param token is required');
  const res = await got.get(helper.getAllConfigFromApolloUri(config), {
    headers: {
      authorization: config.token,
    },
    rejectUnauthorized: true,
    responseType: 'json',
  });
  assert(res.statusCode === 200, 'apollo host unavailable, please contact your administrtor');
  return helper.mergeConfig(res.body);
}
export default {

  // 通过不带缓存的Http接口从Apollo读取配置
  remoteConfigServiceSkipCache: async (config: any) => {
    assert(config, 'param config is required');
    const options = {
      rejectUnauthorized: true,
      responseType: 'json',
    } as const
    const URIs: string[] = getConfigSkipCacheUri(config);
    const bundle = await Promise.all(URIs.map(uri => got.get(uri, options)));
    for (let res of bundle) {
      assert(res.statusCode === 200, 'apollo host unavailable, please contact your administrtor');
    }
    return helper.mergeConfigurations(bundle);
  },

  // 向后兼容
  remoteConfigServiceSikpCache: async (config: any) => {
    assert(config, 'param config is required');
    const options = {
      rejectUnauthorized: true,
      responseType: 'json'
    } as const
    const URIs: string[] = getConfigSkipCacheUri(config);
    const bundle = await Promise.all(URIs.map(uri => got.get(uri, options)));
    for (let res of bundle) {
      assert(res.statusCode === 200, 'apollo host unavailable, please contact your administrtor');
    }
    return helper.mergeConfigurations(bundle);
  },


  //通过带缓存的Http接口从Apollo读取配置
  remoteConfigServiceFromCache: async (config) => {
    assert(config, 'param config is required');
    const options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      rejectUnauthorized: true,
      contentType: 'json',
      dataType: 'json',
    };
    const URIs = helper.getConfigFromCacheUri(config);
    const bundle = await Promise.all(URIs.map(uri => urllib.request(uri, options)));
    for (let res of bundle) {
      assert(res.status === 200, 'apollo host unavailable, please contact your administrtor');
    }
    return helper.mergeConfigurations(bundle);
  },

  // 生成default.env
  createEnvFile: (envConfig) => {
    if (fs.existsSync(config.ENV_FILE_PATH)) {
      fs.unlinkSync(config.ENV_FILE_PATH);
    }
    for (let key of Object.keys(envConfig)) {
      fs.appendFileSync(config.ENV_FILE_PATH, `${key}=${envConfig[key]}\n`);
    }
  },

  // 注入到process.env
  setEnv: () => {
    try {
      require('dotenv').config({ path: config.ENV_FILE_PATH });
    } catch(err) {
      assert(false, err);
    }
  }
};
