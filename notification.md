import React, { useState, useRef, useEffect } from "react";
import { Bell, Check, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import NotificationItem from "./NotificationItem";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => base44.entities.Notification.list("-created_date", 50),
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Notification.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Notification.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markAllRead = () => {
    notifications
      .filter((n) => !n.is_read)
      .forEach((n) => updateMutation.mutate({ id: n.id, data: { is_read: true } }));
  };

  const handleRead = (notification) => {
    if (!notification.is_read) {
      updateMutation.mutate({ id: notification.id, data: { is_read: true } });
    }
  };

  const clearAll = () => {
    notifications.forEach((n) => deleteMutation.mutate(n.id));
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      {/* Bell Button */}
      <motion.button
        onClick={() => setOpen(!open)}
        whileTap={{ scale: 0.92 }}
        whileHover={{ scale: 1.05 }}
        className={cn(
          "relative flex items-center justify-center w-11 h-11 rounded-2xl transition-all duration-300",
          open
            ? "bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-400/40"
            : "bg-gradient-to-br from-slate-800 to-slate-700 shadow-md shadow-slate-400/30 hover:shadow-slate-400/50"
        )}
      >
        {/* Glass shine */}
        <span className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
          <span className="absolute top-0 left-0 right-0 h-1/2 bg-white/10 rounded-t-2xl" />
        </span>

        <motion.div
          animate={unreadCount > 0 ? { rotate: [0, -15, 15, -10, 10, 0] } : {}}
          transition={{ duration: 0.6, delay: 0.3, repeat: Infinity, repeatDelay: 4 }}
        >
          <Bell className="w-5 h-5 text-white drop-shadow-sm" />
        </motion.div>

        {/* Badge */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className="absolute -top-1.5 -right-1.5 flex items-center justify-center"
            >
              <span className="absolute w-6 h-6 rounded-full bg-rose-400/40 animate-ping" />
              <span className="relative flex items-center justify-center min-w-[22px] h-[22px] px-1 rounded-full bg-gradient-to-br from-rose-500 to-red-600 text-white text-[10px] font-bold shadow-lg shadow-red-500/50 ring-2 ring-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 mt-2 w-[380px] max-w-[calc(100vw-32px)] bg-white rounded-2xl shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden z-50"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-[15px] font-semibold text-slate-900 tracking-tight">
                    Уведомления
                  </h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 text-[11px] font-semibold bg-red-50 text-red-600 rounded-full">
                      {unreadCount} новых
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
                      title="Прочитать все"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={clearAll}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200"
                      title="Удалить все"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Notifications List */}
            {notifications.length > 0 ? (
              <ScrollArea className="max-h-[400px]">
                <div className="divide-y divide-slate-50">
                  {notifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onRead={handleRead}
                    />
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="py-12 text-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-3">
                  <Bell className="w-5 h-5 text-slate-300" />
                </div>
                <p className="text-sm font-medium text-slate-400">
                  Нет уведомлений
                </p>
                <p className="text-xs text-slate-300 mt-1">
                  Здесь появятся ваши уведомления
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import React from "react";
import { Info, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import { cn } from "@/lib/utils";

const typeConfig = {
  info: {
    icon: Info,
    bg: "bg-blue-50",
    iconColor: "text-blue-500",
    dot: "bg-blue-500",
  },
  success: {
    icon: CheckCircle,
    bg: "bg-emerald-50",
    iconColor: "text-emerald-500",
    dot: "bg-emerald-500",
  },
  warning: {
    icon: AlertTriangle,
    bg: "bg-amber-50",
    iconColor: "text-amber-500",
    dot: "bg-amber-500",
  },
  error: {
    icon: XCircle,
    bg: "bg-red-50",
    iconColor: "text-red-500",
    dot: "bg-red-500",
  },
};

export default function NotificationItem({ notification, onRead }) {
  const config = typeConfig[notification.type] || typeConfig.info;
  const Icon = config.icon;

  return (
    <button
      onClick={() => onRead(notification)}
      className={cn(
        "w-full flex items-start gap-3 px-4 py-3.5 text-left transition-all duration-200 hover:bg-slate-50/80",
        !notification.is_read && "bg-slate-50/50"
      )}
    >
      <div className={cn("mt-0.5 p-2 rounded-xl shrink-0", config.bg)}>
        <Icon className={cn("w-4 h-4", config.iconColor)} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={cn(
            "text-sm truncate",
            !notification.is_read ? "font-semibold text-slate-900" : "font-medium text-slate-600"
          )}>
            {notification.title}
          </p>
          {!notification.is_read && (
            <span className={cn("w-2 h-2 rounded-full shrink-0", config.dot)} />
          )}
        </div>
        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
          {notification.message}
        </p>
        <p className="text-[11px] text-slate-400 mt-1.5">
          {notification.created_date
            ? formatDistanceToNow(new Date(notification.created_date), { addSuffix: true, locale: ru })
            : ""}
        </p>
      </div>
    </button>
  );
}