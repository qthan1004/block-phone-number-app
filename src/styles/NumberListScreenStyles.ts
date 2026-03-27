import {StyleSheet, Platform} from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F9',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 48,
    paddingBottom: 16,
    backgroundColor: 'rgba(244, 246, 249, 0.9)',
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1B25',
    marginBottom: 24,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    height: 56,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 8,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1A1B25',
  },
  listContainer: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 120, // Space for FAB and TabBar
    gap: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    height: 80,
    shadowColor: '#5c11d4',
    shadowOpacity: 0.08,
    shadowOffset: {width: 0, height: 12},
    shadowRadius: 32,
    elevation: 4,
    marginBottom: 16,
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  textContainer: {
    flex: 1,
  },
  patternText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#5c11d4', // Default to primary, overridden in inline style if danger
    letterSpacing: 0.5,
  },
  typeText: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    color: '#8D93A5',
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: Platform.OS === 'ios' ? 120 : 100, // Above TabBar
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#2ED299', // accent
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2ED299',
    shadowOpacity: 0.25,
    shadowOffset: {width: 0, height: 8},
    shadowRadius: 24,
    elevation: 8,
  },
});
