import { 
  View, 
  ScrollView, 
  Dimensions, 
  ActivityIndicator, 
  TouchableOpacity, 
  Animated, 
  Platform, 
  Image,
  FlatList,
  RefreshControl,
  Modal,
  Pressable
} from "react-native";
import { StyleSheet } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { useState, useEffect, useRef, useCallback } from "react";
import { SlideInView } from "@/components/FadeInView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { BlurView, BlurTint } from 'expo-blur';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import Config from "@/constants/config";
import { platformColor } from "@/constants/Colors";
import { memo } from "react";
import { useThemeColors } from "@/components/ColorSchemeProvider";
const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

interface PlaidTransaction {
  date: string | number | Date;
  metadata: any;
  id: string;
  amount: number;
  name: string;
  merchant_name?: string;
  authorized_date: string;
  category?: string[];
  payment_channel: string;
  payment_meta?: {
    by_order_of: string | null;
    payee: string | null;
    payer: string | null;
    payment_method: string | null;
    payment_processor: string | null;
    ppd_id: string | null;
    reason: string | null;
    reference_number: string | null;
  };
  logo_url?: string;
  location?: {
    address?: string;
    city?: string;
    region?: string;
    postal_code?: string;
    country?: string;
  };
  original_description: string;
  website?: string;
  account_owner?: string;
  transaction_id?: string;
  category_id?: string;
  pending: boolean;
  iso_currency_code?: string;
  merchant_entity_id?: string;
  plaid_account_id?: string;
  personal_finance_category_icon_url?: string;
  account_id?: string;
  transaction_code?: string;
  transaction_type?: string;
}

interface CategoryButton {
  label: string;
  selected: boolean;
}

// Helper function to format date
function formatDateToLabel(date: Date): string {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const year = date.getFullYear();
  const month = months[date.getMonth()];
  const day = date.getDate();
  return `${month} ${day}, ${year}`;
}

