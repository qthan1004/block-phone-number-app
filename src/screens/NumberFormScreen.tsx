import React, {useState} from 'react';
import {
  View,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import {Text} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useApp} from '../contexts/AppContext';
import {NumberFormScreenStyles as styles} from '../styles';

export const NumberFormScreen = ({navigation, route}: any) => {
  const {addBlockedNumber, updateBlockedNumber} = useApp();

  const editingRule = route.params?.rule;
  const isEditing = !!editingRule;

  const [targetSequence, setTargetSequence] = useState(
    editingRule?.rawNumber || '',
  );
  const [label, setLabel] = useState(editingRule?.label || '');
  const [, setErrorMsg] = useState('');

  const generateId = () =>
    Date.now().toString() + Math.random().toString(36).substring(2);

  const handleSave = async () => {
    // Basic validation
    if (!targetSequence.trim()) {
      setErrorMsg('Sequence cannot be empty.');
      return;
    }
    setErrorMsg('');

    const normalized = targetSequence.replace(/[^\d+*]/gi, '').toUpperCase();

    // Validate if normalized has actual numbers (or asterisks)
    if (!/[\d*]/.test(normalized) && normalized !== '') {
      setErrorMsg('Please enter a valid phone number or wildcard pattern.');
      return;
    }

    const payload = {
      label: label.trim() || 'Blocked Sample',
      rawNumber: targetSequence.trim(),
      phoneNumber: normalized,
      updatedAt: Date.now(),
    };

    if (isEditing) {
      await updateBlockedNumber(editingRule.id, payload);
    } else {
      await addBlockedNumber({
        ...payload,
        id: generateId(),
        createdAt: Date.now(),
      });
    }

    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.content}>
        {/* Header matching CallLog header style but customized */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {isEditing ? 'Edit Rule' : 'New Rule'}
          </Text>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="close" size={24} color="#8D93A5" />
          </TouchableOpacity>
        </View>

        {/* Scrollable Form */}
        <ScrollView
          style={styles.formArea}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {/* Input Area */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>SAMPLE NUMBER</Text>
            <View style={styles.inputContainer}>
              <View style={styles.inputIcon}>
                <MaterialCommunityIcons
                  name="dialpad"
                  size={32}
                  color="#5c11d4"
                />
              </View>
              <TextInput
                testID="input-phone"
                style={styles.hugeInput}
                placeholder="+84 987 654 321"
                placeholderTextColor="#8D93A580"
                value={targetSequence}
                onChangeText={txt => {
                  const filtered = txt.replace(/[^0-9+*\s]/g, '');
                  setTargetSequence(filtered);
                  setErrorMsg('');
                }}
                autoFocus
                keyboardType="phone-pad"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            <Text style={styles.inputHelp}>
              Enter a sample phone number. Incoming calls similar to this number
              will be blocked based on your Strictness setting.
            </Text>
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>NAME (OPTIONAL)</Text>
            <View style={styles.inputContainer}>
              <TextInput
                testID="input-label"
                style={styles.normalInput}
                placeholder="e.g. Spam Caller"
                placeholderTextColor="#8D93A580"
                value={label}
                onChangeText={setLabel}
              />
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            testID="btn-deploy"
            style={[
              styles.deployBtn,
              !targetSequence && styles.deployBtnDisabled,
            ]}
            onPress={handleSave}
            disabled={!targetSequence}
            activeOpacity={0.8}>
            <MaterialCommunityIcons
              name="shield-check"
              size={24}
              color="#FFFFFF"
            />
            <Text style={styles.deployBtnText}>Deploy Shield</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default NumberFormScreen;
