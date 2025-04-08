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
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { useThemeColors } from "@/components/ColorSchemeProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { useState, useEffect, useRef, useCallback } from "react";
import { SlideInView } from "@/components/FadeInView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import Config from "@/constants/config";
import { platformColor } from "@/constants/Colors";
import { memo } from "react";
const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

interface PlaidTransaction {
  id: string;
  amount: number;
  name: string;
  merchant_name?: string;
  authorized_date: string;
  category?: string[];
  payment_channel: string;
  payment_meta?: {
    payment_method?: string;
    payment_processor?: string;
  };
  logo_url?: string;
  location?: {
    address?: string;
    city?: string;
    region?: string;
    postal_code?: string;
  };
  original_description: string;
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

// Transaction Description Dialog
const DescriptionDialog = ({ 
  visible, 
  transaction, 
  onClose 
}: { 
  visible: boolean; 
  transaction: PlaidTransaction | null; 
  onClose: () => void 
}) => {
  const { colors } = useThemeColors();
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 150,
          useNativeDriver: true
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true
        })
      ]).start();
    }
  }, [visible]);
  
  if (!transaction) return null;
  
  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <Pressable 
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20
        }}
        onPress={onClose}
      >
        <Animated.View
          style={{
            backgroundColor: colors.backgroundCard,
            borderRadius: 16,
            padding: 20,
            width: '100%',
            maxWidth: 400,
            shadowColor: colors.shadow,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 8,
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim
          }}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: 16
            }}>
              <ThemedText 
                type="defautlSmall" 
                colorValue="primaryText" 
                style={{ fontSize: 18, fontWeight: '700' }}
              >
                Transaction Details
              </ThemedText>
              <TouchableOpacity onPress={onClose}>
                <IconSymbol name="close" size={20} color={colors.primaryText} />
              </TouchableOpacity>
            </View>
            
            <View style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              marginBottom: 16,
              paddingBottom: 16,
              borderBottomWidth: 1,
              borderBottomColor: 'rgba(0,0,0,0.1)'
            }}>
              <View style={{ 
                width: 48, 
                height: 48, 
                borderRadius: 24, 
                backgroundColor: 'rgba(0,0,0,0.05)',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 16
              }}>
                {transaction.logo_url ? (
                  <Image 
                    source={{ uri: transaction.logo_url }} 
                    style={{ width: 48, height: 48, borderRadius: 24 }}
                  />
                ) : (
                  <ThemedText type="btnText" colorValue="btnText" style={{ fontSize: 20 }}>
                    {transaction.merchant_name?.[0] || transaction.name[0]}
                  </ThemedText>
                )}
              </View>
              <View>
                <ThemedText 
                  type="defautlSmall" 
                  colorValue="primaryText" 
                  style={{ fontWeight: '700', fontSize: 16 }}
                >
                  {transaction.merchant_name || transaction.name}
                </ThemedText>
                <ThemedText 
                  type="defautlSmall" 
                  colorValue="textTertiary" 
                  style={{ fontSize: 14 }}
                >
                  {new Date(transaction.authorized_date).toLocaleDateString()}
                </ThemedText>
              </View>
            </View>
            
            <View style={{ marginBottom: 16 }}>
              <ThemedText 
                type="defautlSmall" 
                colorValue="textTertiary" 
                style={{ fontSize: 14, marginBottom: 4 }}
              >
                Description
              </ThemedText>
              <View style={{ 
                backgroundColor: 'rgba(0,0,0,0.03)', 
                padding: 12, 
                borderRadius: 8,
                marginBottom: 12
              }}>
                <ThemedText 
                  type="defautlSmall" 
                  colorValue="primaryText" 
                  style={{ fontSize: 14 }}
                >
                  {transaction.original_description || "No description available"}
                </ThemedText>
              </View>
              
              <ThemedText 
                type="defautlSmall" 
                colorValue="textTertiary" 
                style={{ fontSize: 14, marginBottom: 4 }}
              >
                Amount
              </ThemedText>
              <View style={{ 
                backgroundColor: 'rgba(0,0,0,0.03)', 
                padding: 12, 
                borderRadius: 8,
                marginBottom: 12
              }}>
                <ThemedText 
                  type="defautlSmall" 
                  colorValue="primaryText" 
                  style={{ 
                    fontSize: 18, 
                    fontWeight: '700',
                    color: transaction.amount < 0 ? '#E53935' : '#43A047'
                  }}
                >
                  ${Math.abs(transaction.amount).toFixed(2)}
                </ThemedText>
              </View>
              
              {transaction.location && (
                <>
                  <ThemedText 
                    type="defautlSmall" 
                    colorValue="textTertiary" 
                    style={{ fontSize: 14, marginBottom: 4 }}
                  >
                    Location
                  </ThemedText>
                  <View style={{ 
                    backgroundColor: 'rgba(0,0,0,0.03)', 
                    padding: 12, 
                    borderRadius: 8,
                    marginBottom: 12
                  }}>
                    <ThemedText 
                      type="defautlSmall" 
                      colorValue="primaryText" 
                      style={{ fontSize: 14 }}
                    >
                      {transaction.location.address ? `${transaction.location.address}, ` : ''}
                      {transaction.location.city ? `${transaction.location.city}, ` : ''}
                      {transaction.location.region || ''}
                      {transaction.location.postal_code ? ` ${transaction.location.postal_code}` : ''}
                    </ThemedText>
                  </View>
                </>
              )}
              
              {transaction.payment_meta && (
                <>
                  <ThemedText 
                    type="defautlSmall" 
                    colorValue="textTertiary" 
                    style={{ fontSize: 14, marginBottom: 4 }}
                  >
                    Payment Details
                  </ThemedText>
                  <View style={{ 
                    backgroundColor: 'rgba(0,0,0,0.03)', 
                    padding: 12, 
                    borderRadius: 8
                  }}>
                    {transaction.payment_meta.payment_method && (
                      <ThemedText 
                        type="defautlSmall" 
                        colorValue="primaryText" 
                        style={{ fontSize: 14, marginBottom: 4 }}
                      >
                        Method: {transaction.payment_meta.payment_method}
                      </ThemedText>
                    )}
                    {transaction.payment_meta.payment_processor && (
                      <ThemedText 
                        type="defautlSmall" 
                        colorValue="primaryText" 
                        style={{ fontSize: 14 }}
                      >
                        Processor: {transaction.payment_meta.payment_processor}
                      </ThemedText>
                    )}
                  </View>
                </>
              )}
            </View>
            
            <TouchableOpacity
              onPress={onClose}
              style={{
                backgroundColor: colors.brandColor,
                paddingVertical: 12,
                borderRadius: 24,
                alignItems: 'center'
              }}
            >
              <ThemedText 
                type="defautlSmall" 
                style={{ color: '#FFFFFF', fontWeight: '600' }}
              >
                Close
              </ThemedText>
            </TouchableOpacity>
          </Pressable>
        </Animated.View>
      </Pressable>
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
  onPress: () => void;
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
      activeOpacity={0.9}
      onPress={onPress}
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
          marginBottom: 12,
          marginHorizontal: 16,
          borderRadius: 16,
          backgroundColor: colors.backgroundCard,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3,
          overflow: 'hidden'
        }}
      >
        <View style={{ 
          flexDirection: 'row', 
          padding: 16,
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(0,0,0,0.05)'
        }}>
          <View style={{ 
            width: 48, 
            height: 48, 
            borderRadius: 24, 
            backgroundColor: 'rgba(0,0,0,0.05)',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 16
          }}>
            {transaction.logo_url ? (
              <Image 
                source={{ uri: transaction.logo_url }} 
                style={{ width: 48, height: 48, borderRadius: 24 }}
              />
            ) : (
              <IconSymbol
                name={getCategoryIcon(transaction.category)}
                size={24}
                color={colors.primaryText}
              />
            )}
          </View>
          
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <ThemedText 
                type="defautlSmall" 
                colorValue="primaryText" 
                style={{ fontWeight: '700', fontSize: 16, maxWidth: '70%' }}
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
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', maxWidth: '70%' }}>
                {displayCategories.map((category, idx) => (
                  <View 
                    key={idx} 
                    style={{ 
                      backgroundColor: 'rgba(0,0,0,0.05)', 
                      paddingHorizontal: 8, 
                      paddingVertical: 2, 
                      borderRadius: 12,
                      marginRight: 6,
                      marginBottom: 4
                    }}
                  >
                    <ThemedText 
                      type="semiSmall" 
                      colorValue="cardText"
                      style={{ fontSize: 12 }}
                    >
                      {category}
                    </ThemedText>
                  </View>
                ))}
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <IconSymbol name="clock" size={12} color={colors.textTertiary} style={{ marginRight: 4 }} />
                <ThemedText type="defautlSmall" colorValue="textTertiary" style={{ fontSize: 12 }}>
                  {formattedTime}
                </ThemedText>
              </View>
            </View>
          </View>
        </View>
        
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          paddingHorizontal: 16, 
          paddingVertical: 12,
          backgroundColor: 'rgba(0,0,0,0.02)'
        }}>
          {/* First row of additional info */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {/* Payment Method Tag */}
            {transaction.payment_meta?.payment_method && (
              <View style={{ 
                flexDirection: 'row', 
                alignItems: 'center',
                backgroundColor: "#FEF6F1", 
                paddingHorizontal: 10, 
                paddingVertical: 4, 
                borderRadius: 12,
                marginRight: 8,
                marginBottom: 8
              }}>
                <IconSymbol name="card" size={14} color="#EC7735" style={{ marginRight: 4 }} />
                <ThemedText 
                  type="defautlSmall" 
                  style={{ color: "#EC7735", fontWeight: '600', fontSize: 12 }}
                >
                  {transaction.payment_meta.payment_method}
                </ThemedText>
              </View>
            )}
            
            {/* Payment Channel Tag */}
            <View style={{ 
              flexDirection: 'row', 
              alignItems: 'center',
              backgroundColor: "#E8F4FD", 
              paddingHorizontal: 10, 
              paddingVertical: 4, 
              borderRadius: 12,
              marginRight: 8,
              marginBottom: 8
            }}>
              <IconSymbol name="send" size={14} color="#379AE6" style={{ marginRight: 4 }} />
              <ThemedText 
                type="defautlSmall" 
                style={{ color: "#379AE6", fontWeight: '600', fontSize: 12 }}
              >
                {transaction.payment_channel}
              </ThemedText>
            </View>
            
            {/* Date Tag */}
            <View style={{ 
              flexDirection: 'row', 
              alignItems: 'center',
              backgroundColor: "#F0F1F3", 
              paddingHorizontal: 10, 
              paddingVertical: 4, 
              borderRadius: 12,
              marginBottom: 8
            }}>
              <IconSymbol name="calendar" size={14} color="#6B7280" style={{ marginRight: 4 }} />
              <ThemedText 
                type="defautlSmall" 
                style={{ color: "#6B7280", fontWeight: '600', fontSize: 12 }}
              >
                {formattedDate}
              </ThemedText>
            </View>
          </View>
        </View>
        
        {/* Second row with location and processor info */}
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          paddingHorizontal: 16, 
          paddingVertical: 12,
          backgroundColor: 'rgba(0,0,0,0.01)'
        }}>
          {/* Location Tag */}
          {transaction.location?.city && (
            <View style={{ 
              flexDirection: 'row', 
              alignItems: 'center',
              backgroundColor: "#DEE1E6", 
              paddingHorizontal: 10, 
              paddingVertical: 4, 
              borderRadius: 12
            }}>
              <IconSymbol name="location" size={14} color="#379AE6" style={{ marginRight: 4 }} />
              <ThemedText 
                type="defautlSmall" 
                style={{ color: "#379AE6", fontWeight: '600', fontSize: 12 }}
              >
                {`${transaction.location.city}, ${transaction.location.region}`}
              </ThemedText>
            </View>
          )}
          
          {/* Payment Processor Tag */}
          {transaction.payment_meta?.payment_processor && (
            <View style={{ 
              flexDirection: 'row', 
              alignItems: 'center',
              backgroundColor: "#F3F4F6", 
              paddingHorizontal: 10, 
              paddingVertical: 4, 
              borderRadius: 12
            }}>
              <IconSymbol name="construct" size={14} color="#4B5563" style={{ marginRight: 4 }} />
              <ThemedText 
                type="defautlSmall" 
                style={{ color: "#4B5563", fontWeight: '600', fontSize: 12 }}
              >
                {transaction.payment_meta.payment_processor}
              </ThemedText>
            </View>
          )}
          
          {/* View Details Button */}
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center',
            paddingHorizontal: 10, 
            paddingVertical: 4, 
          }}>
            <ThemedText 
              type="defautlSmall" 
              style={{ color: colors.brandColor, fontWeight: '600', fontSize: 12 }}
            >
              View Details
            </ThemedText>
            <IconSymbol name="right-arrow" size={14} color={colors.brandColor} style={{ marginLeft: 2 }} />
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
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

