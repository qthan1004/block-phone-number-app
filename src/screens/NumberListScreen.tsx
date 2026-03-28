import React, {useState} from 'react';
import {
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {Text, Surface} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useApp} from '../contexts/AppContext';
import {BlockedNumber} from '../types';
import {NumberListScreenStyles as styles} from '../styles';
import {Alert} from 'react-native';

export const NumberListScreen = ({navigation}: any) => {
  const {blockedNumbers, deleteBlockedNumber} = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const confirmDelete = (id: string) => {
    Alert.alert(
      'Delete Rule',
      'Are you sure you want to remove this blocked number rule?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteBlockedNumber(id),
        },
      ],
    );
  };

  const filteredNumbers = blockedNumbers.filter(
    n =>
      n.rawNumber.includes(searchQuery) ||
      (n.label && n.label.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const getRuleIcon = (raw: string) => {
    if (raw.includes('*') || raw.includes('X')) {
      return 'shield';
    }
    if (raw.length < 10) {
      return 'map';
    }
    return 'block-helper';
  };

  const getRuleColor = (raw: string) => {
    if (raw.includes('*') || raw.includes('X')) {
      return '#5c11d4';
    } // primary
    if (raw.length < 10) {
      return '#5c11d4';
    } // primary
    return '#FF5A5F'; // danger for exact match
  };

  const getRuleType = (raw: string) => {
    return 'Sample Number';
  };

  const renderItem = ({item}: {item: BlockedNumber}) => {
    const color = getRuleColor(item.rawNumber);
    const icon = getRuleIcon(item.rawNumber);
    const isExactMatch = color === '#FF5A5F';

    return (
      <Surface style={styles.card} elevation={2}>
        <View style={styles.cardContent}>
          <View style={styles.textContainer}>
            <Text
              style={[styles.patternText, isExactMatch && {color: '#1A1B25'}]}>
              {item.rawNumber}
            </Text>
            <Text
              style={[
                styles.typeText,
                {color: isExactMatch ? '#FF5A5F' : '#8D93A5'},
              ]}>
              {item.label || getRuleType(item.rawNumber)}
            </Text>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 16}}>
            <TouchableOpacity
              testID={`edit-button-${item.rawNumber}`}
              onPress={() => navigation.navigate('NumberForm', {rule: item})}>
              <MaterialCommunityIcons
                name="pencil-outline"
                size={24}
                color="#8D93A5"
              />
            </TouchableOpacity>
            <TouchableOpacity
              testID={`delete-button-${item.rawNumber}`}
              onPress={() => confirmDelete(item.id)}>
              <MaterialCommunityIcons
                name="delete-outline"
                size={24}
                color="#FF5A5F"
              />
            </TouchableOpacity>
          </View>
        </View>
      </Surface>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Blocklist</Text>
        <View style={styles.searchBar}>
          <MaterialCommunityIcons name="magnify" size={24} color="#8D93A5" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search phone numbers..."
            placeholderTextColor="#8D93A5"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <FlatList
        data={filteredNumbers}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No blocked numbers configured.</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        testID="add-fab"
        activeOpacity={0.8}
        onPress={() => navigation.navigate('NumberForm')}>
        <MaterialCommunityIcons name="plus" size={32} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

export default NumberListScreen;
