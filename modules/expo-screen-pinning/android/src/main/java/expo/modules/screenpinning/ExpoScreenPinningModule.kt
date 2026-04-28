package expo.modules.screenpinning

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ExpoScreenPinningModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ExpoScreenPinning")

    Function("start") {
      val activity = appContext.currentActivity
      activity?.startLockTask()
    }

    Function("stop") {
      val activity = appContext.currentActivity
      activity?.stopLockTask()
    }

    Function("isPinned") {
      val activity = appContext.currentActivity ?: return@Function false
      val activityManager = activity.getSystemService(android.content.Context.ACTIVITY_SERVICE) as android.app.ActivityManager
      activityManager.lockTaskModeState != android.app.ActivityManager.LOCK_TASK_MODE_NONE
    }
  }
}
