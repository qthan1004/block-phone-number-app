import React, {useMemo} from 'react';
import {View, SectionList, TouchableOpacity, Alert} from 'react-native';
import {Text, Surface} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useApp} from '../contexts/AppContext';
import {CallLogEntry} from '../types';
import {CallLogScreenStyles as styles} from '../styles';

const CallLogItem = ({item}: {item: CallLogEntry}) => {
  const isBlocked = item.action === 'BLOCKED';

  const color = isBlocked ? '#FF5A5F' : '#2ED299';
  const bgColor = isBlocked
    ? 'rgba(255, 90, 95, 0.1)'
    : 'rgba(46, 210, 153, 0.1)';
  const badgeBg = isBlocked
    ? 'rgba(255, 90, 95, 0.15)'
    : 'rgba(46, 210, 153, 0.15)';
  const icon = isBlocked ? 'phone-hangup' : 'phone-in-talk';

  const timeString = new Date(item.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Surface style={styles.card} elevation={1}>
      <View style={styles.cardHeader}>
        <View style={styles.cardLeft}>
          <View style={[styles.iconContainer, {backgroundColor: bgColor}]}>
            <MaterialCommunityIcons name={icon} size={24} color={color} />
          </View>
          <View>
            <Text style={styles.numberText}>{item.incomingNumber}</Text>
            <Text style={styles.timeText}>{timeString}</Text>
          </View>
        </View>

        <View style={styles.cardRight}>
          <View
            style={[
              styles.badge,
              {backgroundColor: badgeBg, borderColor: color + '33'},
            ]}>
            <Text style={[styles.badgeText, {color}]}>
              {item.action} • {item.similarity.toFixed(0)}%
            </Text>
          </View>
        </View>
      </View>
    </Surface>
  );
};

export const CallLogScreen = () => {
  const {callLogs, clearCallLogs} = useApp();

  const handleClear = () => {
    Alert.alert(
      'Xoá Lịch Sử',
      'Bạn có chắc muốn xoá toàn bộ lịch sử cuộc gọi chặn?',
      [
        {text: 'Hủy', style: 'cancel'},
        {text: 'Xoá', style: 'destructive', onPress: clearCallLogs},
      ],
    );
  };

  const sections = useMemo(() => {
    const groups: {[key: string]: CallLogEntry[]} = {};

    // Đảm bảo callLogs đã được sort mới nhất lên đầu
    const sortedLogs = [...callLogs].sort((a, b) => b.timestamp - a.timestamp);

    sortedLogs.forEach(log => {
      // Group by date (e.g., "27/03/2026")
      const dateStr = new Date(log.timestamp).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
      if (!groups[dateStr]) {
        groups[dateStr] = [];
      }
      groups[dateStr].push(log);
    });

    return Object.keys(groups).map(dateStr => ({
      title: dateStr,
      data: groups[dateStr],
    }));
  }, [callLogs]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Call Log</Text>
        {callLogs.length > 0 && (
          <TouchableOpacity
            style={styles.filterBtn}
            onPress={handleClear}
            activeOpacity={0.7}>
            <MaterialCommunityIcons
              name="delete-sweep"
              size={24}
              color="#FF5A5F"
            />
          </TouchableOpacity>
        )}
      </View>

      <SectionList
        sections={sections}
        keyExtractor={item => item.id.toString()}
        renderItem={({item}) => <CallLogItem item={item} />}
        renderSectionHeader={({section: {title}}) => (
          <Text style={styles.sectionHeader}>{title}</Text>
        )}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <MaterialCommunityIcons
                name="history"
                size={48}
                color="rgba(141, 147, 165, 0.5)"
              />
            </View>
            <Text style={styles.emptyTitle}>Chưa có lịch sử cuộc gọi</Text>
            <Text style={styles.emptySubtitle}>
              Khiên chặn rác đang hoạt động theo dõi.
            </Text>
          </View>
        }
      />
    </View>
  );
};

export default CallLogScreen;
