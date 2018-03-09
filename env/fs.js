const fs = require('fs');

module.exports = function (config) {
  return new Promise((resolve, reject) => {
    resolve({
      read: () => {},
      write: () => {},
      append: () => {},
      mkdir: () => {},
      exists: () => {}
    });
  });
};