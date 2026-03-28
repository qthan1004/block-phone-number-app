package com.callblocker

import android.app.Activity
import android.app.role.RoleManager
import android.content.Context
import android.content.Intent
import android.os.Build
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.BaseActivityEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class CallScreeningModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private var requestRolePromise: Promise? = null
    private val REQUEST_ID = 1234

    private val activityEventListener: ActivityEventListener = object : BaseActivityEventListener() {
        override fun onActivityResult(activity: Activity?, requestCode: Int, resultCode: Int, data: Intent?) {
            if (requestCode == REQUEST_ID) {
                if (resultCode == Activity.RESULT_OK) {
                    requestRolePromise?.resolve(true)
                } else {
                    requestRolePromise?.resolve(false)
                }
                requestRolePromise = null
            }
        }
    }

    init {
        reactContext.addActivityEventListener(activityEventListener)
    }

    override fun getName(): String {
        return "CallScreeningModule"
    }

    @ReactMethod
    fun requestRole(promise: Promise) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            val roleManager = reactApplicationContext.getSystemService(Context.ROLE_SERVICE) as RoleManager
            val intent = roleManager.createRequestRoleIntent(RoleManager.ROLE_CALL_SCREENING)
            val activity = currentActivity
            
            if (activity != null) {
                requestRolePromise = promise
                activity.startActivityForResult(intent, REQUEST_ID)
            } else {
                promise.reject("E_ACTIVITY_DOES_NOT_EXIST", "Activity doesn't exist")
            }
        } else {
            promise.reject("E_UNSUPPORTED_VERSION", "Call screening requires Android 10 (API 29) or higher.")
        }
    }

    @ReactMethod
    fun checkRoleStatus(promise: Promise) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            val roleManager = reactApplicationContext.getSystemService(Context.ROLE_SERVICE) as RoleManager
            val hasRole = roleManager.isRoleHeld(RoleManager.ROLE_CALL_SCREENING)
            promise.resolve(hasRole)
        } else {
            promise.resolve(false)
        }
    }

    @ReactMethod
    fun syncData(blockedNumbers: String, settingsStr: String, promise: Promise) {
        try {
            val prefs = reactApplicationContext.getSharedPreferences("CallBlockerPrefs", Context.MODE_PRIVATE)
            val editor = prefs.edit()

            editor.putString("blockedNumbers", blockedNumbers)

            // Parse simple settings string if it's JSON
            try {
                val settingsJson = org.json.JSONObject(settingsStr)
                if (settingsJson.has("strictness")) {
                    editor.putInt("strictnessRating", settingsJson.getInt("strictness"))
                }
                if (settingsJson.has("serviceEnabled")) {
                    editor.putBoolean("serviceEnabled", settingsJson.getBoolean("serviceEnabled"))
                }
            } catch (e: Exception) {
                // Ignore parse errors, just don't update settings
            }

            editor.apply()
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("E_SYNC_FAILED", e)
        }
    }
}