// Enhanced Transaction Dialog
const TransactionDialog = ({ 
  visible, 
  transaction, 
  onClose 
}: { 
  visible: boolean; 
  transaction: PlaidTransaction | null; 
  onClose: () => void 
}) => {
  const { colors } = useThemeColors();
  const translateY = useRef(new Animated.Value(100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          damping: 15,
          mass: 1,
          stiffness: 120,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          damping: 15,
          mass: 1,
          stiffness: 120,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 100,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 0.95,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const renderDetailItem = (label: string, value: string) => (
    <MotiView
      from={{ opacity: 0, translateX: -20 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ type: 'timing', duration: 400 }}
      style={{
        marginBottom: 16,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        padding: 16,
      }}
    >
      <ThemedText style={{ fontSize: 12, color: colors.secondaryText, marginBottom: 4 }}>
        {label}
      </ThemedText>
      <ThemedText style={{ fontSize: 16, color: colors.primaryText, fontWeight: '600' }}>
        {value}
      </ThemedText>
    </MotiView>
  );

  if (!visible || !transaction) return null;

  function getCategoryIcon(category: string[] | undefined): string {
    if (!category || category.length === 0) return "document";
    
    const mainCategory = category[0].toLowerCase();
    
    switch (true) {
      case mainCategory.includes('food') || mainCategory.includes('restaurant'):
        return "restaurant";
      case mainCategory.includes('travel') || mainCategory.includes('transport'):
        return "car";
      case mainCategory.includes('shopping') || mainCategory.includes('merchandise'):
        return "cart";
      case mainCategory.includes('payment') || mainCategory.includes('transfer'):
        return "creditcard";
      case mainCategory.includes('recreation') || mainCategory.includes('entertainment'):
        return "ticket";
      case mainCategory.includes('health') || mainCategory.includes('medical'):
        return "medical";
      case mainCategory.includes('service') || mainCategory.includes('utilities'):
        return "tools";
      default:
        return "document";
    }
  }

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          activeOpacity={1}
        >
          <Animated.View
            style={{
              opacity,
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.3)',
            }}
          />
        </TouchableOpacity>

        <Animated.View
          style={{
            transform: [{ translateY }, { scale }],
            backgroundColor: colors.backgroundCard,
            margin: 16,
            borderRadius: 24,
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <LinearGradient
            colors={[colors.brandColor || '#29c3e5', colors.brandColor || '#29c3e5']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              padding: 20,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: 'rgba(255,255,255,0.2)',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <IconSymbol
                name={getCategoryIcon(transaction.category)}
                size={24}
                color="#FFFFFF"
              />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText style={{ color: '#FFFFFF', fontSize: 20, fontWeight: '700' }}>
                {transaction.merchant_name || transaction.name}
              </ThemedText>
              <ThemedText style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16, marginTop: 4 }}>
                ${Math.abs(transaction.amount).toFixed(2)}
              </ThemedText>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: 'rgba(255,255,255,0.2)',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <IconSymbol name="close" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </LinearGradient>

          {/* Content */}
          <ScrollView
            style={{ maxHeight: '80%' }}
            contentContainerStyle={{ padding: 20 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Transaction Details */}
            <View style={{ marginBottom: 24 }}>
              <ThemedText style={{ fontSize: 18, fontWeight: '600', marginBottom: 16 }}>
                Transaction Details
              </ThemedText>
              {renderDetailItem("Date", (() => {
                const date = new Date(transaction.authorized_date);
                let hours = date.getHours();
                const minutes = date.getMinutes();
                const ampm = hours >= 12 ? 'PM' : 'AM';
                hours = hours % 12;
                hours = hours === 0 ? 12 : hours;
                const formattedTime = `${hours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
                
                return `${date.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })} ${formattedTime}`;
              })())}
              {renderDetailItem("Status", transaction.pending ? 'Pending' : 'Completed')}
              {transaction.category ? renderDetailItem("Category", transaction.category.join(' › ')) : renderDetailItem("Category", "Uncategorized")}
              {transaction.payment_channel && renderDetailItem("Payment Method", transaction.payment_channel)}
            </View>

            {/* Location Info */}
            {transaction.location && (
              <View style={{ marginBottom: 24 }}>
                <ThemedText style={{ fontSize: 18, fontWeight: '600', marginBottom: 16 }}>
                  Location
                </ThemedText>
                <MotiView
                  from={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'timing', duration: 400 }}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    borderRadius: 12,
                    padding: 16,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <IconSymbol name="location" size={20} color={colors.brandColor} />
                    <ThemedText style={{ marginLeft: 8, fontSize: 16, fontWeight: '600' }}>
                      {`${transaction.location.city}, ${transaction.location.region}`}
                    </ThemedText>
                  </View>
                  {transaction.location.address && (
                    <ThemedText style={{ color: colors.secondaryText }}>
                      {transaction.location.address}
                    </ThemedText>
                  )}
                </MotiView>
              </View>
            )}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

// Transaction Item Component with Animation
const PaymentItem = memo(({ 
  transaction, 
  index, 
  onPress 
}: { 
  transaction: PlaidTransaction; 
  index: number;
  onPress: (transaction: PlaidTransaction) => void;
}) => {
  const { colors } = useThemeColors();
  const date = new Date(transaction?.authorized_date || new Date());
  const animatedValue = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 400,
      delay: index * 100,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };
  
  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };
  
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours === 0 ? 12 : hours;
  const formattedTime = `${hours}:${minutes.toString().padStart(2, '0')} ${ampm}`;

  // Take first 2 categories if available
  const displayCategories = transaction.category?.slice(0, 2) || [];
  
  // Get transaction type color
  const getTransactionColor = (amount: number) => {
    return amount < 0 ? '#E53935' : '#43A047';
  };

  // Get category icon
  const getCategoryIcon = (category?: string[]) => {
    if (!category || category.length === 0) return "document";
    
    const mainCategory = category[0].toLowerCase();
    if (mainCategory.includes('food')) return "restaurant";
    if (mainCategory.includes('travel')) return "airplane";
    if (mainCategory.includes('shopping')) return "cart";
    if (mainCategory.includes('entertainment')) return "ticket";
    if (mainCategory.includes('health')) return "heart";
    if (mainCategory.includes('transport')) return "car";
    return "document";
  };
  
  // Format date for display
  const formattedDate = new Date(transaction.authorized_date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        style={{
          opacity: animatedValue,
          transform: [
            { 
              translateX: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0]
              })
            },
            { scale: scaleAnim }
          ],
          marginBottom: 12, // Reduced margin
          marginHorizontal: 16,
          borderRadius: 16, // Reduced radius
          backgroundColor: colors.backgroundCard,
          // Simplified shadow
          ...Platform.select({
            ios: {
              shadowColor: colors.shadow,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
            },
            android: {
              elevation: 3,
            }
          }),
          borderWidth: 1,
          borderColor: 'rgba(0,0,0,0.03)'
        }}
      >
        <View style={{ 
          flexDirection: 'row', 
          padding: 16, // Reduced padding
          alignItems: 'center'
        }}>
          {/* Simplified Logo/Icon Container */}
          <View style={{ 
            width: 48, // Reduced size
            height: 48,
            borderRadius: 24,
            backgroundColor: 'rgba(255,255,255,0.9)',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 12,
            borderWidth: 1,
            borderColor: 'rgba(0,0,0,0.05)',
          }}>
            {transaction.logo_url ? (
              <Image 
                source={{ uri: transaction.logo_url }} 
                style={{ 
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                }}
                resizeMode="contain"
              />
            ) : (
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: colors.brandColor,
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <IconSymbol
                  name={getCategoryIcon(transaction.category)}
                  size={24}
                  color="#FFFFFF"
                />
              </View>
            )}
          </View>
          
          {/* Transaction Main Info */}
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <ThemedText 
                type="defautlSmall" 
                colorValue="primaryText" 
                style={{ 
                  fontWeight: '700', 
                  fontSize: 16,
                  maxWidth: '70%',
                }}
                numberOfLines={1}
              >
                {transaction.merchant_name || transaction.name}
              </ThemedText>
              <ThemedText 
                type="defautlSmall" 
                style={{ 
                  fontWeight: '700', 
                  fontSize: 16,
                  color: getTransactionColor(transaction.amount)
                }}
              >
                ${Math.abs(transaction.amount).toFixed(2)}
              </ThemedText>
            </View>
            
            {/* Simplified Categories */}
            <View style={{ flexDirection: 'row', marginTop: 4 }}>
              {displayCategories.map((category, idx) => (
                <View
                  key={idx}
                  style={{ 
                    backgroundColor: 'rgba(99, 102, 241, 0.1)', 
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 12,
                    marginRight: 8,
                  }}
                >
                  <ThemedText 
                    type="semiSmall" 
                    style={{ 
                      color: '#4F46E5',
                      fontSize: 12,
                    }}
                  >
                    {category}
                  </ThemedText>
                </View>
              ))}
            </View>
          </View>
        </View>
        
        {/* Simplified Details Section */}
        <View style={{ 
          backgroundColor: 'rgba(249, 250, 251, 0.8)',
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderTopWidth: 1,
          borderTopColor: 'rgba(0,0,0,0.03)',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {transaction.payment_meta?.payment_method && (
              <View
                style={{ 
                  flexDirection: 'row', 
                  alignItems: 'center',
                  backgroundColor: "rgba(236, 119, 53, 0.1)", 
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 12,
                }}
              >
                <IconSymbol name="card" size={14} color="#EC7735" style={{ marginRight: 4 }} />
                <ThemedText 
                  type="defautlSmall" 
                  style={{ color: "#EC7735", fontSize: 12 }}
                >
                  {transaction.payment_meta.payment_method}
                </ThemedText>
              </View>
            )}
            {transaction.payment_channel && (
              <View
                style={{ 
                  flexDirection: 'row', 
                  alignItems: 'center',
                  backgroundColor: "rgba(79, 70, 229, 0.1)", 
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 12,
                }}
              >
                <IconSymbol name="wallet" size={14} color="#4F46E5" style={{ marginRight: 4 }} />
                <ThemedText 
                  type="defautlSmall" 
                  style={{ color: "#4F46E5", fontSize: 12 }}
                >
                  {transaction.payment_channel}
                </ThemedText>
              </View>
            )}
            {transaction.transaction_type && (
              <View
                style={{ 
                  flexDirection: 'row', 
                  alignItems: 'center',
                  backgroundColor: "rgba(16, 185, 129, 0.1)", 
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 12,
                }}
              >
                <IconSymbol name="gift" size={14} color="#10B981" style={{ marginRight: 4 }} />
                <ThemedText 
                  type="defautlSmall" 
                  style={{ color: "#10B981", fontSize: 12 }}
                >
                  {transaction.transaction_type}
                </ThemedText>
              </View>
            )}
          </View>

          <TouchableOpacity
            onPress={() => onPress(transaction)}
          >
            <ThemedText 
              type="defautlSmall" 
              style={{ 
                color: "#4F46E5", 
                fontSize: 14,
                fontWeight: '500'
              }}
            >
              Details
            </ThemedText>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for memo
  return (
    prevProps.transaction.id === nextProps.transaction.id &&
    prevProps.index === nextProps.index
  );
});

// Date Header Component
const DateHeader = memo(({ date }: { date: string }) => {
  const { colors } = useThemeColors();
  
  return (
    <View style={{ 
      marginHorizontal: 16, 
      marginTop: 24, 
      marginBottom: 12,
      flexDirection: 'row',
      alignItems: 'center'
    }}>
      <View style={{ 
        width: 36, 
        height: 36, 
        borderRadius: 18, 
        backgroundColor: colors.brandColor,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12
      }}>
        <IconSymbol name="calendar" size={18} color="#FFFFFF" />
      </View>
      <ThemedText
        type="defautlSmall"
        colorValue="primaryText"
        style={{ fontSize: 18, fontWeight: '600' }}
      >
        {date}
      </ThemedText>
    </View>
  );
});

// Category Pill Component
const CategoryPill = memo(({ 
  category, 
  onPress, 
  disabled 
}: { 
  category: CategoryButton; 
  onPress: () => void; 
  disabled: boolean 
}) => {
  const { colors } = useThemeColors();
  const animatedScale = useRef(new Animated.Value(1)).current;
  
  const handlePressIn = () => {
    Animated.spring(animatedScale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };
  
  const handlePressOut = () => {
    Animated.spring(animatedScale, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };
  
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
    >
      <Animated.View
        style={{
          transform: [{ scale: animatedScale }],
          paddingHorizontal: 14,
          paddingVertical: 10,
          borderRadius: 20,
          marginRight: 8,
          backgroundColor: category.selected ? colors.brandColor : 'rgba(0,0,0,0.05)',
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: category.selected ? colors.brandColor : 'transparent',
          opacity: disabled ? 0.7 : 1,
        }}
      >
        <ThemedText
          type="defautlSmall"
          style={{ 
            color: category.selected ? '#FFFFFF' : colors.primaryText,
            fontWeight: '600',
            fontSize: 14,
            marginRight: 6
          }}
        >
          {category.label}
        </ThemedText>
        <IconSymbol
          name={category.selected ? "checkSingle" : "plus"}
          size={14}
          color={category.selected ? '#FFFFFF' : colors.primaryText}
        />
      </Animated.View>
    </TouchableOpacity>
  );
});

// Loading Animation Component
const LoadingAnimation = () => {
  const { colors } = useThemeColors();
  const pulseAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        })
      ])
    ).start();
  }, []);
  
  const opacityInterpolate = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 1]
  });
  
  const scaleInterpolate = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.95, 1.05]
  });
  
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Animated.View
        style={{
          opacity: opacityInterpolate,
          transform: [{ scale: scaleInterpolate }],
          alignItems: 'center'
        }}
      >
        <View style={{ 
          width: 80, 
          height: 80, 
          borderRadius: 40, 
          backgroundColor: colors.brandColor,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 20,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 5,
        }}>
          <IconSymbol name="funnel" size={36} color="#FFFFFF" />
        </View>
        <ActivityIndicator size="large" color={colors.brandColor} />
        <ThemedText 
          type="default" 
          colorValue="primaryText" 
          style={{ marginTop: 16, fontWeight: '600' }}
        >
          Loading Transactions
        </ThemedText>
      </Animated.View>
    </View>
  );
};

// Enhanced AI Filter Button Component with Spreading Animation
const AIFilterButton = memo(({ 
  isAIMode, 
  isFiltering, 
  onPress 
}: { 
  isAIMode: boolean; 
  isFiltering: boolean; 
  onPress: () => void 
}) => {
  const { colors } = useThemeColors();
  const animatedValue = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const spreadAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isAIMode ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
    
    // Add spreading animation when toggled
    if (!isAIMode) {
      spreadAnim.setValue(0);
      Animated.sequence([
        Animated.timing(spreadAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.05,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            })
          ])
        )
      ]).start();
    } else {
      // Reset to normal scale when not in AI mode
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isAIMode]);
  
  const backgroundColorInterpolate = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255,255,255,0.8)', colors.brandColor]
  });
  
  const textColorInterpolate = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.primaryText, '#FFFFFF']
  });
  
  const borderColorInterpolate = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.border, colors.brandColor]
  });
  
  const spreadScale = spreadAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.3, 1]
  });
  
  const spreadOpacity = spreadAnim.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [0, 0.5, 0]
  });
  
  return (
    <TouchableOpacity 
      onPress={onPress}
      disabled={isFiltering}
      activeOpacity={0.8}
      style={{
        opacity: isFiltering ? 0.7 : 1,
      }}
    >
      <View style={{ position: 'relative' }}>
        {/* Spreading effect overlay */}
        {isAIMode && (
          <Animated.View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: colors.brandColor,
              borderRadius: 24,
              transform: [{ scale: spreadScale }],
              opacity: spreadOpacity,
              zIndex: -1,
            }}
          />
        )}
        
        <Animated.View
          style={{
            backgroundColor: backgroundColorInterpolate,
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: 24,
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: borderColorInterpolate,
            shadowColor: colors.shadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: isAIMode ? 0.3 : 0,
            shadowRadius: 4,
            elevation: isAIMode ? 3 : 0,
            transform: [{ scale: pulseAnim }]
          }}
        >
          <Animated.View style={{ 
            marginRight: 8,
            backgroundColor: isAIMode ? 'rgba(255,255,255,0.2)' : 'transparent',
            padding: 4,
            borderRadius: 12
          }}>
            <IconSymbol 
              name={isAIMode ? "sparkles" : "funnel"} 
              size={16} 
              color={isAIMode ? '#FFFFFF' : colors.primaryText} 
            />
          </Animated.View>
          <Animated.Text
            style={{
              color: textColorInterpolate,
              fontWeight: '600',
              fontSize: 14,
            }}
          >
            {isFiltering ? "Processing..." : isAIMode ? "AI Active" : "AI Filters"}
          </Animated.Text>
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
});

// Modified FloatingActionButton with spreading effect
export const FloatingActionButton = ({ 
  iconName, 
  backgroundColor, 
  onPress, 
  style 
}: { 
  iconName: string; 
  backgroundColor: string; 
  onPress: () => void; 
  style?: any 
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const spreadAnim = useRef(new Animated.Value(0)).current;
  
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };
  
  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };
  
  const handlePress = () => {
    // Trigger spreading animation
    spreadAnim.setValue(0);
    Animated.timing(spreadAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
    
    // Call the original onPress
    onPress();
  };
  
  const spreadScale = spreadAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.5, 1]
  });
  
  const spreadOpacity = spreadAnim.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [0, 0.5, 0]
  });
  
  return (
    <View style={{ 
      position: 'absolute', 
      bottom: 20, 
      right: 20,
      zIndex: 100
    }}>
      {/* Spreading effect overlay */}
      <Animated.View
        style={{
          position: 'absolute',
          width: 60,
          height: 60,
          borderRadius: 30,
          backgroundColor,
          transform: [{ scale: spreadScale }],
          opacity: spreadOpacity,
        }}
      />
      
      <TouchableOpacity
        activeOpacity={0.9}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
      >
        <Animated.View
          style={[{
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor,
            justifyContent: 'center',
            alignItems: 'center',
            transform: [{ scale: scaleAnim }]
          }, style]}
        >
          <IconSymbol name={iconName} size={24} color="#FFFFFF" />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

// Main Component
export default function TaxScreen() {
  const { colors } = useThemeColors();
  const router = useRouter();
  const [transactions, setTransactions] = useState<PlaidTransaction[]>([]);
  const [categories, setCategories] = useState<CategoryButton[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
  const [isAIMode, setIsAIMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<PlaidTransaction | null>(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const groupedTransactions = {} as Record<string, PlaidTransaction[]>;
  
  // Header animation values
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [screenHeight * 0.12, screenHeight * 0.08],
    extrapolate: 'clamp'
  });
  
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 60, 90],
    outputRange: [1, 0.8, 0],
    extrapolate: 'clamp'
  });
  
  const compactHeaderOpacity = scrollY.interpolate({
    inputRange: [60, 90],
    outputRange: [0, 1],
    extrapolate: 'clamp'
  });

  // Fetch transactions based on mode (AI or normal)
  const fetchTransactions = async (useAI: boolean = false) => {
    setIsLoading(true);
    setError(null);

    try {
      const userToken = await AsyncStorage.getItem("userToken");
      if (!userToken) {
        throw new Error("Authentication token not found");
      }

      const endpoint = useAI ? 
        `${Config.apiBaseUrl}/api/v1/plaid/ai/classify-transactions` : 
        `${Config.apiBaseUrl}/api/v1/plaid/db/transactions`;

      const response = await fetch(
        `${endpoint}?` +
        `skip=0&limit=${useAI ? "50" : "100"}&` +
        `start_date=2018-01-01T00:00:00.000Z&` +
        `end_date=2025-04-10T23:59:59.999Z`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );

      // Check if response is ok
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Server returned ${response.status}: ${errorText}`
        );
      }

      const responseData = await response.json();

      // Handle different response formats
      let transactionsData;
      if (useAI) {
        transactionsData = responseData.transactions || 
                          responseData.data || 
                          responseData.results || 
                          responseData;
      } else {
        transactionsData = responseData;
      }

      // Validate the transactions data
      if (!Array.isArray(transactionsData)) {
        throw new Error("Invalid response format: transactions data is not an array");
      }

      setTransactions(transactionsData);
      
      if (transactionsData.length > 0) {
        const uniqueCategories = extractUniqueCategories(transactionsData);
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError(
        error instanceof Error 
          ? `Failed to fetch transactions: ${error.message}` 
          : "An unexpected error occurred"
      );
      setTransactions([]);
      setCategories([]);
    } finally {
      setIsLoading(false);
      setIsFiltering(false); // Ensure filtering state is reset
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchTransactions();
  }, []);

  // Handle AI Filter toggle
  const handleAIFilterToggle = async () => {
    setIsFiltering(true);
    try {
      const newMode = !isAIMode;
      setIsAIMode(newMode);
      await fetchTransactions(newMode);
    } finally {
      setIsFiltering(false);
    }
  };

  const extractUniqueCategories = (transactions: PlaidTransaction[]) => {
    const uniqueCategories = new Set<string>();
    
    transactions.forEach(transaction => {
      transaction.category?.forEach(category => {
        uniqueCategories.add(category);
      });
    });

    return Array.from(uniqueCategories).map(category => ({
      label: category,
      selected: true
    }));
  };

  const toggleCategory = async (categoryLabel: string) => {
    setIsFiltering(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      setCategories(categories.map(cat => 
        cat.label === categoryLabel ? { ...cat, selected: !cat.selected } : cat
      ));
    } finally {
      setIsFiltering(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTransactions(isAIMode);
  }, [isAIMode]);
  
  const handleTransactionPress = useCallback((transaction: PlaidTransaction) => {
    setSelectedTransaction(transaction);
    setDialogVisible(true);
  }, []);

  if (isLoading && !refreshing) {
    return <LoadingAnimation />;
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
        <IconSymbol name="warning" size={48} color={colors.badBanner} style={{ marginBottom: 16 }} />
        <ThemedText type="default" colorValue="badBanner" style={{ textAlign: 'center' }}>
          {error}
        </ThemedText>
        <TouchableOpacity
          onPress={() => fetchTransactions(isAIMode)}
          style={{
            marginTop: 24,
            paddingHorizontal: 20,
            paddingVertical: 10,
            backgroundColor: colors.brandColor,
            borderRadius: 24,
          }}
        >
          <ThemedText type="defautlSmall" style={{ color: '#FFFFFF', fontWeight: '600' }}>
            Try Again
          </ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

  // Filter transactions based on selected categories
  const filteredTransactions = transactions.filter(transaction => 
    transaction.category?.some(cat => 
      categories.find(c => c.label === cat)?.selected
    )
  );

  // Group filtered transactions by date
  filteredTransactions.forEach((transaction) => {
    const date = formatDateToLabel(new Date(transaction.authorized_date));
    
    if (!groupedTransactions[date]) {
      groupedTransactions[date] = [];
    }
    groupedTransactions[date].push(transaction);
  });

  // Prepare data for FlatList
  const listData = Object.entries(groupedTransactions).map(([date, transactions]) => ({
    date,
    transactions,
    key: date,
  }));

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Transaction Description Dialog */}
      <TransactionDialog 
        visible={dialogVisible} 
        transaction={selectedTransaction} 
        onClose={() => setDialogVisible(false)} 
      />
      
      {/* Header - Modified to remove icon in the left of transaction letter */}
      <View style={{ 
        backgroundColor: colors.background,
        paddingTop: Platform.OS === 'ios' ? 50 : 20,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
        zIndex: 10,
      }}>
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          paddingHorizontal: 16,
        }}>
          <ThemedText type="title" style={{ fontSize: 24, fontWeight: '700', marginLeft: 60 }}>
            Transactions
          </ThemedText>
          
          <AIFilterButton 
            isAIMode={isAIMode} 
            isFiltering={isFiltering} 
            onPress={handleAIFilterToggle} 
          />
        </View>
      </View>
      
      {/* Categories Section - Animated */}
      <Animated.View style={{ 
        height: headerHeight,
        opacity: headerOpacity,
        overflow: 'hidden',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
        backgroundColor: colors.background,
        zIndex: 5,
      }}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingVertical: 16,
            gap: 8,
            flexDirection: 'row',
            flexWrap: 'nowrap',
            alignItems: 'center'
          }}
        >
          {categories.map((category) => (
            <CategoryPill
              key={category.label}
              category={category}
              onPress={() => toggleCategory(category.label)}
              disabled={isFiltering}
            />
          ))}
        </ScrollView>
      </Animated.View>
      
      {/* Compact Categories - Shows when scrolled */}
      <Animated.View style={{
        position: 'absolute',
        top: Platform.OS === 'ios' ? 90 : 60,
        left: 0,
        right: 0,
        height: 50,
        opacity: compactHeaderOpacity,
        backgroundColor: colors.background,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
        zIndex: 5,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
      }}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 8,
          }}
        >
          {categories.filter(cat => cat.selected).map((category) => (
            <View
              key={category.label}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 16,
                marginRight: 8,
                backgroundColor: colors.brandColor,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <ThemedText
                type="defautlSmall"
                style={{ 
                  color: '#FFFFFF',
                  fontWeight: '600',
                  fontSize: 12,
                }}
              >
                {category.label}
              </ThemedText>
            </View>
          ))}
        </ScrollView>
      </Animated.View>

      {/* Transaction List */}
      {isFiltering ? (
        <View style={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
        }}>
          <View style={{ 
            width: 100, 
            height: 100, 
            borderRadius: 50, 
            backgroundColor: colors.brandColor,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 20,
            shadowColor: colors.shadow,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 5,
          }}>
            <IconSymbol name={isAIMode ? "sparkles" : "funnel"} size={40} color="#FFFFFF" />
          </View>
          <ActivityIndicator size="large" color={colors.brandColor} />
          <ThemedText type="default" style={{ marginTop: 16, fontWeight: '600' }}>
            {isAIMode ? "AI is analyzing your transactions..." : "Updating filters..."}
          </ThemedText>
        </View>
      ) : null}

      {filteredTransactions.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{ 
            width: 80, 
            height: 80, 
            borderRadius: 40, 
            backgroundColor: 'rgba(0,0,0,0.05)',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 16
          }}>
            <IconSymbol name="document" size={36} color={colors.textTertiary} />
          </View>
          <ThemedText type="default" colorValue="textTertiary" style={{ textAlign: 'center', marginBottom: 16 }}>
            No transactions found matching your filters
          </ThemedText>
          <TouchableOpacity
            onPress={() => {
              setCategories(categories.map(cat => ({ ...cat, selected: true })));
            }}
            style={{
              paddingHorizontal: 20,
              paddingVertical: 10,
              backgroundColor: colors.brandColor,
              borderRadius: 24,
            }}
          >
            <ThemedText type="defautlSmall" style={{ color: '#FFFFFF', fontWeight: '600' }}>
              Reset Filters
            </ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <Animated.FlatList
          data={listData}
          keyExtractor={(item) => item.key}
          contentContainerStyle={{ paddingBottom: 100, paddingTop: 8 }}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
          // refreshControl={
          //   <RefreshControl
          //     refreshing={refreshing}
          //     onRefresh={onRefresh}
          //     colors={[colors.brandColor]}
          //     tintColor={colors.brandColor}
          //   />
          // }
          renderItem={({ item }) => (
            <View>
              <DateHeader date={item.date} />
              {item.transactions.map((transaction, index) => (
                <PaymentItem 
                  key={`${transaction.id}-${index}`}
                  transaction={transaction}
                  index={index}
                  onPress={() => handleTransactionPress(transaction)}
                />
              ))}
            </View>
          )}
          ListEmptyComponent={() => (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <ThemedText type="default" colorValue="textTertiary">
                No transactions found
              </ThemedText>
            </View>
          )}
        />
      )}

      {/* Floating Action Button with Animation */}
      <FloatingActionButton 
        iconName="chatbubble-ellipses"
        backgroundColor={colors.brandColor}
        onPress={() => router.push("/main/chatbot")}
        style={{
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 5,
        }}
      />
    </View>
  );
}
