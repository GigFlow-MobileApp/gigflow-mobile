import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Config from "@/constants/config";
import { Audio } from 'expo-av';
import { Alert } from 'react-native';
// Remove ElevenLabs import and replace with direct API calls

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
} from 'react-native';

import Animated, {
    useAnimatedStyle,
    withSequence,
    withTiming,
    withRepeat,
    withDelay,
    Easing,
    useSharedValue,
} from 'react-native-reanimated';
import * as FileSystem from 'expo-file-system';
import { fromByteArray } from 'base64-js';

import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ThemedText';

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
  
    const bubbleStyle = (index: number) => useAnimatedStyle(() => {
      const opacity = bubbleRefs[index].value;
      return {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.textTertiary,
        marginHorizontal: 2,
        opacity: opacity,
        transform: [
          {
            scale: opacity * 1.2,
          },
        ],
      };
    });

    // Start the animations in useEffect
    useEffect(() => {
      bubbleRefs.forEach((ref, index) => {
        ref.value = withRepeat(
          withSequence(
            withDelay(
              index * 200,
              withTiming(1, {
                duration: 300,
                easing: Easing.ease,
              })
            ),
            withTiming(0.3, {
              duration: 300,
              easing: Easing.ease,
            })
          ),
          -1,
          true
        );
      });
    }, []);
  
    return (
      <View className="absolute bottom-20 left-4 flex-row items-center bg-gray-100 rounded-2xl px-4 py-3">
        <Image
          source={require('@/assets/images/bot.png')}
          className="w-8 h-8 rounded-full mr-2"
        />
        <View className="flex-row items-center">
          {[0, 1, 2].map((i) => (
            <Animated.View key={i} style={bubbleStyle(i)} />
          ))}
        </View>
      </View>
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
  const waveformAnimations = [...Array(8)].map(() => useSharedValue(0));
  
  useEffect(() => {
    if (isRecording) {
      waveformAnimations.forEach((animation, index) => {
        animation.value = withRepeat(
          withSequence(
            withDelay(
              index * 100,
              withTiming(-15, { duration: 500 })
            ),
            withTiming(0, { duration: 500 })
          ),
          -1,
          true
        );
      });
    } else {
      waveformAnimations.forEach(animation => {
        animation.value = withTiming(0);
      });
    }
  }, [isRecording]);

  const waveformStyle = {
    width: 3,
    height: 20,
    backgroundColor: 'white',
    borderRadius: 1.5,
  };
  
  if (!isVisible) return null;

  return (
    <View 
      className="absolute inset-0 flex items-center justify-center bg-black/40"
      style={{ 
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      <View className="bg-black/70 rounded-2xl p-6 items-center" style={{ width: 280 }}>
        <View className="items-center justify-center" style={{ height: 120 }}>
          {isRecording ? (
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              height: 40,
            }}>
              {[...Array(8)].map((_, index) => (
                <Animated.View
                  key={index}
                  style={[
                    waveformStyle,
                    {
                      marginHorizontal: 2,
                      transform: [{
                        translateY: waveformAnimations[index],
                      }],
                    },
                  ]}
                />
              ))}
            </View>
          ) : (
            <IconSymbol 
              name="voice"
              size={40} 
              color="white" 
            />
          )}
        </View>
        
        <ThemedText className="text-white text-center mb-6">
          {isRecording ? "Recording... Tap to stop" : "Tap to start recording"}
        </ThemedText>
        {/* <View className="w-full">
          <TouchableOpacity 
            onPress={onClose}
            className="bg-gray-600 rounded-full py-3 items-center"
          >
            <ThemedText className="text-white">Close</ThemedText>
          </TouchableOpacity>
        </View> */}
      </View>
    </View>
  );
};

