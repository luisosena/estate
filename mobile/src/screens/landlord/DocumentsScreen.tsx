import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState, useLayoutEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';

import { ScreenContainer } from '../../components/common/ScreenContainer';
import { ErrorState } from '../../components/common/ErrorState';
import { landlordApi } from '../../api/landlord';
import { Skeleton } from '../../components/common/Skeleton';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { colors } from '../../constants/colors';
import { screenStyles } from '../../constants/styles';
import type { LandlordDocumentsStackParamList } from '../../navigation/AppNavigator';
import type { Document } from '../../types';
import { formatDate, capitalize } from '../../utils/formatters';

type NavigationProp = NativeStackNavigationProp<LandlordDocumentsStackParamList>;
type RouteProps = RouteProp<LandlordDocumentsStackParamList, 'LandlordDocuments'>;

export function LandlordDocumentsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { tenancyId } = route.params;

  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploading, setUploading] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Documents',
      headerShown: true,
      headerStyle: { backgroundColor: colors.surface },
      headerTintColor: colors.text.primary,
      headerShadowVisible: false,
      headerRight: () => (
        <TouchableOpacity
          style={{ padding: 8 }}
          onPress={handlePickDocument}
          disabled={uploading}
        >
          <Ionicons name="cloud-upload-outline" size={22} color={uploading ? colors.gray[400] : colors.primary} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, uploading]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      await new Promise(resolve => setTimeout(resolve, 200));
      const response = await landlordApi.getDocuments(tenancyId);
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
  }, [tenancyId]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDocuments();
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.length) return;

      const file = result.assets[0];
      if (file.size && file.size > 10 * 1024 * 1024) {
        Alert.alert('File Too Large', 'File size must be less than 10MB.');
        return;
      }

      setUploading(true);
      const formData = new FormData();
      formData.append('document', {
        uri: file.uri,
        name: file.name,
        type: file.mimeType || 'application/octet-stream',
      } as any);
      formData.append('category', 'tenancy_agreement');

      await landlordApi.uploadDocument(tenancyId, formData);
      Alert.alert('Success', 'Document uploaded successfully.');
      fetchDocuments();
    } catch (err: any) {
      if (err?.message !== 'DocumentPicker was canceled') {
        Alert.alert('Error', 'Failed to upload document.');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (doc: Document) => {
    Alert.alert(
      'Delete Document',
      `Are you sure you want to delete "${doc.file_name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await landlordApi.deleteDocument(doc.id);
              setDocuments(prev => prev.filter(d => d.id !== doc.id));
            } catch (err) {
              Alert.alert('Error', 'Failed to delete document.');
            }
          },
        },
      ]
    );
  };

  const handleDownload = async (doc: Document) => {
    try {
      const blob = await landlordApi.downloadDocument(doc.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.file_name;
      a.click();
      URL.revokeObjectURL(url);
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
        {uploading && (
          <View style={styles.uploadingBanner}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.uploadingText}>Uploading document...</Text>
          </View>
        )}

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
                  <View style={styles.docRow}>
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
                    <View style={styles.actions}>
                      <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => handleDownload(doc)}
                      >
                        <Ionicons name="download-outline" size={18} color={colors.gray[500]} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => handleDelete(doc)}
                      >
                        <Ionicons name="trash-outline" size={18} color={colors.status.canceled} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </Card>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-outline" size={48} color={colors.gray[300]} />
            <Text style={[screenStyles.empty, { marginTop: 12 }]}>No documents yet</Text>
            <Text style={styles.emptySubtext}>
              Upload tenancy agreements and related documents.
            </Text>
            <Button
              label="Upload Document"
              variant="primary"
              onPress={handlePickDocument}
              style={{ marginTop: 20 }}
              icon="cloud-upload-outline"
            />
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
  uploadingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: colors.primary + '10',
    borderRadius: 8,
    marginBottom: 16,
  },
  uploadingText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '500',
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
  actions: {
    flexDirection: 'row',
    gap: 4,
  },
  actionBtn: {
    padding: 8,
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
