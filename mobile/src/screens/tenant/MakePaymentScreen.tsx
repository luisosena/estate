import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StyleSheet,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  TextInput,
  RadioButton,
  SegmentedButtons,
} from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { tenantApi, PaymentFormData } from '../../api/tenant';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { screenStyles } from '../../constants/styles';
import { colors } from '../../constants/colors';
import { formatCurrency, formatDate } from '../../utils/formatters';
import type { UtilityBill } from '../../types';

type RootStackParamList = {
  TenantTabs: undefined;
  MakePayment: { monthlyRent?: number; pendingAmount?: number };
};

type MakePaymentRouteProp = RouteProp<RootStackParamList, 'MakePayment'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const paymentMethods = [
  { value: 'mobile_money', label: 'Mobile Money' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
];

const paymentTypes = [
  { value: 'rent', label: 'Rent' },
  { value: 'utility', label: 'Utility' },
];

export function MakePaymentScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<MakePaymentRouteProp>();
  const { monthlyRent = 0, pendingAmount = 0 } = route.params || {};

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [utilityBills, setUtilityBills] = useState<UtilityBill[]>([]);
  const [loadingBills, setLoadingBills] = useState(false);

  // Form state
  const [amount, setAmount] = useState('');
  const [paymentType, setPaymentType] = useState<'rent' | 'utility'>('rent');
  const [paymentMethod, setPaymentMethod] = useState<'mobile_money' | 'bank_transfer'>('mobile_money');
  const [selectedBillId, setSelectedBillId] = useState<number | null>(null);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');

  // Form errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const isInitialMount = useRef(true);

  // Track whether we should auto-select a bill (only on first load when paymentType changes to utility)
  const shouldAutoSelectBill = useRef(true);

  // Reset auto-select flag on mount to ensure proper behavior on revisit
  useEffect(() => {
    shouldAutoSelectBill.current = true;
  }, []);

  // Fetch utility bills when payment type changes to utility
  useEffect(() => {
    const fetchBills = async () => {
      if (paymentType === 'utility') {
        setLoadingBills(true);
        try {
          const response = await tenantApi.getUtilityBills();
          // Filter to show only pending, partial, or overdue bills
          const pendingBills = response.data.filter(
            (bill) => bill.status === 'pending' || bill.status === 'partial' || bill.status === 'overdue'
          );
          setUtilityBills(pendingBills);
          
          // Auto-select first bill if none selected (only on initial fetch)
          if (pendingBills.length > 0 && shouldAutoSelectBill.current) {
            setSelectedBillId(pendingBills[0].id);
            setAmount(pendingBills[0].amount_due.toString());
            shouldAutoSelectBill.current = false;
          }
        } catch (error) {
          console.error('Failed to fetch utility bills:', error);
        } finally {
          setLoadingBills(false);
        }
      } else {
        setUtilityBills([]);
        setSelectedBillId(null);
        shouldAutoSelectBill.current = true; // Reset for next time payment type changes to utility
      }
    };

    fetchBills();
  }, [paymentType]);

  // Set default amount to pending amount only on initial mount
  useEffect(() => {
    if (isInitialMount.current && pendingAmount > 0) {
      setAmount(pendingAmount.toString());
      isInitialMount.current = false;
    }
  }, [pendingAmount]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount)) {
      newErrors.amount = 'Amount is required';
    } else if (numAmount < 1) {
      newErrors.amount = 'Amount must be at least 1';
    } else if (numAmount > 100000000) {
      newErrors.amount = 'Amount is too large';
    }

    if (paymentType === 'utility' && !selectedBillId) {
      newErrors.bill = 'Please select a utility bill';
    }

    if (!paymentMethod) {
      newErrors.paymentMethod = 'Please select a payment method';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validateForm()) {
      setShowConfirmation(true);
    }
  };

  const handleEdit = () => {
    setShowConfirmation(false);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const paymentData: PaymentFormData = {
        amount: parseFloat(amount),
        payment_type: paymentType,
        payment_method: paymentMethod,
        utility_bill_id: selectedBillId || undefined,
        reference_number: referenceNumber || undefined,
        notes: notes || undefined,
      };

      await tenantApi.createPayment(paymentData);

      Alert.alert(
        'Payment Successful',
        'Your payment has been processed successfully!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error ||
        'Failed to process payment. Please try again.';
      Alert.alert('Payment Failed', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  // Confirmation Dialog
  if (showConfirmation) {
    const numAmount = parseFloat(amount);
    const paymentTypeLabel = paymentType === 'rent' ? 'Rent' : 'Utility';
    const paymentMethodLabel =
      paymentMethod === 'mobile_money' ? 'Mobile Money' : 'Bank Transfer';

    // Find selected bill info
    const selectedBill = utilityBills.find(bill => bill.id === selectedBillId);
    const utilityName = selectedBill?.tenancy_utility?.utility_type?.name;

    return (
      <View style={[screenStyles.container, { padding: 16 }]}>
        <Card style={screenStyles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={screenStyles.title}>
              Confirm Payment
            </Text>
            <Text variant="bodyMedium" style={{ marginBottom: 24 }}>
              Please review your payment details:
            </Text>

            <View style={{ gap: 12 }}>
              <View style={styles.row}>
                <Text variant="bodyMedium" style={{ color: colors.text.secondary }}>
                  Amount:
                </Text>
                <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
                  {formatCurrency(numAmount)}
                </Text>
              </View>

              <View style={styles.row}>
                <Text variant="bodyMedium" style={{ color: colors.text.secondary }}>
                  Payment Type:
                </Text>
                <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
                  {paymentTypeLabel}
                </Text>
              </View>

              {paymentType === 'utility' && selectedBill && (
                <View style={styles.row}>
                  <Text variant="bodyMedium" style={{ color: colors.text.secondary }}>
                    Utility:
                  </Text>
                  <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
                    {utilityName || 'Unknown'}
                  </Text>
                </View>
              )}

              <View style={styles.row}>
                <Text variant="bodyMedium" style={{ color: colors.text.secondary }}>
                  Method:
                </Text>
                <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
                  {paymentMethodLabel}
                </Text>
              </View>

              {referenceNumber ? (
                <View style={styles.row}>
                  <Text variant="bodyMedium" style={{ color: colors.text.secondary }}>
                    Reference:
                  </Text>
                  <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
                    {referenceNumber}
                  </Text>
                </View>
              ) : null}
            </View>
          </Card.Content>
        </Card>

        <View style={styles.buttonRow}>
          <Button
            mode="outlined"
            onPress={handleEdit}
            style={styles.button}
            disabled={submitting}
          >
            Edit
          </Button>
          <Button
            mode="contained"
            onPress={handleSubmit}
            style={styles.button}
            loading={submitting}
            disabled={submitting}
          >
            Verify & Submit
          </Button>
        </View>
      </View>
    );
  }

  // Payment Form
  return (
    <KeyboardAvoidingView
      style={screenStyles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Payment Details Card */}
        <Card style={screenStyles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={screenStyles.title}>
              Payment Details
            </Text>

            <TextInput
              label="Amount *"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              mode="outlined"
              style={styles.input}
              error={!!errors.amount}
            />
            {errors.amount && (
              <Text variant="bodySmall" style={{ color: colors.error }}>
                {errors.amount}
              </Text>
            )}

            <Text variant="bodyMedium" style={{ marginTop: 16, marginBottom: 8 }}>
              Payment Type *
            </Text>
            <SegmentedButtons
              value={paymentType}
              onValueChange={(value) => setPaymentType(value as 'rent' | 'utility')}
              buttons={paymentTypes}
              style={styles.segmented}
            />
          </Card.Content>
        </Card>

        {/* Utility Bill Selection - only show when payment type is utility */}
        {paymentType === 'utility' && (
          <Card style={screenStyles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={screenStyles.title}>
                Select Utility Bill
              </Text>
              {loadingBills ? (
                <Text variant="bodyMedium" style={{ color: colors.text.secondary }}>
                  Loading bills...
                </Text>
              ) : utilityBills.length > 0 ? (
                <>
                  {utilityBills.map((bill) => {
                    const utilityName = bill.tenancy_utility?.utility_type?.name || 'Unknown';
                    const outstanding = bill.amount_due - bill.amount_paid;
                    return (
                      <View
                        key={bill.id}
                        style={[
                          styles.billOption,
                          selectedBillId === bill.id && styles.billOptionSelected,
                        ]}
                      >
                        <RadioButton.Android
                          value={bill.id.toString()}
                          status={selectedBillId === bill.id ? 'checked' : 'unchecked'}
                          onPress={() => {
                            setSelectedBillId(bill.id);
                            setAmount(outstanding.toString());
                          }}
                        />
                        <View style={{ flex: 1 }}>
                          <Text variant="bodyMedium" style={{ fontWeight: '500' }}>
                            {utilityName}
                          </Text>
                          <Text variant="bodySmall" style={screenStyles.date}>
                            {formatDate(bill.billing_month)} • Due: {formatDate(bill.due_date)}
                          </Text>
                          <Text variant="bodySmall" style={{ color: bill.status === 'overdue' ? colors.status.overdue : colors.text.secondary }}>
                            Status: {bill.status} • Outstanding: {formatCurrency(outstanding)}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                  {errors.bill && (
                    <Text variant="bodySmall" style={{ color: colors.error, marginTop: 8 }}>
                      {errors.bill}
                    </Text>
                  )}
                </>
              ) : (
                <Text variant="bodyMedium" style={{ color: colors.text.secondary }}>
                  No pending utility bills found
                </Text>
              )}
            </Card.Content>
          </Card>
        )}

        {/* Payment Method Card */}
        <Card style={screenStyles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={screenStyles.title}>
              Payment Method
            </Text>

            <RadioButton.Group
              onValueChange={(value) =>
                setPaymentMethod(value as 'mobile_money' | 'bank_transfer')
              }
              value={paymentMethod}
            >
              {paymentMethods.map((method) => (
                <View key={method.value} style={styles.radioRow}>
                  <RadioButton.Android value={method.value} />
                  <Text
                    variant="bodyMedium"
                    onPress={() => setPaymentMethod(method.value as 'mobile_money' | 'bank_transfer')}
                  >
                    {method.label}
                  </Text>
                </View>
              ))}
            </RadioButton.Group>
            {errors.paymentMethod && (
              <Text variant="bodySmall" style={{ color: colors.error }}>
                {errors.paymentMethod}
              </Text>
            )}
          </Card.Content>
        </Card>

        {/* Additional Information Card */}
        <Card style={screenStyles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={screenStyles.title}>
              Additional Information
            </Text>

            <TextInput
              label="Reference Number (Optional)"
              value={referenceNumber}
              onChangeText={setReferenceNumber}
              mode="outlined"
              style={styles.input}
              maxLength={100}
            />

            <TextInput
              label="Notes (Optional)"
              value={notes}
              onChangeText={setNotes}
              mode="outlined"
              style={styles.input}
              multiline
              numberOfLines={3}
              maxLength={500}
            />
          </Card.Content>
        </Card>

        {/* Monthly Rent Info */}
        {monthlyRent > 0 && (
          <Card style={[screenStyles.card, { backgroundColor: colors.primary + '10' }]}>
            <Card.Content>
              <Text variant="bodyMedium" style={{ color: colors.primary }}>
                Monthly Rent: {formatCurrency(monthlyRent)}
              </Text>
              {pendingAmount > 0 && (
                <Text variant="bodyMedium" style={{ color: colors.status.overdue, marginTop: 4 }}>
                  Pending Amount: {formatCurrency(pendingAmount)}
                </Text>
              )}
            </Card.Content>
          </Card>
        )}

        {/* Submit Button */}
        <Button
          mode="contained"
          onPress={handleContinue}
          style={styles.submitButton}
          contentStyle={styles.submitButtonContent}
        >
          Continue to Confirm
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  input: {
    marginTop: 8,
    backgroundColor: colors.white,
  },
  segmented: {
    marginTop: 4,
  },
  billOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  billOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    gap: 12,
  },
  button: {
    flex: 1,
  },
  submitButton: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 24,
  },
  submitButtonContent: {
    paddingVertical: 8,
  },
});