// Enhanced AI Filter Button Component
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
  
  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isAIMode ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
    
    // Add pulsing animation when AI mode is active
    if (isAIMode) {
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
      ).start();
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
  
  return (
    <TouchableOpacity 
      onPress={onPress}
      disabled={isFiltering}
      activeOpacity={0.8}
      style={{
        opacity: isFiltering ? 0.7 : 1,
      }}
    >
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
    </TouchableOpacity>
  );
});

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

      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 3);
      const endDate = new Date();

      const endpoint = useAI ? 
        `${Config.apiBaseUrl}/api/v1/plaid/ai/classify-transactions` : 
        `${Config.apiBaseUrl}/api/v1/plaid/db/transactions`;

      const response = await fetch(
        `${endpoint}?` +
        `skip=0&limit=100&` +
        `start_date=${startDate.toISOString()}&` +
        `end_date=${endDate.toISOString()}`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      const responseData = await response.json();
      const transactionsData = responseData.data || [];
      setTransactions(transactionsData);
      
      // Extract and set unique categories
      const uniqueCategories = extractUniqueCategories(transactionsData);
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError(error instanceof Error ? error.message : "Failed to fetch data");
      setTransactions([]);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
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
  
  const handleTransactionPress = (transaction: PlaidTransaction) => {
    setSelectedTransaction(transaction);
    setDialogVisible(true);
  };

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
      <DescriptionDialog 
        visible={dialogVisible} 
        transaction={selectedTransaction} 
        onClose={() => setDialogVisible(false)} 
      />
      
      {/* Header */}
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
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ 
              width: 40, 
              height: 40, 
              borderRadius: 20, 
              backgroundColor: colors.brandColor,
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 12
            }}>
              <IconSymbol name="document" size={20} color="#FFFFFF" />
            </View>
            <ThemedText type="title" style={{ fontSize: 24, fontWeight: '700' }}>
              Transactions
            </ThemedText>
          </View>
          
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
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.brandColor]}
              tintColor={colors.brandColor}
            />
          }
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
        iconName="voice"
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