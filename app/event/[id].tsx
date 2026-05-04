import { useEffect } from 'react'
import { useLocalSearchParams, router } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { View, ActivityIndicator } from 'react-native'

// Deep-link route: pareaapp://event/123 or https://joinparea.app/event/123
// Stashes the id and redirects to the main feed, where FeedScreen reads it on mount and opens the event detail.
export default function EventDeepLink() {
  const { id } = useLocalSearchParams<{ id: string }>()
  useEffect(() => {
    (async () => {
      if (id) await AsyncStorage.setItem('pendingDeepLinkEventId', String(id))
      router.replace('/(tabs)')
    })()
  }, [id])
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#080B16' }}>
      <ActivityIndicator color="#A78BFA" size="large" />
    </View>
  )
}
