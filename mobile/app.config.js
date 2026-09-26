module.exports = ({ config }) => {
  const googleMapsApiKey =
    process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ||
    process.env.GOOGLE_MAPS_API_KEY ||
    'AIzaSyCbsUFP40vYrdRmqnv2FL3Iw3UWKB9cRAY';

  // Ensure config plugins don't duplicate react-native-maps
  const existingPlugins = (config.plugins || []).filter((plugin) => {
    if (Array.isArray(plugin)) {
      return plugin[0] !== 'react-native-maps';
    }
    return plugin !== 'react-native-maps';
  });

  return {
    ...config,
    ios: {
      ...config.ios,
      config: {
        ...config.ios?.config,
        googleMapsApiKey,
      },
    },
    android: {
      ...config.android,
      config: {
        ...config.android?.config,
        googleMaps: {
          apiKey: googleMapsApiKey,
        },
      },
    },
    plugins: [
      ...existingPlugins,
      [
        'react-native-maps',
        {
          iosGoogleMapsApiKey: googleMapsApiKey,
          androidGoogleMapsApiKey: googleMapsApiKey,
        },
      ],
    ],
    extra: {
      ...config.extra,
      googleMapsApiKey,
    },
  };
};
