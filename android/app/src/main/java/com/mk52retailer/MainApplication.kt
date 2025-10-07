package com.me52retailer

import android.app.Activity
import android.app.Application
import android.content.Intent
import android.os.Bundle
import android.util.Log
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactInstanceEventListener
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative

class MainApplication : Application(), ReactApplication {

  companion object {
    var currentActivity: Activity? = null
    private var queuedIntent: Intent? = null
    private var reactContext: ReactContext? = null
    private var queuedPayload: String? = null

    @JvmStatic
    fun setQueuedPayload(payload: String) {
        queuedPayload = payload
    }

    @JvmStatic
    fun consumeQueuedPayload(): String? {
        val temp = queuedPayload
        queuedPayload = null
        return temp
    }

    @JvmStatic
    fun setReactContext(context: ReactContext?) {
        reactContext = context
        Log.d("MainApplication", "ReactContext is now set in MainApplication")
    }
    
    @JvmStatic
    fun getQueuedIntent(): Intent? = queuedIntent
    
    @JvmStatic
    fun setQueuedIntent(intent: Intent?) {
      queuedIntent = intent
    }

    @JvmStatic
    fun getReactContext(): ReactContext? = reactContext
  }

  override val reactNativeHost: ReactNativeHost =
    object : DefaultReactNativeHost(this) {
      override fun getPackages(): List<ReactPackage> {
        val packages = PackageList(this).packages.toMutableList()
        return packages
      }

      override fun getJSMainModuleName(): String = "index"
      override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG
      override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
      override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
    }

  override val reactHost: ReactHost
    get() = getDefaultReactHost(applicationContext, reactNativeHost)

  override fun onCreate() {
    super.onCreate()
    loadReactNative(this)

    // Track current activity
    registerActivityLifecycleCallbacks(object : ActivityLifecycleCallbacks {
      override fun onActivityResumed(activity: Activity) {
        currentActivity = activity
      }
      override fun onActivityPaused(activity: Activity) {
        if (currentActivity === activity) currentActivity = null
      }
      override fun onActivityCreated(activity: Activity, savedInstanceState: Bundle?) {}
      override fun onActivityStarted(activity: Activity) {}
      override fun onActivityStopped(activity: Activity) {}
      override fun onActivitySaveInstanceState(activity: Activity, outState: Bundle) {}
      override fun onActivityDestroyed(activity: Activity) {}
    })

    // 🔁 Listen for when ReactContext is initialized
    reactNativeHost.reactInstanceManager.addReactInstanceEventListener(
      object : ReactInstanceEventListener {
        override fun onReactContextInitialized(context: ReactContext) {
          Log.d("ME52RETAILERTESTING MainApplication", "ReactContext is now available")
          reactContext = context

          // ✅ If something was queued before context was ready, handle it here
          val intent = getQueuedIntent()
          if (intent != null) {
            // Do something like navigate or emit an event
            Log.d("ME52RETAILERTESTING MainApplication", "Handling queued intent")
            // Clear after using
            setQueuedIntent(null)
          }
        }
      }
    )
  }
}

