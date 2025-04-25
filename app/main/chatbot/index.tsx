import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Config from "@/constants/config";
import { Audio } from 'expo-av';
import { Alert } from 'react-native';

import { FloatingActionButton } from "@/components/FloatingActionButton";
import { useThemeColors } from "@/components/ColorSchemeProvider";
import { useRouter } from "expo-router";
import { getMyInfo } from "@/apis/infoAPI";
import { SignupResponseSchema } from "@/constants/customTypes";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Image,
    Keyboard,
    Dimensions,
} from 'react-native';

import Animated, {
    useAnimatedStyle,
    withSequence,
    withTiming,
    withRepeat,
    withDelay,
    Easing,
    useSharedValue,
    FadeIn,
    FadeInDown,
    ZoomIn,
    SlideInRight,
    SlideInLeft,
} from 'react-native-reanimated';
import * as FileSystem from 'expo-file-system';
import { fromByteArray } from 'base64-js';
import { LinearGradient } from 'expo-linear-gradient';

import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ThemedText';

const { width } = Dimensions.get('window');

interface Message {
    id: string;
    text: string;
    isUser: boolean;
    timestamp: Date;
}

const getMessage = async (message: string, history: Message[]) => {
    try {
        const response = await axios.post(
            `${Config.apiBaseUrl}/api/v1/chat/get_text_response_rag`,
            {
                message,
                history: history.map(msg => ({
                    text: msg.text,
                    sender: msg.isUser ? 'user' : 'ai'
                }))
            },
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
        
        if (!response.data) {
            console.log('Empty response from server');
        }
        
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("API Error:", error.response?.data);
            console.log(error.response?.data?.detail || 'Failed to get response');
        }
        throw error;
    }
};

const TypingIndicator = () => {
    const { colors } = useThemeColors();
    const bubbleRefs = [...Array(3)].map(() => useSharedValue(0));
    const containerOpacity = useSharedValue(0);
    const containerScale = useSharedValue(0.8);
  
    const bubbleStyle = (index: number) => useAnimatedStyle(() => {
      const opacity = bubbleRefs[index].value;
      return {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: colors.textTertiary,
        marginHorizontal: 3,
        opacity: opacity,
        transform: [
          {
            scale: 1 + opacity * 0.5,
          },
        ],
      };
    });

    const containerStyle = useAnimatedStyle(() => {
      return {
        opacity: containerOpacity.value,
        transform: [{ scale: containerScale.value }],
      };
    });

    // Start the animations in useEffect
    useEffect(() => {
      containerOpacity.value = withTiming(1, { duration: 300 });
      containerScale.value = withTiming(1, { duration: 300 });
      
      bubbleRefs.forEach((ref, index) => {
        ref.value = withRepeat(
          withSequence(
            withDelay(
              index * 150,
              withTiming(1, {
                duration: 400,
                easing: Easing.bezier(0.25, 0.1, 0.25, 1),
              })
            ),
            withTiming(0.3, {
              duration: 400,
              easing: Easing.bezier(0.25, 0.1, 0.25, 1),
            })
          ),
          -1,
          true
        );
      });
    }, []);
  
    return (
      <Animated.View 
        style={[containerStyle]}
        className="absolute bottom-20 left-4 flex-row items-center bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3 shadow-md"
      >
        <View className="bg-gray-200 dark:bg-gray-700 rounded-full p-1 mr-3">
          <Image
            source={require('@/assets/images/bot.png')}
            className="w-7 h-7 rounded-full"
          />
        </View>
        <View className="flex-row items-center">
          {[0, 1, 2].map((i) => (
            <Animated.View key={i} style={bubbleStyle(i)} />
          ))}
        </View>
      </Animated.View>
    );
};

