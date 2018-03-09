let Wrapper = require('./lib/wrap');
const util = require('util');

let appInstance = null;

class Application {
  constructor() {
    this.api = {};
    this.env = {};
    this.service = {};
  }
  init(config, api) {
    return Promise.all([
      ...this.initAPI(config.api, api),
      ...this.initService(config.service, config.api),
      ...this.initENV(config.env)
    ]);
  }
  initAPI(config, api) {
    return Object.keys(api).map((apiName) => {
      return new Promise((resolve) => {
        this.register("api", apiName, config[apiName], null, new Wrapper(apiName, config[apiName], api[apiName]));
        resolve();
      });
    });
  }
  initService(config, api) {
    return Object.keys(config).map((serviceName) => {
      return new Promise((resolve, reject) => {
        require('./service/' + serviceName)(
          config[serviceName],
          this.getServiceApiConfigs(api, serviceName),
          this.call.bind(this)
        )
          .then((instance) => {
            this.register("service", serviceName, config[serviceName], instance);
            resolve();
          })
          .catch(reject);
      });
    });
  }
  initENV(config) {
    return Object.keys(config).map((envName) => {
      return new Promise((resolve, reject) => {
        require('./env/' + envName)(config[envName])
          .then((instance) => {
            this.register("env", envName, config[envName], instance);
            resolve();
          })
          .catch(reject);
      });
    });
  }
  register(type, name, config, instance) {
      this[type][name] = {
        config: config,
        instance: instance
      };
  }
  getServiceApiConfigs(config, serviceName) {
    return Object.keys(config).map((apiName) => {
      if (config[apiName][serviceName]) {
        return config[apiName][serviceName];
      } else {
        return null;
      }
    }).filter((item) => !!item);
  }
  call(apiName, args) {}
  static getInstance() {
    if (!appInstance) {
      appInstance = new Application();
    }
    return appInstance;
  }
}

Application.getInstance().init(
  require('./config'),
  require('./api')
).then(() => {
  console.log(util.inspect(appInstance, {colors:true,depth:null}));
});

module.exports.Application = Application;