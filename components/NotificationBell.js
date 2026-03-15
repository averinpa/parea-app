// components/NotificationBell.js
import { Ionicons } from '@expo/vector-icons'
import { useEffect, useRef, useState } from 'react'
import {
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import NotificationItem from './NotificationItem'

const { height: H } = Dimensions.get('window')
const PANEL_HEIGHT = H * 0.72

// ─── Mock data (replace with real API later) ──────────────────────────────────
let NEXT_ID = 5
const INITIAL_NOTIFICATIONS = [
  {
    id: '1',
    type: 'match',
    title: 'New Match! 🎉',
    message: 'You and Sofia both want to go to the Jazz Night on Friday.',
    created_date: new Date(Date.now() - 2 * 60000).toISOString(),
    is_read: false,
  },
  {
    id: '2',
    type: 'info',
    title: 'Event starting soon',
    message: 'Board Game Evening at Aperanto starts in 1 hour. Your crew is ready.',
    created_date: new Date(Date.now() - 35 * 60000).toISOString(),
    is_read: false,
  },
  {
    id: '3',
    type: 'success',
    title: 'Profile approved',
    message: 'Your profile is live. People near you can now find you at events.',
    created_date: new Date(Date.now() - 3 * 3600000).toISOString(),
    is_read: true,
  },
  {
    id: '4',
    type: 'warning',
    title: 'Event almost full',
    message: 'Sunset Beach Volleyball you liked has only 2 spots left.',
    created_date: new Date(Date.now() - 24 * 3600000).toISOString(),
    is_read: true,
  },
]

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS)

  // bell ring animation
  const bellRot = useRef(new Animated.Value(0)).current
  // badge scale
  const badgeScale = useRef(new Animated.Value(0)).current
  // button press
  const btnScale = useRef(new Animated.Value(1)).current
  // panel slide
  const panelY = useRef(new Animated.Value(PANEL_HEIGHT)).current
  // backdrop opacity
  const backdropOpacity = useRef(new Animated.Value(0)).current

  const unreadCount = notifications.filter((n) => !n.is_read).length

  // Periodic bell ring when there are unread notifications
  useEffect(() => {
    if (unreadCount === 0) return
    const ring = () => {
      Animated.sequence([
        Animated.timing(bellRot, { toValue: 1, duration: 100, useNativeDriver: true }),
        Animated.timing(bellRot, { toValue: -1, duration: 100, useNativeDriver: true }),
        Animated.timing(bellRot, { toValue: 0.6, duration: 80, useNativeDriver: true }),
        Animated.timing(bellRot, { toValue: -0.6, duration: 80, useNativeDriver: true }),
        Animated.timing(bellRot, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start()
    }
    ring()
    const interval = setInterval(ring, 4500)
    return () => clearInterval(interval)
  }, [unreadCount])

  // Badge pop in/out
  useEffect(() => {
    Animated.spring(badgeScale, {
      toValue: unreadCount > 0 ? 1 : 0,
      useNativeDriver: true,
      tension: 400,
      friction: 15,
    }).start()
  }, [unreadCount])

  // Open/close panel
  useEffect(() => {
    if (open) {
      Animated.parallel([
        Animated.spring(panelY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 70,
          friction: 12,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start()
    } else {
      Animated.parallel([
        Animated.timing(panelY, {
          toValue: PANEL_HEIGHT,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [open])

  // Swipe down to close panel
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gs) => gs.dy > 10 && Math.abs(gs.dx) < 30,
      onPanResponderMove: (_, gs) => {
        if (gs.dy > 0) panelY.setValue(gs.dy)
      },
      onPanResponderRelease: (_, gs) => {
        if (gs.dy > 80 || gs.vy > 0.5) {
          setOpen(false)
        } else {
          Animated.spring(panelY, { toValue: 0, useNativeDriver: true }).start()
        }
      },
    })
  ).current

  const handleBellPress = () => {
    Animated.sequence([
      Animated.timing(btnScale, { toValue: 0.90, duration: 80, useNativeDriver: true }),
      Animated.spring(btnScale, { toValue: 1, useNativeDriver: true, tension: 300, friction: 10 }),
    ]).start()
    setOpen(v => !v)
  }

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
  }

  const handleRead = (notification) => {
    setNotifications(prev =>
      prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n)
    )
  }

  const handleDelete = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const clearAll = () => {
    setNotifications([])
  }

  const bellRotDeg = bellRot.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-20deg', '0deg', '20deg'],
  })

  return (
    <>
      {/* Bell Button */}
      <Animated.View style={{ transform: [{ scale: btnScale }] }}>
        <TouchableOpacity
          onPress={handleBellPress}
          activeOpacity={1}
          style={[s.bellBtn, unreadCount > 0 && s.bellBtnHasUnread, open && s.bellBtnActive]}
        >
          {/* Glass shine */}
          <View style={s.shine} pointerEvents="none" />

          <Animated.View style={{ transform: [{ rotate: bellRotDeg }] }}>
            <Ionicons
              name="notifications"
              size={22}
              color="#fff"
            />
          </Animated.View>

          {/* Badge */}
          <Animated.View
            style={[s.badge, { transform: [{ scale: badgeScale }] }]}
            pointerEvents="none"
          >
            <View style={s.badgePing} />
            <View style={s.badgeInner}>
              <Text style={s.badgeText}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </Text>
            </View>
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>

      {/* Bottom Sheet Modal */}
      <Modal
        visible={open}
        transparent
        statusBarTranslucent
        animationType="none"
        onRequestClose={() => setOpen(false)}
      >
        <View style={s.modalRoot}>
          {/* Backdrop */}
          <TouchableWithoutFeedback onPress={() => setOpen(false)}>
            <Animated.View style={[s.backdrop, { opacity: backdropOpacity }]} />
          </TouchableWithoutFeedback>

          {/* Panel */}
          <Animated.View
            style={[s.panel, { transform: [{ translateY: panelY }] }]}
          >
            {/* Drag handle */}
            <View {...panResponder.panHandlers} style={s.handleWrap}>
              <View style={s.handle} />
            </View>

            {/* Header */}
            <View style={s.panelHeader}>
              <View style={s.panelTitleRow}>
                <Text style={s.panelTitle}>Notifications</Text>
                {unreadCount > 0 && (
                  <View style={s.newBadge}>
                    <Text style={s.newBadgeText}>{unreadCount} new</Text>
                  </View>
                )}
              </View>

              <View style={s.headerActions}>
                {unreadCount > 0 && (
                  <TouchableOpacity onPress={markAllRead} style={s.headerBtn}>
                    <Ionicons name="checkmark-done" size={18} color="#BB86FC" />
                  </TouchableOpacity>
                )}
                {notifications.length > 0 && (
                  <TouchableOpacity onPress={clearAll} style={s.headerBtn}>
                    <Ionicons name="trash-outline" size={17} color="rgba(255,255,255,0.35)" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Divider */}
            <View style={s.divider} />

            {/* List */}
            {notifications.length > 0 ? (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}
                bounces
              >
                {notifications.map((n, i) => (
                  <View key={n.id}>
                    <NotificationItem
                      notification={n}
                      onRead={handleRead}
                      onDelete={handleDelete}
                    />
                    {i < notifications.length - 1 && <View style={s.separator} />}
                  </View>
                ))}
              </ScrollView>
            ) : (
              <View style={s.empty}>
                <View style={s.emptyIcon}>
                  <Ionicons name="notifications-off-outline" size={28} color="rgba(187,134,252,0.3)" />
                </View>
                <Text style={s.emptyTitle}>All caught up</Text>
                <Text style={s.emptySub}>No notifications yet</Text>
              </View>
            )}
          </Animated.View>
        </View>
      </Modal>
    </>
  )
}

const s = StyleSheet.create({
  // ─── Bell button
  bellBtn: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: 'rgba(187,134,252,0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(187,134,252,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'visible',
  },
  bellBtnHasUnread: {
    backgroundColor: 'rgba(187,134,252,0.2)',
    borderColor: 'rgba(187,134,252,0.5)',
  },
  bellBtnActive: {
    backgroundColor: 'rgba(187,134,252,0.35)',
    borderColor: '#BB86FC',
  },
  shine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },

  // ─── Badge
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgePing: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(229,62,62,0.35)',
  },
  badgeInner: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E53E3E',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#050509',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#fff',
    lineHeight: 12,
  },

  // ─── Modal
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },

  // ─── Panel
  panel: {
    height: PANEL_HEIGHT,
    backgroundColor: '#12082A',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(187,134,252,0.15)',
    borderBottomWidth: 0,
    overflow: 'hidden',
    // subtle top glow
    shadowColor: '#BB86FC',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 20,
  },
  handleWrap: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 6,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },

  // ─── Header
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  panelTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.3,
  },
  newBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: 'rgba(229,62,62,0.2)',
    borderRadius: 99,
    borderWidth: 1,
    borderColor: 'rgba(229,62,62,0.4)',
  },
  newBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FC8181',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 4,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ─── Divider / separator
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginHorizontal: 0,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    marginHorizontal: 20,
  },

  // ─── Empty state
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 60,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(187,134,252,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.25)',
  },
})