const RecordingDialog = ({ 
  isVisible, 
  onClose, 
  isRecording, 
  onRecordPress 
}: { 
  isVisible: boolean;
  onClose: () => void;
  isRecording: boolean;
  onRecordPress: () => void;
}) => {
  const { colors } = useThemeColors();
  const waveformAnimations = [...Array(12)].map(() => useSharedValue(0));
  const pulseAnimation = useSharedValue(1);
  const recordingTime = useSharedValue(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRecording) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    } else {
      setElapsedTime(0);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);
  
  useEffect(() => {
    if (isRecording) {
      // Pulse animation for recording indicator
      pulseAnimation.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 800, easing: Easing.out(Easing.sin) }),
          withTiming(1, { duration: 800, easing: Easing.in(Easing.sin) })
        ),
        -1,
        true
      );
      
      // Randomized waveform animations
      waveformAnimations.forEach((animation, index) => {
        const randomHeight = -15 - Math.random() * 25;
        animation.value = withRepeat(
          withSequence(
            withDelay(
              index * 80,
              withTiming(randomHeight, { 
                duration: 700 + Math.random() * 500,
                easing: Easing.bezier(0.25, 0.1, 0.25, 1)
              })
            ),
            withTiming(0, { 
              duration: 700 + Math.random() * 500,
              easing: Easing.bezier(0.25, 0.1, 0.25, 1)
            })
          ),
          -1,
          true
        );
      });
    } else {
      pulseAnimation.value = withTiming(1);
      waveformAnimations.forEach(animation => {
        animation.value = withTiming(0);
      });
    }
  }, [isRecording]);

  const pulseStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulseAnimation.value }],
      opacity: isRecording ? 1 : 0.7,
    };
  });

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  if (!isVisible) return null;

  return (
    <View 
      className="absolute inset-0 flex items-center justify-center bg-black/50"
      style={{ 
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      <Animated.View 
        entering={ZoomIn.duration(300).springify()}
        className="bg-black/80 rounded-3xl p-8 items-center shadow-2xl" 
        style={{ width: 300 }}
      >
        <View className="items-center justify-center mb-6" style={{ height: 140 }}>
          {isRecording ? (
            <View className="items-center">
              <Animated.View 
                style={pulseStyle}
                className="w-16 h-16 rounded-full bg-red-500 mb-6 items-center justify-center"
              >
                <View className="w-6 h-6 rounded-sm bg-white" />
              </Animated.View>
              
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                height: 60,
                justifyContent: 'center',
              }}>
                {[...Array(12)].map((_, index) => (
                  <Animated.View
                    key={index}
                    style={[
                      {
                        width: 3,
                        height: 30,
                        backgroundColor: index % 3 === 0 ? '#FF4B4B' : '#FFFFFF',
                        borderRadius: 1.5,
                        marginHorizontal: 2,
                        transform: [{
                          translateY: waveformAnimations[index],
                        }],
                      },
                    ]}
                  />
                ))}
              </View>
              
              <ThemedText className="text-white text-center mt-4 font-medium">
                {formatTime(elapsedTime)}
              </ThemedText>
            </View>
          ) : (
            <View className="items-center">
              <View className="w-20 h-20 rounded-full bg-red-500/20 items-center justify-center mb-4">
                <IconSymbol 
                  name="voice"
                  size={40} 
                  color="white" 
                />
              </View>
              <ThemedText className="text-white text-lg font-medium">
                Ready to record
              </ThemedText>
            </View>
          )}
        </View>
        
        <ThemedText className="text-white/80 text-center mb-8 text-sm">
          {isRecording ? "Tap the button again to stop recording" : "Tap the button to start recording"}
        </ThemedText>
        
        <TouchableOpacity 
          onPress={onRecordPress}
          className="bg-red-500 rounded-full py-4 px-8 items-center w-full"
        >
          <ThemedText className="text-white font-bold">
            {isRecording ? "Stop Recording" : "Start Recording"}
          </ThemedText>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const playTextToSpeech = async (text: string) => {
  let tempFilePath = '';
  let sound: Audio.Sound | null = null;

  try {
    // Configure audio mode first
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
    });

    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${Config.voiceId}`,
      {
        text: text.trim(),
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
        }
      },
      {
        headers: {
          'Accept': 'audio/mpeg',
          'xi-api-key': Config.elevenlabsApiKey,
          'Content-Type': 'application/json',
        },
        responseType: 'arraybuffer',
      }
    );

    if (!response.data) {
      console.log('Empty response from TTS API');
    }

    // Ensure cache directory exists
    const cacheDir = FileSystem.cacheDirectory;
    if (!cacheDir) {
      console.log('Cache directory not available');
    }

    // Create temp file with .mp3 extension
    tempFilePath = `${cacheDir}tts_${Date.now()}.mp3`;

    // Convert array buffer to base64
    const uint8Array = new Uint8Array(response.data);
    const base64String = fromByteArray(uint8Array);

    // Write audio file
    await FileSystem.writeAsStringAsync(
      tempFilePath,
      base64String,
      { encoding: FileSystem.EncodingType.Base64 }
    );

    // Verify file exists and has content
    const fileInfo = await FileSystem.getInfoAsync(tempFilePath);
    if (!fileInfo.exists || fileInfo.size === 0) {
      console.log('Failed to write audio file');
    }

    // Load and play audio
    const soundObject = await Audio.Sound.createAsync(
      { uri: tempFilePath },
      { shouldPlay: false, progressUpdateIntervalMillis: 100 }
    );
    
    sound = soundObject.sound;

    // Play the sound
    await sound.playAsync();

    // Wait for playback to complete
    await new Promise((resolve, reject) => {
      sound?.setOnPlaybackStatusUpdate((status) => {
        if ('isLoaded' in status && status.isLoaded) {
          if (status.didJustFinish) {
            resolve(true);
          }
        } else if ('error' in status) {
          reject(new Error('Playback error'));
        }
      });
    });

  } catch (error) {
    // console.error('TTS Error:', error);
  } finally {
    // Cleanup
    try {
      if (sound) {
        await sound.unloadAsync();
      }
      if (tempFilePath) {
        const fileInfo = await FileSystem.getInfoAsync(tempFilePath);
        if (fileInfo.exists) {
          await FileSystem.deleteAsync(tempFilePath, { idempotent: true });
        }
      }
    } catch (cleanupError) {
      console.warn('Cleanup error:', cleanupError);
    }
  }
};


const MessageBubble = ({ message, index }: { message: Message, index: number }) => {
  const { colors } = useThemeColors();
  const isUser = message.isUser;
  
  const enteringAnimation = isUser 
    ? SlideInRight.delay(index * 100).duration(400) 
    : SlideInLeft.delay(index * 100).duration(400);
  
  return (
    <Animated.View
      entering={enteringAnimation}
      className={`flex-row ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      {!isUser && (
        <View className="bg-gray-200 dark:bg-gray-700 rounded-full p-1 mr-2">
          <Image
            source={require('@/assets/images/bot.png')}
            className="w-8 h-8 rounded-full"
          />
        </View>
      )}
      
      <View
        className={`rounded-2xl px-4 py-3 max-w-[80%] shadow-sm ${
          isUser ? 'rounded-tr-sm' : 'rounded-tl-sm'
        }`}
        style={{
          backgroundColor: isUser 
            ? '#3B82F6' :'#F3F4F6',
        }}
      >
        <Text
          className={isUser ? 'text-white' : '#000000'}
          style={{ fontSize: 16, lineHeight: 24, fontWeight: '400' }}
        >
          {message.text}
        </Text>
        
        <View className="flex-row items-center justify-end">
          <Text 
            className={`text-xs ${isUser ? 'text-white/70' : 'text-gray-300'}`}
          >
            {new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </Text>
          {!isUser && (
            <TouchableOpacity 
              onPress={() => playTextToSpeech(message.text)}
            >
              <IconSymbol 
                name="voice" 
                size={20} 
                color={'#3B82F6'} 
                style={{ marginLeft: 4 }}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {isUser && (
        <View className="bg-gray-200 dark:bg-gray-700 rounded-full p-1 ml-2">
          <Image
            source={require('@/assets/images/Avatar.png')}
            className="w-8 h-8 rounded-full"
          />
        </View>
      )}
    </Animated.View>
  );
};

// New spreading effect loading indicator
const LoadingIndicator = () => {
  const pulseAnim1 = useSharedValue(0);
  const pulseAnim2 = useSharedValue(0);
  const pulseAnim3 = useSharedValue(0);
  const iconScale = useSharedValue(1);
  
  useEffect(() => {
    // Pulse animations for the spreading circles
    pulseAnim1.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500, easing: Easing.out(Easing.ease) }),
        withTiming(0, { duration: 0 })
      ),
      -1
    );
    
    // Delayed second pulse
    pulseAnim2.value = withRepeat(
      withSequence(
        withDelay(
          400,
          withTiming(1, { duration: 1500, easing: Easing.out(Easing.ease) })
        ),
        withTiming(0, { duration: 0 })
      ),
      -1
    );
    
    // Delayed third pulse
    pulseAnim3.value = withRepeat(
      withSequence(
        withDelay(
          800,
          withTiming(1, { duration: 1500, easing: Easing.out(Easing.ease) })
        ),
        withTiming(0, { duration: 0 })
      ),
      -1
    );
    
    // Subtle breathing animation for the icon
    iconScale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.9, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);
  
  const pulse1Style = useAnimatedStyle(() => {
    return {
      opacity: 1 - pulseAnim1.value,
      transform: [{ scale: pulseAnim1.value * 4 }],
    };
  });
  
  const pulse2Style = useAnimatedStyle(() => {
    return {
      opacity: 1 - pulseAnim2.value,
      transform: [{ scale: pulseAnim2.value * 3 }],
    };
  });
  
  const pulse3Style = useAnimatedStyle(() => {
    return {
      opacity: 1 - pulseAnim3.value,
      transform: [{ scale: pulseAnim3.value * 2 }],
    };
  });
  
  const iconStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: iconScale.value }],
    };
  });
  
  return (
    <View className="absolute inset-0 flex items-center justify-center bg-black/10">
      <View className="items-center justify-center">
        <Animated.View 
          style={[pulse1Style, { 
            position: 'absolute',
            width: 16,
            height: 16,
            borderRadius: 8,
            backgroundColor: '#3B82F6',
          }]}
        />
        <Animated.View 
          style={[pulse2Style, { 
            position: 'absolute',
            width: 16,
            height: 16,
            borderRadius: 8,
            backgroundColor: '#3B82F6',
          }]}
        />
        <Animated.View 
          style={[pulse3Style, { 
            position: 'absolute',
            width: 16,
            height: 16,
            borderRadius: 8,
            backgroundColor: '#3B82F6',
          }]}
        />
        <Animated.View 
          style={[iconStyle]}
          className="w-16 h-16 items-center justify-center bg-white dark:bg-gray-800 rounded-full shadow-lg"
        >
          <IconSymbol name="voice" size={30} color="#3B82F6" />
        </Animated.View>
      </View>
    </View>
  );
};