export default function Chatbot() {
  const { colors } = useThemeColors();
  const router = useRouter();
  const [userName, setUserName] = useState('there');
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isDialogVisible, setIsDialogVisible] = useState(false);

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
        const firstName = parsed.data?.full_name?.split(' ')[0];
        setUserName(firstName || "");
      } catch (error) {
        console.error("Failed to fetch user info:", error);
        setUserName('there'); // fallback to generic greeting
      }
    };

    fetchUserInfo();
  }, []);

  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `Hi ${userName}. I'm here to help you to know about Gig Platform. How can I help you?`,
      isUser: false,
      timestamp: new Date(),
    },
  ]);

  const scrollViewRef = useRef<ScrollView>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const longPressTimeout = useRef<NodeJS.Timeout | null>(null);

  const handlePressIn = () => {
    // Start a timeout to check for long press
    longPressTimeout.current = setTimeout(() => {
      // startRecording();
      handleVoiceInput()
      handleRecordPress()
    }, 500); // 500ms delay for long press
  };

  const handlePressOut = () => {
    // If we have a timeout running, clear it
    if (longPressTimeout.current) {
      clearTimeout(longPressTimeout.current);
      longPressTimeout.current = null;
    }

    // Only stop recording if we actually started recording
    if (isRecording) {
      // stopRecording();
      setIsDialogVisible(false);
      handleRecordPress()
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
          model_id: "eleven_monolingual_v1",
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
      // if (error instanceof Error) {
      //   // Handle specific error cases
      //   if (error.message.includes('extractors')) {
      //     console.log('Error', 'Audio format not supported. Please try again.');
      //   } else {
      //     console.log('Error', 'Failed to play audio response');
      //   }
      // }
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

    try {
      const response = await getMessage(userMessage.text, messages);
      
      const aiMessage: Message = {
        id: Date.now().toString(),
        text: response.message,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Play the AI response using TTS
      await playTextToSpeech(response.message);
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

        const transcribedText = await convertSpeechToText(uri);
        if (transcribedText) {
          setMessage(transcribedText);
        }
      } catch (err) {
        console.error('Failed to process recording:', err);
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
    setIsRecording(true)
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
      <ScrollView
        ref={scrollViewRef}
        className="flex-1 px-4"
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((msg) => (
          <View
            key={msg.id}
            className={`flex-row ${msg.isUser ? 'justify-end' : 'justify-start'} mb-4`}
          >
            {!msg.isUser && (
              <Image
                source={require('@/assets/images/bot.png')}
                className="w-8 h-8 rounded-full mr-2"
              />
            )}
            <View
              className={`rounded-2xl px-4 py-3 max-w-[80%] ${
                msg.isUser ? 'bg-blue-500' : 'bg-gray-100'
              }`}
            >
              <Text
                className={msg.isUser ? 'text-white' : 'text-gray-800'}
                style={{ fontSize: 16, lineHeight: 22 }}
              >
                {msg.text}
              </Text>
            </View>
            {msg.isUser && (
              <Image
                source={require('@/assets/images/Avatar.png')}
                className="w-8 h-8 rounded-full ml-2"
              />
            )}
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity 
        // onPress={handleRecordPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{
          position: 'relative',
          bottom: 80, 
          alignSelf: 'flex-end',
          marginRight: 20,
          width: 60,
          height: 60,
          borderRadius: 30,
          backgroundColor: isRecording ? '#E21F1F' : '#F00B0B',
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}
      >
        <IconSymbol 
          name={isRecording ? "voiceStop" : "voice"}
          size={30} 
          color="white" 
        />
      </TouchableOpacity>

      {/* Typing Indicator */}
      {isTyping && <TypingIndicator />}

      {/* Input Area */}
      <View
        className="p-4 border-t flex-row items-center"
        style={{
          borderTopColor: colors.border,
          paddingBottom: Platform.OS === 'ios' ? keyboardHeight > 0 ? 5 : 34 : 16,
        }}
      >
        {/* <TouchableOpacity 
          className="mr-2"
          onPress={handleVoiceInput}
        >
          <IconSymbol 
            name={isRecording ? "voiceStop" : "voice"} 
            size={24} 
            color={isRecording ? colors.brandColor : colors.textTertiary} 
          />
        </TouchableOpacity> */}
        <View
          className="flex-1 flex-row items-center rounded-full px-4 py-2 mr-2"
          style={{ backgroundColor: colors.inputBackground }}
        >
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Type a message"
            placeholderTextColor={colors.textTertiary}
            style={{
              flex: 1,
              color: colors.primaryText,
              fontSize: 16,
              paddingVertical: 8,
            }}
            multiline
            onSubmitEditing={handleSend}
          />
        </View>
        <TouchableOpacity
          onPress={handleSend}
          disabled={!message.trim() || isTyping}
          style={{ opacity: message.trim() && !isTyping ? 1 : 0.5 }}
        >
          <IconSymbol
            name="send"
            size={24}
            color={message.trim() && !isTyping ? colors.primaryText : colors.textTertiary}
          />
        </TouchableOpacity>
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
    </KeyboardAvoidingView>
  );
}
