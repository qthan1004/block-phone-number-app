package com.callblocker

import android.content.ContentValues
import android.content.Context
import android.net.Uri
import android.provider.BlockedNumberContract
import android.telecom.Call
import android.telecom.CallScreeningService
import android.util.Log
import org.json.JSONArray

class CallScreenerService : CallScreeningService() {
    companion object {
        const val TAG = "CallScreenerService"
    }

    override fun onScreenCall(callDetails: Call.Details) {
        // If the call is not incoming, allow it immediately
        if (callDetails.callDirection != Call.Details.DIRECTION_INCOMING) {
            respondToCall(callDetails, CallResponse.Builder().build())
            return
        }

        val prefs = getSharedPreferences("CallBlockerPrefs", Context.MODE_PRIVATE)
        val serviceEnabled = prefs.getBoolean("serviceEnabled", true)
        
        if (!serviceEnabled) {
            respondToCall(callDetails, CallResponse.Builder().build())
            return
        }

        val incomingHandle: Uri? = callDetails.handle
        val incomingNumber = incomingHandle?.schemeSpecificPart ?: ""
        
        if (incomingNumber.isEmpty()) {
            respondToCall(callDetails, CallResponse.Builder().build())
            return
        }

        val normalizedIncoming = MatchingEngine.normalizePhoneNumber(incomingNumber)
        val strictnessRating = prefs.getInt("strictnessRating", 75)
        val blockedNumbersStr = prefs.getString("blockedNumbers", "[]")

        var shouldBlock = false

        try {
            val jsonArray = JSONArray(blockedNumbersStr)
            for (i in 0 until jsonArray.length()) {
                val item = jsonArray.getJSONObject(i)
                val rawNumber = item.optString("rawNumber", "")
                val normalizedTarget = MatchingEngine.normalizePhoneNumber(rawNumber)
                
                val similarity = MatchingEngine.calculateSimilarityPercentage(normalizedIncoming, normalizedTarget)
                if (similarity >= strictnessRating) {
                    shouldBlock = true
                    Log.d(TAG, "Call from \$incomingNumber blocked! Matched \$rawNumber with similarity \$similarity%")
                    break
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error parsing blocked numbers JSON", e)
        }

        if (shouldBlock) {
            // Silently reject the call
            val response = CallResponse.Builder()
                .setDisallowCall(true)
                .setRejectCall(true)
                .setSkipNotification(true)
                .setSkipCallLog(false) // Optionally keep it in the native log
                .build()
                
            respondToCall(callDetails, response)

            // Add the number to Android's built-in blocked list if permission allows
            if (BlockedNumberContract.canCurrentUserBlockNumbers(this)) {
                try {
                    val values = ContentValues().apply {
                        put(BlockedNumberContract.BlockedNumbers.COLUMN_ORIGINAL_NUMBER, incomingNumber)
                    }
                    contentResolver.insert(BlockedNumberContract.BlockedNumbers.CONTENT_URI, values)
                    Log.d(TAG, "Number \$incomingNumber added to system BlockedNumberContract")
                } catch (e: Exception) {
                    Log.e(TAG, "Failed to add number to system block list", e)
                }
            }
        } else {
            // Allow the call
            respondToCall(callDetails, CallResponse.Builder().build())
        }
    }
}
