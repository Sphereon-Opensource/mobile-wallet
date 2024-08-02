package com.sphereon.ssi.wallet

import android.app.Application
import android.content.res.Configuration
import android.util.Log
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.config.ReactFeatureFlags
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.load
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.react.flipper.ReactNativeFlipper
import com.facebook.soloader.SoLoader
import com.sphereon.musap.MusapModuleAndroid
import com.sphereon.musap.MusapPackage
import expo.modules.ApplicationLifecycleDispatcher
import expo.modules.ReactNativeHostWrapper

class MainApplication : Application(), ReactApplication {
    override val reactNativeHost: ReactNativeHost = ReactNativeHostWrapper(
            this,
            object : DefaultReactNativeHost(this) {
                override fun getPackages(): List<ReactPackage> {
                    val packages = PackageList(this).packages.toMutableList()
                    try {
                        packages.add(MusapPackage())
                    } catch (e: Exception) {
                        Log.e("MWALL", "Failed to add MusapPackage", e)
                    }
                    return packages
                }

                override fun getJSMainModuleName(): String = ".expo/.virtual-metro-entry"

                override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

                override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
                override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
            }
    )

    override val reactHost: ReactHost
        get() = getDefaultReactHost(this.applicationContext, reactNativeHost)

    override fun onCreate() {
        super.onCreate()

        try {
            MusapModuleAndroid.init(this)
        } catch (e: Throwable) {
            Log.e("MWALL", "init failed", e) // To logcat
            throw e
        }

        SoLoader.init(this,  /* native exopackage */false)
        if (!BuildConfig.REACT_NATIVE_UNSTABLE_USE_RUNTIME_SCHEDULER_ALWAYS) {
            ReactFeatureFlags.unstable_useRuntimeSchedulerAlways = false
        }
        if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
            // If you opted-in for the New Architecture, we load the native entry point for this app.
            load()
        }
        if (BuildConfig.DEBUG) {
            ReactNativeFlipper.initializeFlipper(this, reactNativeHost.reactInstanceManager)
        }
        ApplicationLifecycleDispatcher.onApplicationCreate(this)
    }

    override fun onConfigurationChanged(newConfig: Configuration) {
        super.onConfigurationChanged(newConfig)
        ApplicationLifecycleDispatcher.onConfigurationChanged(this, newConfig)
    }
}
