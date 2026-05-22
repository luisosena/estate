import React from 'react';
import { View, StyleSheet } from 'react-native';

import { colors } from '../../constants/colors';

import { Skeleton } from './Skeleton';

/**
 * Skeleton for the statistical cards on the dashboard.
 */
export const StatCardSkeleton = () => (
  <View style={styles.statCard}>
    <Skeleton width="60%" height={12} style={{ marginBottom: 12 }} />
    <Skeleton width="40%" height={24} />
  </View>
);

/**
 * Skeleton for a tenant list item.
 */
export const TenantCardSkeleton = () => (
  <View style={styles.tenantCard}>
    <Skeleton variant="circle" width={48} height={48} style={{ marginRight: 12 }} />
    <View style={{ flex: 1 }}>
      <Skeleton width="70%" height={16} style={{ marginBottom: 8 }} />
      <Skeleton width="40%" height={12} />
    </View>
    <Skeleton width={60} height={24} borderRadius={12} />
  </View>
);

/**
 * Skeleton for property cards (large version).
 */
export const PropertyCardSkeleton = () => (
  <View style={styles.propertyCard}>
    <Skeleton width="100%" height={180} style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }} />
    <View style={{ padding: 16 }}>
      <Skeleton width="60%" height={20} style={{ marginBottom: 8 }} />
      <Skeleton width="80%" height={14} style={{ marginBottom: 16 }} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Skeleton width="25%" height={12} />
        <Skeleton width="25%" height={12} />
        <Skeleton width="25%" height={12} />
      </View>
    </View>
  </View>
);

/**
 * Skeleton for property list rows (horizontal version).
 */
export const PropertyRowSkeleton = () => (
  <View style={styles.propertyRowSkeleton}>
    <Skeleton width={48} height={48} borderRadius={12} style={{ marginRight: 16 }} />
    <View style={{ flex: 1, paddingRight: 12 }}>
      <Skeleton width="60%" height={16} style={{ marginBottom: 8 }} />
      <Skeleton width="80%" height={12} style={{ marginBottom: 8 }} />
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Skeleton width="20%" height={10} style={{ marginRight: 8 }} />
        <Skeleton width="20%" height={10} />
      </View>
    </View>
    <Skeleton width={60} height={24} borderRadius={10} />
  </View>
);

/**
 * Skeleton for the header section of detail pages (Property/Tenant Details).
 */
export const ProfileHeaderSkeleton = () => (
  <View style={styles.profileHeader}>
    <Skeleton variant="circle" width={56} height={56} style={{ marginRight: 16 }} />
    <View style={{ flex: 1 }}>
      <Skeleton width="60%" height={20} style={{ marginBottom: 8 }} />
      <Skeleton width="40%" height={14} />
    </View>
  </View>
);

/**
 * Skeleton for the stats card in detail views.
 */
export const DetailsStatsSkeleton = () => (
  <View style={styles.detailsStatsCard}>
    <View style={styles.statBox}>
      <Skeleton width="40%" height={18} style={{ marginBottom: 4 }} />
      <Skeleton width="60%" height={12} />
    </View>
    <View style={styles.statDivider} />
    <View style={styles.statBox}>
      <Skeleton width="40%" height={18} style={{ marginBottom: 4 }} />
      <Skeleton width="60%" height={12} />
    </View>
    <View style={styles.statDivider} />
    <View style={styles.statBox}>
      <Skeleton width="40%" height={18} style={{ marginBottom: 4 }} />
      <Skeleton width="60%" height={12} />
    </View>
  </View>
);

/**
 * Skeleton for the summary header in financial lists (Rent/Utility Bills).
 */
export const PaymentRowSkeleton = () => (
  <View style={styles.paymentRowSkeleton}>
    <Skeleton width={44} height={44} borderRadius={8} style={{ marginRight: 12 }} />
    <View style={{ flex: 1, paddingRight: 8 }}>
      <Skeleton width="60%" height={14} style={{ marginBottom: 6 }} />
      <Skeleton width="40%" height={12} />
    </View>
    <View style={{ alignItems: 'flex-end' }}>
      <Skeleton width={60} height={16} style={{ marginBottom: 6 }} />
      <Skeleton width={70} height={20} borderRadius={10} />
    </View>
  </View>
);

/**
 * Skeleton for the summary header in financial lists (Rent/Utility Bills).
 */
export const SummaryHeaderSkeleton = () => (
  <View style={styles.summaryHeader}>
    <Skeleton width="40%" height={12} style={{ marginBottom: 8 }} />
    <Skeleton width="60%" height={32} style={{ marginBottom: 12 }} />
    <View style={{ flexDirection: 'row' }}>
      <Skeleton width={80} height={20} borderRadius={10} style={{ marginRight: 8 }} />
      <Skeleton width={80} height={20} borderRadius={10} />
    </View>
  </View>
);

/**
 * Skeleton for a bill list item.
 */
export const BillRowSkeleton = () => (
  <View style={styles.billRow}>
    <Skeleton width={40} height={40} borderRadius={10} style={{ marginRight: 12 }} />
    <View style={{ flex: 1 }}>
      <Skeleton width="60%" height={14} style={{ marginBottom: 6 }} />
      <Skeleton width="40%" height={10} style={{ marginBottom: 4 }} />
      <Skeleton width="30%" height={10} />
    </View>
    <View style={{ alignItems: 'flex-end' }}>
      <Skeleton width={60} height={18} borderRadius={10} style={{ marginBottom: 8 }} />
      <Skeleton width={80} height={14} />
    </View>
  </View>
);

/**
 * Skeleton for a detail information box (used in RentBillDetails, etc).
 */
export const DetailBoxSkeleton = ({ rows = 3 }: { rows?: number }) => (
  <View style={styles.detailBoxSkeleton}>
    {Array(rows).fill(0).map((_, i) => (
      <View key={i} style={[styles.detailRowSkeleton, i === rows - 1 && { borderBottomWidth: 0 }]}>
        <Skeleton width="30%" height={14} />
        <Skeleton width="40%" height={14} />
      </View>
    ))}
  </View>
);

/**
 * Skeleton for a full-width item list (used in Bill Details payments).
 */
export const ListSectionSkeleton = ({ items = 3 }: { items?: number }) => (
  <View style={styles.listSectionSkeleton}>
    {Array(items).fill(0).map((_, i) => (
      <View key={i} style={[styles.listItemSkeleton, i === items - 1 && { borderBottomWidth: 0 }]}>
        <Skeleton variant="circle" width={32} height={32} style={{ marginRight: 12 }} />
        <View style={{ flex: 1 }}>
          <Skeleton width="40%" height={14} style={{ marginBottom: 6 }} />
          <Skeleton width="60%" height={12} />
        </View>
        <Skeleton width={60} height={24} borderRadius={12} />
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginHorizontal: 8,
    minWidth: 140,
  },
  tenantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  propertyCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  detailsStatsCard: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 12,
    paddingVertical: 16,
    backgroundColor: colors.surface,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.borderLight,
  },
  summaryHeader: {
    backgroundColor: colors.surface,
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  billRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.surface,
  },
  detailBoxSkeleton: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
  },
  detailRowSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  listSectionSkeleton: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
  },
  listItemSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  propertyRowSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  paymentRowSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
});
