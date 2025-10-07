import Button from '../components/Button';
import Forms from '../components/Forms';
import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { useAuth } from '../context/AuthContext';

import {
  addOrder,
  updateOrder,
  getKeyTypes,
  getOrderById,
} from '../services/orders';

import Loader from '../components/Loader';
import Footer from '../components/Footer';
import { OrderStackParamList } from '../navigation/AppNavigator';
import { RouteProp, useRoute } from '@react-navigation/native';
import { ScrollView } from 'react-native-gesture-handler';
import CHeader from '../components/CHeader';
import CRootContainer from '../components/CRootContainer';
import { commonStyle } from '../theme';
import { moderateScale } from '../common/constants';
import Overlay from '../components/Overlat';

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

  const [orderData] = useState({
    pageno: 1,
    pagesize: 100,
  });

  const [keyMap, setKeyMap] = useState<any>({});
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState<
    'LOADING' | 'SUCCESS' | 'ERROR' | 'SUBMIT'
  >('SUCCESS');
  const [orderForm, setOrderForm] = useState<OrderForm[]>([]);
  const { users } = useAuth();

  const fetchOrderDetails = useCallback(
    async (mounted: boolean, id: string) => {
      if (id && mounted) {
        try {

          setStatus('LOADING');
          const response = await getOrderById(id, users.token);

          const keys = response?.data?.keys;
          console.log('ME52RETAILERTESTING', keys);
          const keymap: any = {};
          keys?.forEach((key: any) => {
            if (key?.keytype?._id) keymap[key.keytype._id] = key.asked;
          });
          console.log('ME52RETAILERTESTING', keymap);
          setKeyMap({ ...keymap });

        } catch (error) {
          console.log('ME52RETAILERTESTING', 'Fetch key types error ', error);
          console.log('ME52RETAILERTESTING', error);
          setStatus('ERROR');
        }
      }
    },
    [],
  );

  const fetchKeyTypes = useCallback(
    async (mounted: boolean) => {
      if (mounted) {
        try {

          setStatus('LOADING');
          const response = await getKeyTypes(
            {
              pageno: orderData.pageno,
              pagesize: orderData.pagesize,
            },
            users.token,
          );

          const tempOrderForm: OrderForm[] = [];
          const orderObj: Record<string, any> = {};

          console.log('ME52RETAILERTESTING', response.data);
          for (let keyData of response?.data) {

            console.log('ME52RETAILERTESTING', users);
            console.log('ME52RETAILERTESTING', keyData.user_type[2].price);
            console.log('ME52RETAILERTESTING', keyMap.hasOwnProperty(keyData._id));

            tempOrderForm.push({
              name: keyData._id,
              label: keyData.name,
              key: keyData._id,
              type: 'orderInput',
              price: users.parentType === 'me52' ? (keyData.user_type?.length > 2 ? keyData.user_type[2].price : 0) : 0,
              discount: users.parentType === 'me52' ? (keyData.user_type?.length > 2 ? keyData.user_type[2].discount : 0) : 0,
              required: false,
              ...(viewOnly ? { readonly: viewOnly } : {}),
              value: keyMap.hasOwnProperty(keyData._id)
                ? keyMap[keyData._id].toString()
                : '',
              features: [
                {
                  label: 'Location Tracking',
                  active: keyData['location_tracking'],
                },
                { label: 'SIM Tracking', active: keyData['sim_tracking'] },

                {
                  label: 'Image Notifications',
                  active: keyData['image_notification'],
                },
                {
                  label: 'Video Notifications',
                  active: keyData['video_notification'],
                },
                {
                  label: 'Phone Block',
                  active: keyData['phone_block'],
                },
              ],
            });

            orderObj[keyData._id] = '';

          }
          console.log('ME52RETAILERTESTING', tempOrderForm);

          // setOrders(orderObj)
          setOrderForm(tempOrderForm);
          setStatus('SUCCESS');
        } catch (error) {
          console.log('ME52RETAILERTESTING', 'Fetch key types error ', error);
          setStatus('ERROR');
        }
      }
    },
    [keyMap],
  );

  useEffect(() => {
    //Get key types
    let mounted = true;

    console.log('ME52RETAILERTESTING', 'orderId', orderId);
    console.log('ME52RETAILERTESTING', 'viewOnly', viewOnly);

    if (orderId) fetchOrderDetails(mounted, orderId);
    else fetchKeyTypes(mounted);

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    fetchKeyTypes(true);
  }, [keyMap]);

  const submitForm = async () => {
    // Validation helper
    const isValidNumber = (val: any) => {
      // check it's an integer and greater than 0
      return /^\d+$/.test(val) && Number(val) > 0;
    };

    // Check if at least one value is filled
    const hasAtLeastOne = orderForm.some(order => isValidNumber(order.value));
    if (!hasAtLeastOne) {
      Toast.show({
        type: 'error',
        text1: 'Validation',
        text2: 'Please enter a valid key quantity.',
      });
      setStatus('SUCCESS');
      return;
    }

    try {
      setStatus('SUBMIT');
      const keys: Array<{ keytype: string; asked: number; fulfilled: number }> = [];

      for (let order of orderForm) {
        if (isValidNumber(order.value)) {
          keys.push({
            keytype: order.key,
            asked: Number(order.value),
            fulfilled: 0,
          });
        }
      }

      const apiData: any = {
        data: {
          ...(orderId ? { _id: orderId } : {}),
          type: orderType === 'return' ? 'return' : 'buy',
          keys: keys,
        },
      };

      console.log('ME52RETAILERTESTING', 'API data is here for order ', apiData);

      const response = orderId
        ? await updateOrder(apiData, users.token)
        : await addOrder(apiData, users.token);

      if (response.success) {
        Alert.alert(
          'Order',
          `Your Order ${orderId ? 'Updated' : 'Added'} successfully`,
          [
            {
              text: 'Ok',
              onPress: () => {
                navigation.goBack();
              },
            },
          ],
        );
      }

      setStatus('SUCCESS');
    } catch (error) {
      console.log('ME52RETAILERTESTING', 'Error while adding order ', error);
      setStatus('ERROR');
    }
  };

  const handleSubmit = async () => {
    console.log('ME52RETAILERTESTING', 'Form submission ', orderForm);
    await submitForm();
  };

  console.log('ME52RETAILERTESTING', 'ADD EDIT FOR ', 'orderForm', status);

  return (
    <CRootContainer style={[styles.orderContainer]}>
      <CHeader
        title={viewOnly
          ? 'View Order'
          : orderId
            ? 'Edit Order'
            : orderType && orderType === 'return'
              ? 'Return Order'
              : 'Create Order'}
      />
      <View style={[styles.contentContainer]}>
        {(status === 'LOADING' || status == 'SUBMIT') && <Overlay><Loader center={true} /></Overlay>}
        {(status === 'SUCCESS' || status === 'SUBMIT') && (
          <ScrollView showsVerticalScrollIndicator={false}>
            <Forms
              formFields={orderForm}
              formState={orderForm}
              setFormState={setOrderForm}
              isCheckError={true}
              errors={errors}
              setErrors={setErrors}
            />
            {!viewOnly ? (
              <View>
                <Button
                  variant="darker"
                  title="Submit"
                  onPress={handleSubmit}
                  style={styles.btn}
                />
              </View>
            ) : null}
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
    ...commonStyle.ph25
  },
  contentContainer: {
    flex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...commonStyle.mt10,
    gap: moderateScale(8),
  },
  btn: {
    width: '100%',
  },
});

export default AddEditOrder;
