package com.sphereon.ssi.wallet;

import android.app.ActivityManager;

import android.content.Context;
import android.content.pm.PackageManager;
import android.content.BroadcastReceiver;
import android.content.Intent;
import android.content.IntentFilter;

import android.os.Build;
import android.os.Bundle;
import android.os.Handler;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.ReactRootView;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactActivityDelegate;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import expo.modules.ReactActivityDelegateWrapper;
import expo.modules.splashscreen.singletons.SplashScreen;
import expo.modules.splashscreen.SplashScreenImageResizeMode;

import java.util.List;

import com.sphereon.ssi.wallet.Constants;

public class MainActivity extends ReactActivity {
  // Adding a handler for the timer to lock the app
  private Handler backgroundHandler = new Handler();
  private Runnable backgroundRunnable;
  // Adding a receiver for the screen turning off
  private BroadcastReceiver screenOffReceiver;

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    // Set the theme to AppTheme BEFORE onCreate to support
    // coloring the background, status bar, and navigation bar.
    // This is required for expo-splash-screen.
    setTheme(R.style.AppTheme);
    super.onCreate(null);
    // SplashScreen.show(...) has to be called after super.onCreate(...)
    SplashScreen.show(this, SplashScreenImageResizeMode.CONTAIN, ReactRootView.class, false);

    // Initialize BackgroundRunnable
    initBackgroundRunnable();
    // Initialize SreenOffReceiver
    initSreenOffReceiver();
  }

  private void initBackgroundRunnable() {
    backgroundRunnable = new Runnable() {
      @Override
      public void run() {
        sendAppInBackgroundEvent("appMovingToBackground");
      }
    };
  }

  private void initSreenOffReceiver() {
    screenOffReceiver = new BroadcastReceiver() {
      @Override
      public void onReceive(Context context, Intent intent) {
        if (Intent.ACTION_SCREEN_OFF.equals(intent.getAction())) {
          backgroundHandler.postDelayed(backgroundRunnable, Constants.BACKGROUND_DELAY);
        }
      }
    };

    IntentFilter filter = new IntentFilter(Intent.ACTION_SCREEN_OFF);
    registerReceiver(screenOffReceiver, filter);
  }

  /**
   * Returns the name of the main component registered from JavaScript.
   * This is used to schedule rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "main";
  }

  /**
   * Returns the instance of the {@link ReactActivityDelegate}. Here we use a util class {@link
   * DefaultReactActivityDelegate} which allows you to easily enable Fabric and Concurrent React
   * (aka React 18) with two boolean flags.
   */
  @Override
  protected ReactActivityDelegate createReactActivityDelegate() {
    return new ReactActivityDelegateWrapper(this, BuildConfig.IS_NEW_ARCHITECTURE_ENABLED, new DefaultReactActivityDelegate(
            this,
            getMainComponentName(),
            // If you opted-in for the New Architecture, we enable the Fabric Renderer.
            DefaultNewArchitectureEntryPoint.getFabricEnabled(), // fabricEnabled
            // If you opted-in for the New Architecture, we enable Concurrent React (i.e. React 18).
            DefaultNewArchitectureEntryPoint.getConcurrentReactEnabled() // concurrentRootEnabled
    ));
  }

  /**
   * Align the back button behavior with Android S
   * where moving root activities to background instead of finishing activities.
   * @see <a href="https://developer.android.com/reference/android/app/Activity#onBackPressed()">onBackPressed</a>
   */
  @Override
  public void invokeDefaultOnBackPressed() {
    if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.R) {
      if (!moveTaskToBack(false)) {
        // For non-root activities, use the default implementation to finish them.
        super.invokeDefaultOnBackPressed();
      }
      return;
    }

    // Use the default back button implementation on Android S
    // because it's doing more than {@link Activity#moveTaskToBack} in fact.
    super.invokeDefaultOnBackPressed();
  }

  @Override
  protected void onStop() {
    super.onStop();
    if (isAppMovingToBackground()) {
      backgroundHandler.postDelayed(backgroundRunnable, Constants.BACKGROUND_DELAY);
    }
  }

  private boolean isAppMovingToBackground() {
    ActivityManager activityManager = (ActivityManager) getSystemService(Context.ACTIVITY_SERVICE);
    if (activityManager == null) {
      return false;
    }

    List<ActivityManager.RunningTaskInfo> tasks = activityManager.getRunningTasks(1);
    if (tasks == null || tasks.isEmpty()) {
      return false;
    }

    ActivityManager.RunningTaskInfo topTask = tasks.get(0);
    try {
      String packageName = getPackageManager().getPackageInfo(getPackageName(), 0).packageName;
      return !topTask.topActivity.getPackageName().equals(packageName);
    } catch (PackageManager.NameNotFoundException e) {
      e.printStackTrace();
      return false;
    }
  }

  private void sendAppInBackgroundEvent(String eventName) {
    ReactContext reactContext = getReactInstanceManager().getCurrentReactContext();
    if (reactContext != null) {
      WritableMap params = Arguments.createMap();
      params.putString("event", eventName);
      reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("appStateChange", params);
    }
  }

  @Override
  protected void onResume() {
    super.onResume();
    backgroundHandler.removeCallbacks(backgroundRunnable);
  }

  @Override
  protected void onDestroy() {
    super.onDestroy();
    unregisterReceiver(screenOffReceiver);
  }

}
