package com.skora.hrms.location;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;

/**
 * Boot Receiver — Restarts location tracking after device reboot
 * 
 * When the phone restarts, Android kills all services.
 * This receiver listens for BOOT_COMPLETED and restarts
 * the LocationForegroundService if the employee was punched in.
 */
public class BootReceiver extends BroadcastReceiver {

    @Override
    public void onReceive(Context context, Intent intent) {
        if (Intent.ACTION_BOOT_COMPLETED.equals(intent.getAction())) {
            // Check if employee was tracked before reboot
            SharedPreferences prefs = context.getSharedPreferences("skora-hrms", Context.MODE_PRIVATE);
            boolean wasTracking = prefs.getBoolean("gps_tracking_active", false);

            if (wasTracking) {
                // Restart the foreground service
                Intent serviceIntent = new Intent(context, LocationForegroundService.class);
                serviceIntent.putExtra("title", "Skora HRMS");
                serviceIntent.putExtra("body", "Location tracking restored after restart");
                serviceIntent.putExtra("intervalMs", 30000L);
                context.startForegroundService(serviceIntent);
            }
        }
    }
}
