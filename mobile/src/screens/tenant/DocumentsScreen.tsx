import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState, useLayoutEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Share, Alert } from 'react-native';
import { Text } from 'react-native-paper';

import { tenantApi } from '../../api/tenant';
import { Card } from '../../components/common/Card';
import { ErrorState } from '../../components/common/ErrorState';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { Skeleton } from '../../components/common/Skeleton';
import { colors } from '../../constants/colors';
import { screenStyles } from '../../constants/styles';
import type { TenantDocumentsStackParamList } from '../../navigation/AppNavigator';
import type { Document } from '../../types';
import { formatDate, capitalize } from '../../utils/formatters';

type NavigationProp = NativeStackNavigationProp<TenantDocumentsStackParamList>;

export function TenantDocumentsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Documents',
      headerShown: true,
      headerStyle: { backgroundColor: colors.surface },
      headerTintColor: colors.text.primary,
      headerShadowVisible: false,
    });
  }, [navigation]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      await new Promise(resolve => setTimeout(resolve, 200));
      const response = await tenantApi.getDocuments();
      setDocuments(response.data);
      setHasLoaded(true);
    } catch (err) {
      console.error('Failed to load documents:', err);
      setError('Failed to load documents.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDocuments();
  };

  const handleDownload = async (doc: Document) => {
    try {
      const blob = await tenantApi.downloadDocument(doc.id);
      const url = URL.createObjectURL(blob);
      await Share.share({
        url,
        title: doc.file_name,
        message: `Tenancy document: ${doc.file_name}`,
      });
    } catch (err) {
      Alert.alert('Error', 'Failed to download document.');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getCategoryIcon = (category: string): keyof typeof Ionicons.glyphMap => {
    switch (category) {
      case 'tenancy_agreement': return 'document-text';
      case 'inspection_photo': return 'camera';
      default: return 'folder-open';
    }
  };

  if (error) {
    return (
      <ScreenContainer edges={['bottom', 'left', 'right']}>
        <ErrorState message={error} onRetry={fetchDocuments} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer 
      scrollable
      refreshing={refreshing}
      onRefresh={onRefresh}
      edges={['bottom', 'left', 'right']}
    >
      <View style={styles.container}>
        {loading && !hasLoaded ? (
          <View style={styles.listContainer}>
            {Array(4).fill(0).map((_, i) => (
              <Skeleton key={`skeleton-${i}`} width="100%" height={80} borderRadius={12} style={{ marginBottom: 12 }} />
            ))}
          </View>
        ) : documents.length > 0 ? (
          <View style={styles.listContainer}>
            {documents.map((doc, index) => {
              const isLast = index === documents.length - 1;
              return (
                <Card key={doc.id} style={[styles.docCard, isLast && { marginBottom: 0 }]}>
                  <TouchableOpacity
                    style={styles.docRow}
                    onPress={() => handleDownload(doc)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.iconCircle}>
                      <Ionicons
                        name={getCategoryIcon(doc.category)}
                        size={22}
                        color={colors.primary}
                      />
                    </View>
                    <View style={styles.docInfo}>
                      <Text style={styles.docName} numberOfLines={1}>
                        {doc.file_name}
                      </Text>
                      <Text style={styles.docMeta}>
                        {capitalize(doc.category.replace('_', ' '))} · {formatFileSize(doc.file_size)} · {formatDate(doc.uploaded_at)}
                      </Text>
                    </View>
                    <Ionicons name="download-outline" size={20} color={colors.gray[400]} />
                  </TouchableOpacity>
                </Card>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-outline" size={48} color={colors.gray[300]} />
            <Text style={[screenStyles.empty, { marginTop: 12 }]}>No documents yet</Text>
            <Text style={styles.emptySubtext}>
              Your tenancy agreement and related documents will appear here.
            </Text>
          </View>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  listContainer: {
    gap: 12,
  },
  docCard: {
    padding: 0,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
    marginBottom: 12,
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
  },
  docInfo: {
    flex: 1,
  },
  docName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  docMeta: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptySubtext: {
    fontSize: 13,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
  },
});