// AI/Manual Toggle Button with spreading effect
const FilterToggleButton = ({ isAIMode, onToggle }: { isAIMode: boolean, onToggle: () => void }) => {
  const { colors } = useThemeColors();
  const pulseAnim = useSharedValue(0);
  const buttonScale = useSharedValue(1);
  
  useEffect(() => {
    if (isAIMode) {
      // Only show spreading effect in AI mode
      pulseAnim.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 2000, easing: Easing.out(Easing.ease) }),
          withTiming(0, { duration: 0 })
        ),
        -1
      );
    } else {
      // Stop animation in Manual mode
      pulseAnim.value = withTiming(0, { duration: 300 });
    }
  }, [isAIMode]);
  
  const handlePressIn = () => {
    buttonScale.value = withTiming(0.9, { duration: 200 });
  };
  
  const handlePressOut = () => {
    buttonScale.value = withTiming(1, { duration: 200 });
  };
  
  const pulseStyle = useAnimatedStyle(() => {
    return {
      opacity: 0.3 - pulseAnim.value * 0.3,
      transform: [{ scale: 1 + pulseAnim.value }],
    };
  });
  
  const buttonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }],
    };
  });
  
  return (
    <View className="absolute right-4 top-24 items-center justify-center z-10">
      {isAIMode && (
        <Animated.View 
          style={[pulseStyle, { 
            position: 'absolute',
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.brandColor || '#3B82F6',
          }]}
        />
      )}
      <Animated.View style={buttonStyle}>
        <TouchableOpacity
          onPress={onToggle}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          className="rounded-full items-center justify-center shadow-md px-4 py-2"
          style={{ 
            backgroundColor: isAIMode ? colors.brandColor || '#3B82F6' : '#64748B',
          }}
        >
          <ThemedText className="text-white font-medium text-sm">
            {isAIMode ? "AI" : "Manual"}
          </ThemedText>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default function Chatbot() {
  const { colors } = useThemeColors();
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAIMode, setIsAIMode] = useState(true);
  const recordButtonScale = useSharedValue(1);
  const recordButtonOpacity = useSharedValue(1);

  // Add this useEffect to fetch user info when component mounts
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const raw = await getMyInfo();
        if (!raw) console.log("User info not found");
        const parsed = SignupResponseSchema.safeParse(raw);
        if (!parsed.success) {
          console.error(parsed.error);
          console.log("Invalid user info format");
        }
        const firstName = parsed.data?.full_name;
        setUserName(firstName || "");
      } catch (error) {
        console.error("Failed to fetch user info:", error);
        setUserName('there'); // fallback to generic greeting
      }
    };

    fetchUserInfo();
  }, []);

  const convertSpeechToText = async (audioUri: string) => {
    try {
      if (!audioUri) {
        console.log('Audio URI is required');
      }

      console.log('Audio URI:', audioUri);

      // Get file info
      const fileInfo = await FileSystem.getInfoAsync(audioUri);
      console.log('File info:', fileInfo);

      if (!fileInfo.exists) {
        console.log('Audio file does not exist');
      }

      // Create FormData and append the file with correct field name "file"
      const formData = new FormData();
      formData.append('file', {
        uri: Platform.OS === 'ios' ? audioUri.replace('file://', '') : audioUri,
        type: 'audio/wav',
        name: 'audio.wav',
      } as any);
      
      formData.append('model_id', 'scribe_v1');

      console.log('FormData created:', formData);
      console.log('Sending request to ElevenLabs...'); 

      const apiResponse = await axios.post<{ text: string }>(
        'https://api.elevenlabs.io/v1/speech-to-text',
        formData,
        {
          headers: {
            'Accept': 'application/json',
            'xi-api-key': Config.elevenlabsApiKey,
            'Content-Type': 'multipart/form-data',
          },
          timeout: 30000,
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        }
      );

      console.log('ElevenLabs Response:', {
        status: apiResponse.status,
        headers: apiResponse.headers,
        data: apiResponse.data
      });

      if (!apiResponse.data?.text) {
        console.log('Invalid response: missing text field');
      }

      return apiResponse.data.text;
    } catch (error) {
      // console.error('Full error:', error);
    }
  };

  useEffect(() => {
    const getPermissions = async () => {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        console.log('Permission required', 'Please grant microphone access to use voice input');
      }
    };

    getPermissions();
  }, []);

  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `Hi ${userName || 'there'}! I'm your AI assistant. How can I help you learn about Gig Platform today?`,
      isUser: false,
      timestamp: new Date(),
    },
  ]);

  const scrollViewRef = useRef<ScrollView>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const longPressTimeout = useRef<NodeJS.Timeout | null>(null);

  const handlePressIn = () => {
    recordButtonScale.value = withTiming(1.1, { duration: 200 });
    recordButtonOpacity.value = withTiming(0.9, { duration: 200 });
    
    // Start a timeout to check for long press
    longPressTimeout.current = setTimeout(() => {
      handleVoiceInput();
      handleRecordPress();
    }, 500); // 500ms delay for long press
  };

  const handlePressOut = () => {
    recordButtonScale.value = withTiming(1, { duration: 200 });
    recordButtonOpacity.value = withTiming(1, { duration: 200 });
    
    // If we have a timeout running, clear it
    if (longPressTimeout.current) {
      clearTimeout(longPressTimeout.current);
      longPressTimeout.current = null;
    }

    // Only stop recording if we actually started recording
    if (isRecording) {
      setIsDialogVisible(false);
      handleRecordPress();
    }
  };

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => setKeyboardHeight(e.endCoordinates.height)
    );
    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardHeight(0)
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  const sanitizeText = (text: string): string => {
    return text
      .replace(/[^\w\s.,!?-]/g, '') // Remove special characters except basic punctuation
      .replace(/\s+/g, ' ')         // Replace multiple spaces with single space
      .trim();                      // Remove leading/trailing whitespace
  };

  const handleSend = async () => {
    if (!message.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: message.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsTyping(true);
    setIsLoading(true);

    try {
      // Use different response handling based on mode
      let aiResponse;
      
      if (isAIMode) {
        const response = await getMessage(userMessage.text, messages);
        aiResponse = response.message;
      } else {
        // In manual mode, provide a simple response
        aiResponse = "This is manual mode. AI responses are disabled. Switch to AI mode for intelligent responses.";
      }
      
      const aiMessage: Message = {
        id: Date.now().toString(),
        text: aiResponse,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Play the AI response using TTS only in AI mode
      // if (isAIMode) {
      //   await playTextToSpeech(aiResponse);
      // }
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: "Sorry, I couldn't process your request. Please try again.",
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
      setIsLoading(false);
    }
  };

  const handleRecordPress = async () => {
    if (isRecording) {
      try {
        setIsRecording(false);
        await recording?.stopAndUnloadAsync();
        const uri = recording?.getURI();
        
        if (!uri) {
          throw new Error('No recording URI available');
        }

        setIsLoading(true);
        const transcribedText = await convertSpeechToText(uri);
        setIsLoading(false);
        
        if (transcribedText) {
          setMessage(transcribedText);
        }
      } catch (err) {
        console.error('Failed to process recording:', err);
        setIsLoading(false);
      } finally {
        setRecording(null);
      }
    } else {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
        });

        const recordingOptions: Audio.RecordingOptions = {
          android: {
            extension: '.wav',
            outputFormat: Audio.AndroidOutputFormat.MPEG_4,
            audioEncoder: Audio.AndroidAudioEncoder.AAC,
            sampleRate: 16000,
            numberOfChannels: 1,
            bitRate: 128000,
          },
          ios: {
            extension: '.wav',
            audioQuality: Audio.IOSAudioQuality.HIGH,
            sampleRate: 16000,
            numberOfChannels: 1,
            bitRate: 128000,
            linearPCMBitDepth: 16,
            linearPCMIsBigEndian: false,
            linearPCMIsFloat: false,
          },
          web: {
            mimeType: 'audio/wav',
            bitsPerSecond: 128000,
          },
        };

        const { recording } = await Audio.Recording.createAsync(recordingOptions);
        setRecording(recording);
        setIsRecording(true);
      } catch (err) {
        console.error('Failed to start recording:', err);
      }
    }
  };

  const handleVoiceInput = () => {
    setIsDialogVisible(true);
    setIsRecording(true);
  };

  useEffect(() => {
    let recordingTimeout: NodeJS.Timeout;

    if (isRecording) {
      // Stop recording after 30 seconds
      recordingTimeout = setTimeout(() => {
        handleRecordPress();
        console.log('Recording limit reached', 'Maximum recording duration is 30 seconds');
      }, 30000);
    }

    return () => {
      if (recordingTimeout) {
        clearTimeout(recordingTimeout);
      }
    };
  }, [isRecording]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const recordButtonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: recordButtonScale.value }],
      opacity: recordButtonOpacity.value,
    };
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      {/* Header */}
      <View className="flex-row justify-between items-center p-4" style={{backgroundColor: colors.background}}>
        <View className="flex-row justify-start">

          <ThemedText type="title" className="ml-12 pt-0.5">Assistant</ThemedText>
        </View>
      </View>

      {/* Messages */}
      <LinearGradient
        colors={[
          colors.background, 
          Platform.OS === 'ios' ? '#F0F4F8' : '#F0F4F8', 
          colors.background
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        className="flex-1"
      >
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 px-4 pt-2"
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg, index) => (
            <MessageBubble key={msg.id} message={msg} index={index} />
          ))}
          <View style={{ height: 100 }} />
        </ScrollView>
      </LinearGradient>

      {/* Typing Indicator */}
      {isTyping && <TypingIndicator />}

      {/* Input Area */}
      <View
        className="p-4 border-t flex-row items-center"
        style={{
          borderTopColor: colors.border,
          paddingBottom: Platform.OS === 'ios' ? keyboardHeight > 0 ? 5 : 34 : 16,
          backgroundColor: colors.background || '#FFFFFF',
        }}
      >
        <View
          className="flex-1 flex-row items-center rounded-full px-4 py-2 mr-2 shadow-sm"
          style={{ 
            backgroundColor: colors.inputBackground || '#F3F4F6',
            borderWidth: 1,
            borderColor: colors.border || '#E5E7EB',
          }}
        >
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Type a message..."
            placeholderTextColor={colors.textTertiary}
            style={{
              flex: 1,
              color: colors.primaryText,
              fontSize: 16,
              paddingVertical: 8,
            }}
            multiline
            maxLength={1000}
          />
        </View>
        
        {message.trim() ? (
          <TouchableOpacity
            onPress={handleSend}
            disabled={!message.trim() || isTyping}
            className="w-12 h-12 rounded-full items-center justify-center"
            style={{ 
              backgroundColor: colors.brandColor || '#3B82F6',
              opacity: message.trim() && !isTyping ? 1 : 0.5,
            }}
          >
            <IconSymbol
              name="send"
              size={20}
              color="white"
            />
          </TouchableOpacity>
        ) : (
          <Animated.View style={recordButtonAnimatedStyle}>
            <TouchableOpacity 
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              className="w-12 h-12 rounded-full items-center justify-center shadow-md"
              style={{
                backgroundColor: isRecording ? '#E21F1F' : '#F00B0B',
              }}
            >
              <IconSymbol 
                name={isRecording ? "voiceStop" : "voice"}
                size={24} 
                color="white" 
              />
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>

      {/* Recording Dialog */}
      <RecordingDialog 
        isVisible={isDialogVisible}
        onClose={() => {
          setIsDialogVisible(false);
          if (isRecording) {
            handleRecordPress(); // Stop recording if active
          }
        }}
        isRecording={isRecording}
        onRecordPress={handleRecordPress}
      />
      
      {/* Loading Indicator */}
      {isLoading && <LoadingIndicator />}
    </KeyboardAvoidingView>
  );
}
