package com.sphereon.ssi.wallet.dcapi

import android.content.Intent
import android.os.Bundle
import android.util.Log
import androidx.credentials.DigitalCredential
import androidx.credentials.ExperimentalDigitalCredentialApi
import androidx.credentials.GetCredentialResponse
import androidx.credentials.GetDigitalCredentialOption
import androidx.credentials.exceptions.GetCredentialUnknownException
import androidx.credentials.provider.PendingIntentHandler
import androidx.credentials.registry.provider.selectedEntryId
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.sphereon.ssi.wallet.BuildConfig
import com.sphereon.ssi.wallet.MainActivity
import expo.modules.ReactActivityDelegateWrapper

@OptIn(ExperimentalDigitalCredentialApi::class)
class DCApiActivity : ReactActivity() {

    companion object {
        private const val TAG = "DCApiActivity"
        @Volatile
        var currentInstance: DCApiActivity? = null
            private set
    }

    private var _requestJson: String? = null
    private var _origin: String? = null
    private var _packageName: String? = null
    private var _selectedCredentialId: String? = null
    private var _pendingResponse: String? = null
    private var _pendingError: String? = null
    private var _wasWalletInForeground: Boolean = false

    fun getRequestJson(): String? = _requestJson
    fun getOrigin(): String? = _origin
    fun getPackageName_(): String? = _packageName
    fun getSelectedCredentialId(): String? = _selectedCredentialId

    override fun getMainComponentName(): String = "DCApiApp"

    override fun createReactActivityDelegate(): ReactActivityDelegate {
        return ReactActivityDelegateWrapper(
            this,
            BuildConfig.IS_NEW_ARCHITECTURE_ENABLED,
            object : DefaultReactActivityDelegate(
                this,
                mainComponentName,
                fabricEnabled
            ) {
                override fun getLaunchOptions(): Bundle? {
                    return Bundle().apply {
                        putString("requestJson", _requestJson ?: "")
                        putString("origin", _origin ?: "")
                        putString("packageName", _packageName ?: "")
                        putString("selectedCredentialId", _selectedCredentialId ?: "")
                    }
                }
            }
        )
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        currentInstance = this
        var error: String? = null

        try {
            val request = PendingIntentHandler.retrieveProviderGetCredentialRequest(intent)
            if (request == null) {
                Log.e(TAG, "No provider request found in intent")
                error = "No provider request found"
            } else {
                val callingAppInfo = request.callingAppInfo
                _packageName = callingAppInfo.packageName

                try {
                    val allowedAppsJson = assets.open("allowedApps.json").bufferedReader().use { it.readText() }
                    _origin = callingAppInfo.getOrigin(allowedAppsJson)
                } catch (e: Exception) {
                    Log.w(TAG, "Could not determine origin, using package name", e)
                    _origin = _packageName
                }

                _selectedCredentialId = request.selectedEntryId
                Log.d(TAG, "selectedEntryId: $_selectedCredentialId")

                request.credentialOptions.forEach { option ->
                    if (option is GetDigitalCredentialOption) {
                        _requestJson = option.requestJson
                        Log.d(TAG, "Found GetDigitalCredentialOption")
                        return@forEach
                    }
                }

                if (_requestJson == null) {
                    Log.e(TAG, "No digital credential request found")
                    error = "No digital credential request found in intent"
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error processing DC API intent", e)
            error = "Error processing request: ${e.message}"
        }

        if (error != null) {
            super.onCreate(savedInstanceState)
            returnError(error)
            return
        }

        Log.d(TAG, "DC API request received. Origin: $_origin, package: $_packageName, selectedId: $_selectedCredentialId")
        Log.d(TAG, "DC API requestJson (first 500): ${_requestJson?.take(500)}")

        _wasWalletInForeground = DCApiModule.isWalletInForeground()
        Log.d(TAG, "Wallet was in foreground: $_wasWalletInForeground")

        // Always render DCApiApp which shows the card, handles biometric, and builds the VP.
        // DCApiActivity stays in the foreground so BiometricPrompt and expo-local-authentication work.
        super.onCreate(savedInstanceState)
    }

    override fun onDestroy() {
        if (currentInstance == this) {
            currentInstance = null
        }
        super.onDestroy()

        // DCApiActivity shares the ReactInstanceManager with MainActivity.
        // When this activity is destroyed, it may leave the React host in a paused state,
        // breaking networking for the main app. Explicitly resume the host on MainActivity.
        val ctx = DCApiModule.getMainReactContext()
        val mainActivity = ctx?.currentActivity
        if (mainActivity is MainActivity) {
            Log.d(TAG, "Resuming React host on MainActivity after DCApiActivity destroyed")
            reactInstanceManager?.onHostResume(mainActivity)
        }
    }

    fun returnResponse(responseJson: String) {
        Log.d(TAG, "Returning DC API response (wasWalletInForeground=$_wasWalletInForeground)")
        _pendingResponse = responseJson
        _pendingError = null
        deliverPendingResult()
    }

    fun returnError(errorMessage: String) {
        Log.e(TAG, "Returning DC API error: $errorMessage (wasWalletInForeground=$_wasWalletInForeground)")
        _pendingResponse = null
        _pendingError = errorMessage
        deliverPendingResult()
    }

    private fun deliverPendingResult() {
        val response = _pendingResponse
        val error = _pendingError
        _pendingResponse = null
        _pendingError = null

        if (response == null && error == null) return

        // DCApiActivity is always in the foreground (DCApiApp renders on it),
        // so we can deliver the result directly.
        deliverResultNow(response, error)

        // If the wallet was open before, notify JS and bring it back to foreground
        if (_wasWalletInForeground) {
            DCApiModule.emitDCApiComplete()
            window.decorView.postDelayed({
                val launchIntent = packageManager.getLaunchIntentForPackage(packageName)
                if (launchIntent != null) {
                    launchIntent.addFlags(Intent.FLAG_ACTIVITY_REORDER_TO_FRONT)
                    startActivity(launchIntent)
                }
            }, 200)
        }
    }

    private fun deliverResultNow(response: String?, error: String?) {
        runOnUiThread {
            if (response != null) {
                Log.d(TAG, "Delivering DC API response")
                val resultData = Intent()
                PendingIntentHandler.setGetCredentialResponse(
                    resultData,
                    GetCredentialResponse(DigitalCredential(response))
                )
                setResult(RESULT_OK, resultData)
                finish()
            } else if (error != null) {
                Log.d(TAG, "Delivering DC API error: $error")
                val resultData = Intent()
                PendingIntentHandler.setGetCredentialException(
                    resultData,
                    GetCredentialUnknownException(error)
                )
                setResult(RESULT_OK, resultData)
                finish()
            }
        }
    }
}
