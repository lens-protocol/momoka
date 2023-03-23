module.exports = function override(config) {
  // required to support .cjs extension which is used by axios inside the verifier library
  // see https://github.com/facebook/create-react-app/pull/12021
  // TODO: Build verifier client as a ES module
  config.module.rules = config.module.rules.map((rule) => {
    if (rule.oneOf instanceof Array) {
      rule.oneOf[rule.oneOf.length - 1].exclude = [
        /\.(js|mjs|jsx|cjs|ts|tsx)$/,
        /\.html$/,
        /\.json$/,
      ];
    }
    return rule;
  });

  return config;
};
