import { Platform } from 'react-native'
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import Constants from 'expo-constants'
import { supabase } from './supabase'

// Show notifications even when the app is foregrounded (banner + sound).
// Guarded off web — expo-notifications has no web handler and throws.
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  })
}

// Request permission + fetch the Expo push token, then persist it on the
// user's profile so the send-side edge function can target this device.
// Returns the token (or null when unavailable — web, simulator, denied, Expo Go).
export async function registerPushToken(profileId: string): Promise<string | null> {
  console.log('push: registerPushToken called, profileId=', profileId, 'platform=', Platform.OS, 'isDevice=', Device.isDevice)
  // No push on web, and only on physical devices.
  if (Platform.OS === 'web') { console.log('push: skip — web'); return null }
  if (!Device.isDevice) { console.log('push: skip — not a physical device'); return null }

  // Android needs a channel before tokens fire any UI.
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#6366F1',
    })
  }

  const { status: existing } = await Notifications.getPermissionsAsync()
  let status = existing
  console.log('push: existing permission =', existing)
  if (existing !== 'granted') {
    // iOS needs explicit alert/badge/sound options or the prompt grants
    // nothing usable. Android ignores the ios block.
    const req = await Notifications.requestPermissionsAsync({
      ios: { allowAlert: true, allowBadge: true, allowSound: true },
    })
    status = req.status
    console.log('push: requested permission, status =', status)
  }
  if (status !== 'granted') { console.log('push: skip — permission not granted'); return null }

  // projectId comes from app.json → extra.eas.projectId
  const projectId =
    Constants?.expoConfig?.extra?.eas?.projectId ??
    (Constants as any)?.easConfig?.projectId
  console.log('push: projectId =', projectId)
  if (!projectId) { console.warn('push: missing EAS projectId'); return null }

  try {
    const tokenResp = await Notifications.getExpoPushTokenAsync({ projectId })
    const token = tokenResp.data
    console.log('push: got token =', token)
    if (token && profileId) {
      const { error } = await supabase
        .from('profiles')
        .update({ expo_push_token: token })
        .eq('id', profileId)
      if (error) console.warn('push: token save error:', error.message)
      else console.log('push: token saved to profile OK')
    }
    return token
  } catch (e: any) {
    console.warn('push: getExpoPushToken failed:', e?.message)
    return null
  }
}

// Fire a push to one or more profiles via the send-push edge function.
// Fire-and-forget — never throws into the caller. `data` rides along so the
// tap handler can deep-link (e.g. { screen: 'chat', chatId }).
export async function sendPush(
  toProfileIds: string | string[],
  title: string,
  body: string,
  data?: Record<string, any>,
) {
  try {
    await supabase.functions.invoke('send-push', {
      body: { toProfileIds, title, body, data: data || {} },
    })
  } catch (e: any) {
    console.warn('push: send failed:', e?.message)
  }
}
