package com.sphereon.ssi.wallet.dcapi

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.util.Log
import androidx.credentials.ExperimentalDigitalCredentialApi
import androidx.credentials.registry.digitalcredentials.openid4vp.OpenId4VpRegistry
import androidx.credentials.registry.digitalcredentials.sdjwt.SdJwtClaim
import androidx.credentials.registry.digitalcredentials.sdjwt.SdJwtEntry
import androidx.credentials.registry.provider.RegistryManager
import androidx.credentials.registry.provider.digitalcredentials.DigitalCredentialRegistry
import androidx.credentials.registry.provider.digitalcredentials.VerificationEntryDisplayProperties
import androidx.credentials.registry.provider.digitalcredentials.VerificationFieldDisplayProperties
import org.json.JSONObject
import java.io.ByteArrayOutputStream

@OptIn(ExperimentalDigitalCredentialApi::class)
class DCApiCredentialRegistry(private val context: Context) {

    companion object {
        private const val TAG = "DCApiCredRegistry"
        private const val MATCHER_ASSET = "openid4vp_matcher.wasm"
    }

    private val registryManager = RegistryManager.create(context)

    private fun getDefaultIcon(): Bitmap {
        // Use the app's launcher icon as default
        val appIcon = context.packageManager.getApplicationIcon(context.packageName)
        val bitmap = Bitmap.createBitmap(48, 48, Bitmap.Config.ARGB_8888)
        val canvas = android.graphics.Canvas(bitmap)
        appIcon.setBounds(0, 0, 48, 48)
        appIcon.draw(canvas)
        return bitmap
    }

    suspend fun registerCredentials(credentialMetadataJson: String) {
        try {
            val matcherBytes = context.assets.open(MATCHER_ASSET).use { it.readBytes() }
            Log.d(TAG, "Loaded matcher WASM (${matcherBytes.size} bytes)")

            val json = JSONObject(credentialMetadataJson)
            val credentialEntries = mutableListOf<SdJwtEntry>()
            val defaultIcon = getDefaultIcon()

            // Parse dc+sd-jwt entries
            val sdJwtSection = json.optJSONObject("dc+sd-jwt")
            if (sdJwtSection != null) {
                val vctKeys = sdJwtSection.keys()
                while (vctKeys.hasNext()) {
                    val vct = vctKeys.next()
                    val entriesArray = sdJwtSection.getJSONArray(vct)
                    for (i in 0 until entriesArray.length()) {
                        val entry = entriesArray.getJSONObject(i)
                        val id = entry.getString("id")
                        val title = entry.optString("title", "Credential")
                        val subtitle = entry.optString("subtitle", "")
                        val pathsArray = entry.optJSONArray("paths")

                        val claims = mutableListOf<SdJwtClaim>()
                        if (pathsArray != null) {
                            for (j in 0 until pathsArray.length()) {
                                val path = pathsArray.getString(j)
                                claims.add(
                                    SdJwtClaim(
                                        path = listOf(path),
                                        value = null,
                                        fieldDisplayPropertySet = setOf(
                                            VerificationFieldDisplayProperties(
                                                displayName = path,
                                            )
                                        ),
                                    )
                                )
                            }
                        }

                        credentialEntries.add(
                            SdJwtEntry(
                                verifiableCredentialType = vct,
                                claims = claims,
                                entryDisplayPropertySet = setOf(
                                    VerificationEntryDisplayProperties(
                                        title = title,
                                        subtitle = subtitle,
                                        icon = defaultIcon,
                                    )
                                ),
                                id = id,
                            )
                        )
                        Log.d(TAG, "Added SdJwtEntry id=$id vct=$vct title=$title claims=${claims.size}")
                    }
                }
            }

            // TODO: Parse mso_mdoc entries with MdocEntry when needed

            if (credentialEntries.isEmpty()) {
                Log.w(TAG, "No credential entries to register")
                return
            }

            val registry = OpenId4VpRegistry(
                credentialEntries = credentialEntries,
                inlineIssuanceEntries = emptyList(),
                id = "openid4vp1.0",
            )

            registryManager.registerCredentials(
                object : DigitalCredentialRegistry(
                    id = registry.id,
                    credentials = registry.credentials,
                    matcher = matcherBytes,
                ) {}
            )

            Log.d(TAG, "Successfully registered ${credentialEntries.size} credentials via DigitalCredentialRegistry")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to register credentials", e)
            throw e
        }
    }
}
