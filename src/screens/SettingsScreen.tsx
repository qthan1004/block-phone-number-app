import React from 'react';
import {ScrollView, View, TextInput, TouchableOpacity} from 'react-native';
import {Text, Surface} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useApp} from '../contexts/AppContext';
import {NativeCallScreening} from '../services/NativeCallScreening';
import {SettingsScreenStyles as styles} from '../styles';

export const SettingsScreen = () => {
  const {settings, updateSettings, callLogs} = useApp();
  const [strictnessInput, setStrictnessInput] = React.useState(
    settings.rating.toString(),
  );
  const [hasRole, setHasRole] = React.useState(false);

  React.useEffect(() => {
    NativeCallScreening.checkRoleStatus().then(setHasRole);
  }, []);

  React.useEffect(() => {
    setStrictnessInput(settings.rating.toString());
  }, [settings.rating]);

  const toggleSwitch = () =>
    updateSettings({isServiceEnabled: !settings.isServiceEnabled});

  const handleStrictnessChange = (text: string) => {
    const numericText = text.replace(/[^0-9]/g, '');
    setStrictnessInput(numericText);
    if (numericText !== '') {
      let num = parseInt(numericText, 10);
      if (num > 100) {
        num = 100;
      }
      updateSettings({rating: num});
    }
  };

  const handleStrictnessBlur = () => {
    let num = parseInt(strictnessInput, 10);
    if (isNaN(num) || strictnessInput === '') {
      num = 75; // Default fallback
    } else if (num > 100) {
      num = 100;
    }
    setStrictnessInput(num.toString());
    updateSettings({rating: num});
  };

  const handleRequestRole = async () => {
    const granted = await NativeCallScreening.requestRole();
    if (granted) {
      setHasRole(true);
    }
  };

  const blockedCount = callLogs.filter(log => log.action === 'BLOCKED').length;
  const allowedCount = callLogs.filter(log => log.action === 'ALLOWED').length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Modern Shield</Text>
          <Text style={styles.headerSubtitle}>DASHBOARD</Text>
        </View>
      </View>

      {/* Main Content Area */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{flexGrow: 1}}>
        <View style={styles.mainContent}>
          {/* Hero Toggle Section */}
          <View style={styles.heroSection}>
            <TouchableOpacity
              style={[
                styles.heroButton,
                !settings.isServiceEnabled && styles.heroButtonInactive,
              ]}
              onPress={toggleSwitch}
              activeOpacity={0.8}>
              <MaterialCommunityIcons
                name="shield-check"
                size={48}
                color="#FFF"
              />
            </TouchableOpacity>
            <View style={{alignItems: 'center'}}>
              <Text style={styles.heroTitle}>
                {settings.isServiceEnabled
                  ? 'Shield Active'
                  : 'Shield Inactive'}
              </Text>
              <Text style={styles.heroSubtitle}>
                Blocking neighbor spoofing
              </Text>
            </View>
          </View>

          {/* Strictness Input */}
          <Surface style={styles.card}>
            <View style={styles.cardRow}>
              <View style={styles.cardTextContainer}>
                <Text style={styles.cardTitle}>Strictness</Text>
                <Text style={styles.cardSubtitle}>
                  Match threshold (0-100%)
                </Text>
              </View>
              <View style={styles.inputWrapper}>
                <TextInput
                  testID="input-strictness"
                  style={styles.strictnessInput}
                  keyboardType="number-pad"
                  maxLength={3}
                  value={strictnessInput}
                  onChangeText={handleStrictnessChange}
                  onBlur={handleStrictnessBlur}
                />
                <Text style={styles.inputSuffix}>%</Text>
              </View>
            </View>
          </Surface>

          {/* System Permission */}
          <Surface style={[styles.card, {marginTop: 16}]}>
            <View style={styles.cardRow}>
              <View style={styles.cardTextContainer}>
                <Text style={styles.cardTitle}>Cấp quyền Hệ thống</Text>
                <Text style={styles.cardSubtitle}>
                  Quyền chặn cuộc gọi dưới nền (Caller ID & Spam role)
                </Text>
              </View>
              <TouchableOpacity
                disabled={hasRole}
                style={{
                  backgroundColor: hasRole ? '#2ED299' : '#5c11d4',
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 8,
                }}
                onPress={handleRequestRole}>
                <Text style={{color: '#fff', fontWeight: 'bold', fontSize: 13}}>
                  {hasRole ? 'ĐÃ BẬT' : 'BẬT QUYỀN'}
                </Text>
              </TouchableOpacity>
            </View>
          </Surface>

          {/* Stat Cards */}
          <View style={styles.statsContainer}>
            <Surface style={styles.statCard} elevation={2}>
              <View style={styles.iconCircleRed}>
                <MaterialCommunityIcons
                  name="cancel"
                  size={20}
                  color="#FF5A5F"
                />
              </View>
              <View style={{marginTop: 12}}>
                <Text style={styles.statNumber}>{blockedCount}</Text>
                <Text style={styles.statLabel}>BLOCKED</Text>
              </View>
            </Surface>

            <Surface style={styles.statCard} elevation={2}>
              <View style={styles.iconCircleGreen}>
                <MaterialCommunityIcons
                  name="check-circle"
                  size={20}
                  color="#2ED299"
                />
              </View>
              <View style={{marginTop: 12}}>
                <Text style={styles.statNumber}>{allowedCount}</Text>
                <Text style={styles.statLabel}>ALLOWED</Text>
              </View>
            </Surface>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default SettingsScreen;
