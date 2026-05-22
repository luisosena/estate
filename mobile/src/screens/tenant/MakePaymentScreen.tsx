import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import {
  View,
  ScrollView,
  Platform,
  Alert,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  TextInput,
  RadioButton,
} from 'react-native-paper';

import { tenantApi, PaymentFormData } from '../../api/tenant';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { ErrorState } from '../../components/common/ScreenContainer/../ErrorState';
import { Skeleton } from '../../components/common/Skeleton';
import { DetailBoxSkeleton, ListSectionSkeleton } from '../../components/common/SkeletonVariants';
import { colors } from '../../constants/colors';
import { screenStyles } from '../../constants/styles';
import type { TenantPaymentsStackParamList } from '../../navigation/AppNavigator';
import type { UtilityBill, RentBill } from '../../types';
import { formatCurrency, formatDate, capitalize } from '../../utils/formatters';

type MakePaymentRouteProp = RouteProp<TenantPaymentsStackParamList, 'MakePayment'>;
type NavigationProp = NativeStackNavigationProp<TenantPaymentsStackParamList>;

const PAYMENT_METHODS = [
  { value: 'mobile_money', label: 'Mobile Money', icon: 'phone-portrait-outline' },
  { value: 'bank_transfer', label: 'Bank Transfer', icon: 'business-outline' },
] as const;

