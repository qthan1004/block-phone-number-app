package com.callblocker

import android.content.ContentValues
import android.content.Context
import android.net.Uri
import android.provider.BlockedNumberContract
import android.telecom.Call
import android.telecom.CallScreeningService
import android.util.Log
import org.json.JSONArray
import android.database.sqlite.SQLiteDatabase

class CallScreenerService : CallScreeningService() {
    companion object {
        const val TAG = "CallScreenerService"
    }

    private fun logCallAsync(incomingNumber: String, matchedPattern: String, similarity: Double, action: String) {
        Thread {
            try {
                val dbPath = getDatabasePath("CallBlocker.db").absolutePath
                val db = SQLiteDatabase.openOrCreateDatabase(dbPath, null)
                
                db.execSQL("""
                    CREATE TABLE IF NOT EXISTS call_logs (
                      id INTEGER PRIMARY KEY AUTOINCREMENT,
                      incomingNumber TEXT NOT NULL,
                      matchedPattern TEXT,
                      similarity REAL,
                      action TEXT NOT NULL,
                      timestamp INTEGER NOT NULL
                    );
                """.trimIndent())

                val values = ContentValues().apply {
                    put("incomingNumber", incomingNumber)
                    put("matchedPattern", matchedPattern)
                    put("similarity", similarity)
                    put("action", action)
                    put("timestamp", System.currentTimeMillis())
                }
                db.insert("call_logs", null, values)
                db.close()
                Log.d(TAG, "Call logged to internal SQLite successfully")
            } catch (e: Exception) {
                Log.e(TAG, "Failed to log call to SQLite", e)
            }
        }.start()
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
        var matchedPattern = "None"
        var maxSimilarity = 0.0

        try {
            val jsonArray = JSONArray(blockedNumbersStr)
            for (i in 0 until jsonArray.length()) {
                val item = jsonArray.getJSONObject(i)
                val rawNumber = item.optString("rawNumber", "")
                val normalizedTarget = MatchingEngine.normalizePhoneNumber(rawNumber)
                
                val similarity = MatchingEngine.calculateSimilarityPercentage(normalizedIncoming, normalizedTarget)
                if (similarity >= strictnessRating) {
                    shouldBlock = true
                    matchedPattern = rawNumber
                    maxSimilarity = similarity
                    Log.d(TAG, "Call from \$incomingNumber blocked! Matched \$rawNumber with similarity \$similarity%")
                    break
                } else if (similarity > maxSimilarity) {
                    maxSimilarity = similarity
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error parsing blocked numbers JSON", e)
        }

        if (shouldBlock) {
            // Silently reject the call ASAP
            val response = CallResponse.Builder()
                .setDisallowCall(true)
                .setRejectCall(true)
                .setSkipNotification(true)
                .setSkipCallLog(false)
                .build()
                
            respondToCall(callDetails, response)

            // Add the number to Android's built-in blocked list on a background thread
            Thread {
                try {
                    // Cố gắng insert thẳng (cấu hình OS cho Caller ID role đôi khi không bắt required permission)
                    val values = ContentValues().apply {
                        put(BlockedNumberContract.BlockedNumbers.COLUMN_ORIGINAL_NUMBER, incomingNumber)
                    }
                    contentResolver.insert(BlockedNumberContract.BlockedNumbers.CONTENT_URI, values)
                    Log.d(TAG, "Number \$incomingNumber added to system BlockedNumberContract")
                } catch (e: Exception) {
                    Log.e(TAG, "Failed to add number to system block list", e)
                }
            }.start()
            
            // Log to local Database on a background thread
            logCallAsync(incomingNumber, matchedPattern, maxSimilarity, "BLOCKED")
        } else {
            // Allow the call ASAP
            respondToCall(callDetails, CallResponse.Builder().build())
            logCallAsync(incomingNumber, "None", maxSimilarity, "ALLOWED")
        }
    }
}
