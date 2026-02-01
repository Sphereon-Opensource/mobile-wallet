package com.sphereon.ssi.wallet.dcapi

import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class DCApiModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    companion object {
        private const val TAG = "DCApiModule"
        private var reactContextRef: ReactApplicationContext? = null
        // Keep a reference to the main app's React context (from MainActivity).
        // DCApiActivity creates a second React root which overwrites reactContextRef,
        // but events must be emitted to the main context where listeners are registered.
        private var mainReactContextRef: ReactApplicationContext? = null

        // Sticky biometric result: stored when biometric completes so JS can retrieve it
        // even if the event listener wasn't registered yet (race condition fix).
        // null = no result yet, true/false = result available
        @Volatile
        private var pendingBiometricResult: Boolean? = null

        fun hasActiveReactContext(): Boolean {
            val ctx = reactContextRef
            return ctx != null && ctx.hasActiveReactInstance()
        }

        fun isWalletInForeground(): Boolean {
            val ctx = mainReactContextRef ?: reactContextRef ?: return false
            val currentActivity = ctx.currentActivity ?: return false
            return currentActivity.javaClass.simpleName == "MainActivity"
        }

        fun getMainReactContext(): ReactApplicationContext? = mainReactContextRef ?: reactContextRef

        fun resetState() {
            pendingBiometricResult = null
            Log.d(TAG, "State reset")
        }

        fun emitBiometricResult(success: Boolean) {
            // Store the result so JS can poll for it if the event is missed
            pendingBiometricResult = success
            Log.d(TAG, "Stored pendingBiometricResult=$success")

            val ctx = mainReactContextRef ?: reactContextRef
            if (ctx == null || !ctx.hasActiveReactInstance()) {
                Log.e(TAG, "No active React context to emit biometric result event")
                return
            }
            val params = Arguments.createMap().apply {
                putBoolean("success", success)
            }
            ctx.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit("onDCApiBiometricResult", params)
            Log.d(TAG, "Emitted onDCApiBiometricResult event (success=$success)")
        }

        fun emitDCApiComplete() {
            val ctx = mainReactContextRef ?: reactContextRef
            if (ctx == null || !ctx.hasActiveReactInstance()) return
            ctx.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit("onDCApiComplete", null)
            Log.d(TAG, "Emitted onDCApiComplete event")
        }

        fun emitDCApiRequest(requestJson: String, origin: String, packageName: String, selectedCredentialId: String) {
            val ctx = mainReactContextRef ?: reactContextRef
            if (ctx == null || !ctx.hasActiveReactInstance()) {
                Log.e(TAG, "No active React context to emit DC API request event")
                return
            }
            val params = Arguments.createMap().apply {
                putString("requestJson", requestJson)
                putString("origin", origin)
                putString("packageName", packageName)
                putString("selectedCredentialId", selectedCredentialId)
            }
            ctx.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit("onDCApiRequest", params)
            Log.d(TAG, "Emitted onDCApiRequest event to JS")
        }
    }

    init {
        reactContextRef = reactContext
        // The first DCApiModule instance is created by MainActivity's React context.
        // Preserve it so we can always emit events to the main app.
        if (mainReactContextRef == null || !mainReactContextRef!!.hasActiveReactInstance()) {
            mainReactContextRef = reactContext
        }
    }

    override fun getName(): String = "DCApiModule"

    @ReactMethod
    fun registerCredentials(credentialMetadataJson: String, promise: Promise) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val registry = DCApiCredentialRegistry(reactApplicationContext)
                registry.registerCredentials(credentialMetadataJson)
                promise.resolve(null)
            } catch (e: Exception) {
                Log.e(TAG, "Failed to register credentials", e)
                promise.reject("REGISTER_FAILED", e.message, e)
            }
        }
    }

    @ReactMethod
    fun sendResponse(responseJson: String) {
        val activity = DCApiActivity.currentInstance
        if (activity != null) {
            activity.returnResponse(responseJson)
        } else {
            Log.e(TAG, "sendResponse called but no DCApiActivity instance available")
        }
    }

    @ReactMethod
    fun sendError(errorMessage: String) {
        val activity = DCApiActivity.currentInstance
        if (activity != null) {
            activity.returnError(errorMessage)
        } else {
            Log.e(TAG, "sendError called but no DCApiActivity instance available")
        }
    }

    @ReactMethod(isBlockingSynchronousMethod = true)
    fun isDCApiActivity(): Boolean {
        return DCApiActivity.currentInstance != null
    }

    @ReactMethod
    fun getRequest(promise: Promise) {
        val activity = DCApiActivity.currentInstance
        if (activity != null) {
            val result = Arguments.createMap()
            result.putString("requestJson", activity.getRequestJson())
            result.putString("origin", activity.getOrigin())
            result.putString("packageName", activity.getPackageName_())
            result.putString("selectedCredentialId", activity.getSelectedCredentialId())
            promise.resolve(result)
        } else {
            promise.reject("NOT_DC_API", "No DCApiActivity instance available")
        }
    }

    @ReactMethod
    fun getBiometricResult(promise: Promise) {
        val result = pendingBiometricResult
        if (result != null) {
            Log.d(TAG, "getBiometricResult: returning stored result=$result")
            promise.resolve(result)
        } else {
            Log.d(TAG, "getBiometricResult: no result yet")
            promise.resolve(null)
        }
    }

    @ReactMethod
    fun resetDCApiState() {
        Companion.resetState()
    }

    @ReactMethod
    fun addListener(eventName: String) {
        // Required for RN event emitter
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        // Required for RN event emitter
    }
}
