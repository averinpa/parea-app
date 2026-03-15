// components/NotificationItem.js
import { Ionicons } from '@expo/vector-icons'
import { useRef } from 'react'
import {
  Animated,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

const TYPE_CONFIG = {
  info: {
    icon: 'information-circle',
    bg: 'rgba(99,179,237,0.15)',
    iconColor: '#63B3ED',
    dot: '#63B3ED',
    accent: 'rgba(99,179,237,0.3)',
  },
  success: {
    icon: 'checkmark-circle',
    bg: 'rgba(104,211,145,0.15)',
    iconColor: '#68D391',
    dot: '#68D391',
    accent: 'rgba(104,211,145,0.3)',
  },
  warning: {
    icon: 'warning',
    bg: 'rgba(246,173,85,0.15)',
    iconColor: '#F6AD55',
    dot: '#F6AD55',
    accent: 'rgba(246,173,85,0.3)',
  },
  error: {
    icon: 'close-circle',
    bg: 'rgba(252,129,129,0.15)',
    iconColor: '#FC8181',
    dot: '#FC8181',
    accent: 'rgba(252,129,129,0.3)',
  },
  match: {
    icon: 'heart',
    bg: 'rgba(245,101,255,0.15)',
    iconColor: '#F565FF',
    dot: '#F565FF',
    accent: 'rgba(245,101,255,0.3)',
  },
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default function NotificationItem({ notification, onRead, onDelete }) {
  const cfg = TYPE_CONFIG[notification.type] || TYPE_CONFIG.info
  const swipeX = useRef(new Animated.Value(0)).current
  const itemHeight = useRef(new Animated.Value(76)).current
  const opacity = useRef(new Animated.Value(1)).current

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dx) > 10 && Math.abs(gs.dy) < 20,
      onPanResponderMove: (_, gs) => {
        if (gs.dx < 0) swipeX.setValue(gs.dx)
      },
      onPanResponderRelease: (_, gs) => {
        if (gs.dx < -80) {
          // delete
          Animated.parallel([
            Animated.timing(swipeX, { toValue: -400, duration: 250, useNativeDriver: false }),
            Animated.timing(itemHeight, { toValue: 0, duration: 300, delay: 150, useNativeDriver: false }),
            Animated.timing(opacity, { toValue: 0, duration: 300, delay: 150, useNativeDriver: false }),
          ]).start(() => onDelete && onDelete(notification.id))
        } else {
          Animated.spring(swipeX, { toValue: 0, useNativeDriver: false }).start()
        }
      },
    })
  ).current

  const handlePress = () => {
    if (!notification.is_read) onRead && onRead(notification)
  }

  return (
    <Animated.View style={[s.wrapper, { height: itemHeight, opacity }]}>
      {/* Delete hint behind item */}
      <View style={s.deleteHint}>
        <Ionicons name="trash" size={20} color="#FC8181" />
        <Text style={s.deleteHintTxt}>Delete</Text>
      </View>

      <Animated.View
        style={[s.row, { transform: [{ translateX: swipeX }] }]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          onPress={handlePress}
          activeOpacity={0.75}
          style={[s.inner, !notification.is_read && { backgroundColor: 'rgba(187,134,252,0.06)' }]}
        >
          {/* Icon */}
          <View style={[s.iconWrap, { backgroundColor: cfg.bg }]}>
            <Ionicons name={cfg.icon} size={20} color={cfg.iconColor} />
          </View>

          {/* Content */}
          <View style={s.content}>
            <View style={s.titleRow}>
              <Text
                style={[s.title, !notification.is_read && s.titleUnread]}
                numberOfLines={1}
              >
                {notification.title}
              </Text>
              {!notification.is_read && (
                <View style={[s.dot, { backgroundColor: cfg.dot }]} />
              )}
            </View>
            <Text style={s.message} numberOfLines={2}>{notification.message}</Text>
            <Text style={s.time}>{timeAgo(notification.created_date)}</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  )
}

const s = StyleSheet.create({
  wrapper: {
    overflow: 'hidden',
    position: 'relative',
  },
  deleteHint: {
    position: 'absolute',
    right: 20,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  deleteHintTxt: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FC8181',
    letterSpacing: 0.5,
  },
  row: {
    flex: 1,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    flex: 1,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  content: { flex: 1 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.65)',
    flex: 1,
  },
  titleUnread: {
    fontWeight: '700',
    color: '#fff',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  message: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    lineHeight: 17,
    marginBottom: 4,
  },
  time: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.25)',
    fontWeight: '500',
  },
})
