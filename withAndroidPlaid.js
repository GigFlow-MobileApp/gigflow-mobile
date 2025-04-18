const { withAndroidManifest } = require("@expo/config-plugins");

module.exports = function withAndroidPlaid(config) {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;

    // Add necessary queries for Android 11+ compatibility
    androidManifest.manifest.queries = [
      {
        intent: [
          {
            action: ["android.intent.action.VIEW"],
            data: [{ "android:scheme": ["https", "plaid"] }],
          },
        ],
      },
    ];

    // Add necessary permissions
    androidManifest.manifest["uses-permission"] = [
      ...(androidManifest.manifest["uses-permission"] || []),
      {
        $: {
          "android:name": "android.permission.INTERNET",
        },
      },
    ];

    // Add Plaid activity with result handling
    if (!androidManifest.manifest.application[0].activity) {
      androidManifest.manifest.application[0].activity = [];
    }

    // Add the main activity configuration
    const mainActivity = androidManifest.manifest.application[0].activity.find(
      activity => activity.$["android:name"] === ".MainActivity"
    );

    if (mainActivity) {
      // Add launch mode to handle results
      mainActivity.$["android:launchMode"] = "singleTask";
      // Add intent filter for Plaid
      if (!mainActivity["intent-filter"]) {
        mainActivity["intent-filter"] = [];
      }
      mainActivity["intent-filter"].push({
        action: [{ $: { "android:name": "android.intent.action.VIEW" } }],
        category: [
          { $: { "android:name": "android.intent.category.DEFAULT" } },
          { $: { "android:name": "android.intent.category.BROWSABLE" } },
        ],
        data: [{ $: { "android:scheme": "plaidlink" } }],
      });
    }

    // Add Plaid Link activity
    androidManifest.manifest.application[0].activity.push({
      $: {
        "android:name": "com.plaid.link.LinkActivity",
        "android:exported": "false",
        "android:launchMode": "singleTask",
        "android:theme": "@style/PlaidTheme",
      },
    });

    return config;
  });
};

