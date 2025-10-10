import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, View, ScrollView } from 'react-native';
import Toast from 'react-native-toast-message';
import { useForm, FieldValues } from 'react-hook-form';
import { RouteProp, useRoute } from '@react-navigation/native';
import Button from '../components/Button';
import Loader from '../components/Loader';
import Footer from '../components/Footer';
import CHeader from '../components/CHeader';
import CRootContainer from '../components/CRootContainer';
import Overlay from '../components/Overlat';
import OrderInput from '../components/OrderInput';
import { commonStyle } from '../theme';
import { useAuth } from '../context/AuthContext';
import { addOrder, updateOrder, getKeyTypes, getOrderById } from '../services/orders';
import { OrderStackParamList } from '../navigation/AppNavigator';

interface OrderForm {
  name: string;
  label: string;
  readonly?: boolean;
  price: number;
  discount: number;
  key: string;
  type: 'orderInput';
  required: boolean;
  features: Array<Record<string, any>>;
  value: any;
}

const AddEditOrder = ({ navigation }: any) => {
  const route = useRoute<RouteProp<OrderStackParamList, 'AddOrder'>>();
  const orderId = route.params?.orderId;
  const viewOnly = route.params?.viewOnly;
  const orderType = route.params?.type;
  const { users } = useAuth();

  const [orderData] = useState({ pageno: 1, pagesize: 100 });
  const [keyMap, setKeyMap] = useState<any>({});
  const [errors, setErrors] = useState<Record<string, any>>({});
  const [status, setStatus] = useState<'LOADING' | 'SUCCESS' | 'ERROR' | 'SUBMIT'>('SUCCESS');
  const [orderForm, setOrderForm] = useState<OrderForm[]>([]);

  const defaultValues = orderForm?.reduce((acc, field) => {
    acc[field.key] = field.value || '';
    return acc;
  }, {} as Record<string, string>);

  const { control, handleSubmit, setValue, reset } = useForm<FieldValues>({
    mode: 'onChange',
    defaultValues
  });


  useEffect(() => {
    if (orderForm.length > 0) {
      const defaults: Record<string, any> = {};
      orderForm.forEach(f => (defaults[f.key] = f.value ?? ''));
      reset(defaults);
    }
  }, [orderForm, reset]);

  const fetchOrderDetails = useCallback(async (mounted: boolean, id: string) => {
    if (id && mounted) {
      try {
        setStatus('LOADING');
        const response = await getOrderById(id, users.token);
        const keys = response?.data?.keys;
        const keymap: any = {};
        keys?.forEach((key: any) => {
          if (key?.keytype?._id) keymap[key.keytype._id] = key.asked;
        });
        setKeyMap({ ...keymap });
      } catch {
        setStatus('ERROR');
      }
    }
  }, [users.token]);

  const fetchKeyTypes = useCallback(async (mounted: boolean, keyMapData: any) => {
    if (mounted) {
      try {
        setStatus('LOADING');
        const response = await getKeyTypes(orderData, users.token);
        const tempOrderForm: OrderForm[] = [];

        for (let keyData of response?.data) {
          tempOrderForm.push({
            name: keyData._id,
            label: keyData.name,
            key: keyData._id,
            type: 'orderInput',
            price:
              users.parentType === 'me52'
                ? keyData.user_type?.length > 2
                  ? keyData.user_type[2].price
                  : 0
                : 0,
            discount:
              users.parentType === 'me52'
                ? keyData.user_type?.length > 2
                  ? keyData.user_type[2].discount
                  : 0
                : 0,
            required: false,
            ...(viewOnly ? { readonly: viewOnly } : {}),
            value: keyMapData.hasOwnProperty(keyData._id)
              ? keyMapData[keyData._id].toString()
              : '',
            features: [
              { label: 'Location Tracking', active: keyData['location_tracking'] },
              { label: 'SIM Tracking', active: keyData['sim_tracking'] },
              { label: 'Image Notifications', active: keyData['image_notification'] },
              { label: 'Video Notifications', active: keyData['video_notification'] },
              { label: 'Phone Block', active: keyData['phone_block'] },
            ],
          });
        }

        setOrderForm(tempOrderForm);
        setStatus('SUCCESS');
      } catch {
        setStatus('ERROR');
      }
    }
  }, [orderData, users.parentType, users.token, viewOnly]);

  useEffect(() => {
    let mounted = true;
    if (orderId) fetchOrderDetails(mounted, orderId);
    else fetchKeyTypes(mounted, {});
    return () => {
      mounted = false;
    };
  }, [orderId, fetchOrderDetails, fetchKeyTypes]);

  useEffect(() => {
    if (orderId && Object.keys(keyMap).length > 0) {
      fetchKeyTypes(true, keyMap);
    }
  }, [keyMap, orderId, fetchKeyTypes]);

  // ✅ FIX: make this type-safe for dynamic keys
  const onValueChange = useCallback(
    (field: OrderForm, value: any) => {
      setOrderForm(prev => {
        const updated = [...prev];
        const idx = updated.findIndex(f => f.key === field.key);
        if (idx !== -1) updated[idx] = { ...updated[idx], value };
        return updated;
      });
      setValue(field?.key, value, { shouldDirty: true });
    },
    [setValue]
  );

  const submitForm = async () => {
    const isValidNumber = (val: any) => /^\d+$/.test(val) && Number(val) > 0;
    try {
      setStatus('SUBMIT');
      const keys = orderForm
        .filter(order => isValidNumber(order.value))
        .map(order => ({
          keytype: order.key,
          asked: Number(order.value),
          fulfilled: 0,
        }));

      const apiData: any = {
        data: {
          ...(orderId ? { _id: orderId } : {}),
          type: orderType === 'return' ? 'return' : 'buy',
          keys,
        },
      };

      const response = orderId
        ? await updateOrder(apiData, users.token)
        : await addOrder(apiData, users.token);

      if (response.success) {
        Alert.alert(
          'Order',
          `Your Order ${orderId ? 'Updated' : 'Added'} successfully`,
          [{ text: 'Ok', onPress: () => navigation.goBack() }]
        );
      }

      setStatus('SUCCESS');
    } catch {
      setStatus('ERROR');
    }
  };

  const renderFields = useMemo(() => {
    return orderForm?.map((field, index) => (
      <OrderInput
        key={field.key}
        readonly={field.readonly}
        label={field.label}
        price={field.price}
        discount={field.discount}
        value={field.value}
        onChangeText={(v: any) => onValueChange(field, v)}
        features={field.features}
        index={index}
        control={control}
        rules={{
          required: `${field.label} is required`,
          validate: (val: string) =>
            val && !/^\d+$/.test(val) ? 'Only numbers allowed' : true
        }}
        name={field.key}
      />
    ));
  }, [orderForm, control, onValueChange]);

  return (
    <CRootContainer style={styles.orderContainer}>
      <CHeader
        title={
          viewOnly
            ? 'View Order'
            : orderId
              ? 'Edit Order'
              : orderType === 'return'
                ? 'Return Order'
                : 'Create Order'
        }
      />
      <View style={styles.contentContainer}>
        {(status === 'LOADING' || status === 'SUBMIT') && (
          <Loader center />
        )}
        {(status === 'SUCCESS' || status === 'SUBMIT') && (
          <ScrollView showsVerticalScrollIndicator={false}>
            <View>{renderFields}</View>
            {!viewOnly && (
              <View>
                <Button
                  variant="darker"
                  title="Submit"
                  onPress={handleSubmit(submitForm)}
                  style={styles.btn}
                />
              </View>
            )}
            <Footer />
          </ScrollView>
        )}
      </View>
    </CRootContainer>
  );
};

const styles = StyleSheet.create({
  orderContainer: {
    flex: 1,
    ...commonStyle.ph25,
  },
  contentContainer: {
    flex: 1,
  },
  btn: {
    width: '100%',
  },
});

export default AddEditOrder;
