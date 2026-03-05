const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const fs = require('fs');

const projectRoot = __dirname;

function mapReactNativeWebDeepExport(context, moduleName, platform) {
  const prefix = 'react-native-web/dist/exports/';
  if (!moduleName.startsWith(prefix)) return null;

  const exportName = moduleName.slice(prefix.length);
  const candidateDir = path.join(projectRoot, 'node_modules', 'react-native-web', 'dist', 'exports', exportName);
  const candidateIndex = path.join(candidateDir, 'index.js');

  if (fs.existsSync(candidateIndex)) {
    return {
      type: 'sourceFile',
      filePath: candidateIndex,
    };
  }

  return null;
}

const config = getDefaultConfig(projectRoot);

const upstreamResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const mapped = mapReactNativeWebDeepExport(context, moduleName, platform);
  if (mapped) return mapped;

  if (upstreamResolveRequest) {
    return upstreamResolveRequest(context, moduleName, platform);
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