export function MakePaymentScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<MakePaymentRouteProp>();
  const { monthlyRent = 0, pendingAmount = 0, rentBillId } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [utilityBills, setUtilityBills] = useState<UtilityBill[]>([]);
  const [rentBills, setRentBills] = useState<RentBill[]>([]);
  const [loadingBills, setLoadingBills] = useState(true);

  // Form state
  const [amount, setAmount] = useState('');
  const [paymentType, setPaymentType] = useState<'rent' | 'utility'>('rent');
  const [paymentMethod, setPaymentMethod] = useState<'mobile_money' | 'bank_transfer'>('mobile_money');
  const [selectedUtilityBillId, setSelectedUtilityBillId] = useState<number | null>(null);
  const [selectedRentBillId, setSelectedRentBillId] = useState<number | null>(rentBillId || null);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const isInitialMount = useRef(true);
  const shouldAutoSelectBill = useRef(true);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: showConfirmation ? 'Confirm Payment' : 'New Payment',
      headerStyle: { backgroundColor: colors.surface },
      headerTintColor: colors.text.primary,
      headerShadowVisible: false,
    });
  }, [navigation, showConfirmation]);

  useEffect(() => {
    const fetchBills = async () => {
      setLoadingBills(true);
      try {
        // TEMPORARY: Delay for testing skeletons
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (paymentType === 'utility') {
          const response = await tenantApi.getUtilityBills();
          const pending = response.data.filter(b => b.status !== 'paid' && b.status !== 'waived');
          setUtilityBills(pending);
          if (pending.length > 0 && shouldAutoSelectBill.current) {
            setSelectedUtilityBillId(pending[0].id);
            setAmount(pending[0].amount_due.toString());
          }
        } else {
          const response = await tenantApi.getRentBills();
          const pending = response.data.filter(b => b.status !== 'paid' && b.status !== 'waived');
          setRentBills(pending);
          if (shouldAutoSelectBill.current) {
            const targetId = rentBillId || (pending.length > 0 ? pending[0].id : null);
            if (targetId) {
              const target = pending.find(b => b.id === targetId);
              if (target) {
                setSelectedRentBillId(target.id);
                setAmount((target.amount_due - target.amount_paid).toString());
              }
            }
          }
        }
        shouldAutoSelectBill.current = false;
      } catch (err: any) {
        console.error('Failed to fetch bills:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to load data. Please try again.');
      } finally {
        setLoadingBills(false);
        setLoading(false);
      }
    };
    fetchBills();
  }, [paymentType]);

  useEffect(() => {
    if (isInitialMount.current && pendingAmount > 0) {
      setAmount(pendingAmount.toString());
      isInitialMount.current = false;
    }
  }, [pendingAmount]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const numAmount = parseFloat(amount);

    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      newErrors.amount = 'Valid amount is required';
    }
    if (paymentType === 'utility' && !selectedUtilityBillId) {
      newErrors.bill = 'Select a utility bill';
    }
    if (paymentType === 'rent' && !selectedRentBillId) {
      newErrors.bill = 'Select a rent bill';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const data: PaymentFormData = {
        amount: parseFloat(amount),
        payment_type: paymentType,
        payment_method: paymentMethod,
        utility_bill_id: paymentType === 'utility' ? selectedUtilityBillId || undefined : undefined,
        rent_bill_id: paymentType === 'rent' ? selectedRentBillId || undefined : undefined,
        reference_number: referenceNumber || undefined,
        notes: notes || undefined,
      };
      await tenantApi.createPayment(data);
      Alert.alert('Success', 'Payment submitted successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message || 'Failed to submit payment');
    } finally {
      setSubmitting(false);
    }
  };

  if (showConfirmation) {
    const selectedBill = paymentType === 'rent' 
      ? rentBills.find(b => b.id === selectedRentBillId)
      : utilityBills.find(b => b.id === selectedUtilityBillId);

  
  return (
    <ScreenContainer
        scrollable
        edges={['bottom', 'left', 'right']}
        style={styles.scrollContent}
      >
        <View style={styles.receiptContainer}>
          <View style={styles.receiptHeader}>
            <View style={styles.successIcon}>
              <Ionicons name="shield-checkmark" size={32} color={colors.primary} />
            </View>
            <Text style={styles.receiptTitle}>Review Payment</Text>
            <Text style={styles.receiptSubtitle}>Please verify these details before submitting</Text>
          </View>

          <View style={styles.receiptBody}>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Amount to Pay</Text>
              <Text style={styles.receiptAmount}>{formatCurrency(parseFloat(amount))}</Text>
            </View>
            
            <View style={styles.receiptDivider} />

            <View style={styles.receiptDetailRow}>
              <Text style={styles.receiptDetailLabel}>Payment For</Text>
              <Text style={styles.receiptDetailValue}>
                {paymentType === 'rent' ? 'Rent' : capitalize((selectedBill as UtilityBill)?.tenancy_utility?.utility_type?.name || 'Utility')}
              </Text>
            </View>

            {selectedBill && (
              <View style={styles.receiptDetailRow}>
                <Text style={styles.receiptDetailLabel}>Billing Period</Text>
                <Text style={styles.receiptDetailValue}>{formatDate(selectedBill.billing_month)}</Text>
              </View>
            )}

            <View style={styles.receiptDetailRow}>
              <Text style={styles.receiptDetailLabel}>Method</Text>
              <Text style={styles.receiptDetailValue}>
                {PAYMENT_METHODS.find(m => m.value === paymentMethod)?.label}
              </Text>
            </View>

            {referenceNumber ? (
              <View style={styles.receiptDetailRow}>
                <Text style={styles.receiptDetailLabel}>Reference</Text>
                <Text style={styles.receiptDetailValue}>{referenceNumber}</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.receiptFooter}>
            <Ionicons name="information-circle-outline" size={16} color={colors.text.secondary} />
            <Text style={styles.footerNote}>This payment will be verified by the property manager.</Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <Button
            variant="outline"
            label="Edit Details"
            onPress={() => setShowConfirmation(false)}
            style={{ flex: 1 }}
          />
          <Button
            variant="primary"
            label="Confirm & Submit"
            onPress={handleSubmit}
            loading={submitting}
            style={{ flex: 2 }}
          />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      scrollable
      withKeyboard
      edges={['bottom', 'left', 'right']}
      style={styles.scrollContent}
    >
      {/* Type Selector */}
      <View style={styles.typeSelector}>
        <TouchableOpacity 
          style={[styles.typeTab, paymentType === 'rent' && styles.typeTabActive]}
          onPress={() => setPaymentType('rent')}
        >
          <Ionicons name="home-outline" size={20} color={paymentType === 'rent' ? colors.primary : colors.text.secondary} />
          <Text style={[styles.typeTabText, paymentType === 'rent' && styles.typeTabTextActive]}>Rent</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.typeTab, paymentType === 'utility' && styles.typeTabActive]}
          onPress={() => setPaymentType('utility')}
        >
          <Ionicons name="flash-outline" size={20} color={paymentType === 'utility' ? colors.primary : colors.text.secondary} />
          <Text style={[styles.typeTabText, paymentType === 'utility' && styles.typeTabTextActive]}>Utility</Text>
        </TouchableOpacity>
      </View>

      {/* Amount Input */}
      <View style={styles.formSection}>
        <Text style={styles.fieldLabel}>Amount to Pay</Text>
        <View style={styles.amountContainer}>
          <Text style={styles.currencySymbol}>$</Text>
          {loading ? (
             <Skeleton width={150} height={48} style={{ marginVertical: 6 }} />
          ) : (
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder="0.00"
              underlineColor="transparent"
              activeUnderlineColor="transparent"
            />
          )}
        </View>
        {errors.amount && <Text style={styles.errorText}>{errors.amount}</Text>}
      </View>

      {/* Bill Selection */}
      <View style={styles.formSection}>
        <Text style={styles.fieldLabel}>Select {paymentType === 'rent' ? 'Rent' : 'Utility'} Bill</Text>
        {loadingBills ? (
           <View style={styles.billList}>
              {Array(2).fill(0).map((_, i) => (
                <View key={`bill-skeleton-${i}`} style={styles.billOptionSkeleton}>
                   <View style={{ flex: 1 }}>
                      <Skeleton width="40%" height={16} style={{ marginBottom: 6 }} />
                      <Skeleton width="60%" height={12} />
                   </View>
                   <View style={{ alignItems: 'flex-end' }}>
                      <Skeleton width={60} height={14} style={{ marginBottom: 6 }} />
                      <Skeleton variant="circle" width={20} height={20} />
                   </View>
                </View>
              ))}
           </View>
        ) : (
          <View style={styles.billList}>
            {(paymentType === 'rent' ? rentBills : utilityBills).map(bill => {
              const isSelected = paymentType === 'rent' ? selectedRentBillId === bill.id : selectedUtilityBillId === bill.id;
              const outstanding = bill.amount_due - (bill.amount_paid || 0);
              
              return (
                <TouchableOpacity 
                  key={bill.id} 
                  style={[styles.billOption, isSelected && styles.billOptionSelected]}
                  onPress={() => {
                    if (paymentType === 'rent') setSelectedRentBillId(bill.id);
                    else setSelectedUtilityBillId(bill.id);
                    setAmount(outstanding.toString());
                  }}
                >
                  <View style={styles.billOptionInfo}>
                    <Text style={styles.billOptionTitle}>
                      {paymentType === 'rent' ? formatDate((bill as RentBill).billing_month) : capitalize((bill as UtilityBill).tenancy_utility?.utility_type?.name || 'Utility')}
                    </Text>
                    <Text style={styles.billOptionSub}>Due: {formatDate(bill.due_date)}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.billOptionAmount}>{formatCurrency(outstanding)}</Text>
                    <View style={[styles.radio, isSelected && styles.radioSelected]}>
                      {isSelected && <View style={styles.radioInner} />}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
            {(paymentType === 'rent' ? rentBills : utilityBills).length === 0 && (
              <Text style={styles.noneFound}>No pending bills found for this category.</Text>
            )}
          </View>
        )}
        {errors.bill && <Text style={styles.errorText}>{errors.bill}</Text>}
      </View>

      {/* Payment Method */}
      <View style={styles.formSection}>
        <Text style={styles.fieldLabel}>Payment Method</Text>
        <View style={styles.methodGrid}>
          {PAYMENT_METHODS.map(m => (
            <TouchableOpacity 
              key={m.value}
              style={[styles.methodCard, paymentMethod === m.value && styles.methodCardActive]}
              onPress={() => setPaymentMethod(m.value)}
            >
              <Ionicons 
                name={m.icon as any} 
                size={24} 
                color={paymentMethod === m.value ? colors.primary : colors.text.secondary} 
              />
              <Text style={[styles.methodLabel, paymentMethod === m.value && styles.methodLabelActive]}>
                {m.label}
              </Text>
              {paymentMethod === m.value && (
                <View style={styles.checkIcon}>
                  <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Reference & Notes */}
      <View style={styles.formSection}>
        <Text style={styles.fieldLabel}>Reference Number (Optional)</Text>
        <TextInput
          mode="outlined"
          placeholder="e.g., M-Pesa Transaction ID"
          value={referenceNumber}
          onChangeText={setReferenceNumber}
          style={styles.textInput}
          activeOutlineColor={colors.primary}
        />

        <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Notes (Optional)</Text>
        <TextInput
          mode="outlined"
          placeholder="Add a message..."
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
          style={styles.textInput}
          activeOutlineColor={colors.primary}
        />
      </View>

      <Button
        variant="primary"
        label="Continue to Confirm"
        onPress={() => {
          if (validateForm()) setShowConfirmation(true);
        }}
        style={styles.submitBtn}
      />

      <View style={{ height: 40 }} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 40,
  },
  typeSelector: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  typeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.gray[100],
    gap: 8,
  },
  typeTabActive: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  typeTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  typeTabTextActive: {
    color: colors.primary,
  },
  formSection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 8,
  },
  currencySymbol: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.primary,
    marginRight: 8,
    marginTop: 4,
  },
  amountInput: {
    flex: 1,
    fontSize: 40,
    fontWeight: '800',
    color: colors.text.primary,
    height: 60,
    backgroundColor: 'transparent',
  },
  billList: {
    gap: 10,
  },
  billOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.surface,
  },
  billOptionSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.surface,
  },
  billOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: '#FFF7ED',
  },
  billOptionInfo: {
    flex: 1,
  },
  billOptionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text.primary,
  },
  billOptionSub: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
  billOptionAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 6,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  methodGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  methodCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.surface,
    alignItems: 'center',
    position: 'relative',
  },
  methodCardActive: {
    borderColor: colors.primary,
    backgroundColor: '#FFF7ED',
  },
  methodLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.secondary,
    marginTop: 8,
    textAlign: 'center',
  },
  methodLabelActive: {
    color: colors.primary,
  },
  checkIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  textInput: {
    backgroundColor: colors.surface,
  },
  submitBtn: {
    marginHorizontal: 20,
    marginTop: 32,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: 6,
  },
  receiptContainer: {
    backgroundColor: colors.surface,
    margin: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 24,
  },
  receiptHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  receiptTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text.primary,
  },
  receiptSubtitle: {
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: 4,
    textAlign: 'center',
  },
  receiptBody: {
    backgroundColor: colors.gray[100],
    borderRadius: 16,
    padding: 20,
  },
  receiptRow: {
    alignItems: 'center',
    marginBottom: 16,
  },
  receiptLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  receiptAmount: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text.primary,
  },
  receiptDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
  },
  receiptDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  receiptDetailLabel: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  receiptDetailValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text.primary,
  },
  receiptFooter: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 8,
    paddingHorizontal: 8,
  },
  footerNote: {
    fontSize: 11,
    color: colors.text.secondary,
    lineHeight: 16,
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
  noneFound: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: 8,
  },
});
