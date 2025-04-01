import { View, Text, TouchableOpacity, TextInput, ScrollView, Alert } from "react-native";
import { useThemeColors } from "@/components/ColorSchemeProvider";
import { useState, useCallback } from "react";
import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";

interface FeedbackProps {
  onSubmit: (feedbackData: FeedbackData) => void;
  onClose: () => void;
}

interface TopicButton {
  id: string;
  label: string;
  selected: boolean;
}

interface FeedbackData {
  mood: number;
  topics: string[];
  feedback: string;
  rating: number;
}

interface ValidationErrors {
  mood?: string;
  topics?: string;
  feedback?: string;
  rating?: string;
}

export default function Feedback({ onSubmit, onClose }: FeedbackProps) {
  const { colors } = useThemeColors();
  const [selectedMood, setSelectedMood] = useState<number>(0);
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(0);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [topics, setTopics] = useState<TopicButton[]>([
    { id: "service", label: "Service", selected: false },
    { id: "quantity", label: "Quantity", selected: false },
    { id: "payment", label: "Payment", selected: false },
    { id: "fees", label: "Fees", selected: false },
    { id: "transaction", label: "Transaction", selected: false },
    { id: "gift", label: "Gift", selected: false },
  ]);

  const toggleTopic = (id: string) => {
    setTopics(topics.map(topic => 
      topic.id === id ? { ...topic, selected: !topic.selected } : topic
    ));
    // Clear topic error when user selects a topic
    if (errors.topics) {
      setErrors(prev => ({ ...prev, topics: undefined }));
    }
  };

  const validateForm = useCallback((): boolean => {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    if (selectedMood === 0) {
      newErrors.mood = "Please select your mood";
      isValid = false;
    }

    const selectedTopics = topics.filter(t => t.selected);
    if (selectedTopics.length === 0) {
      newErrors.topics = "Please select at least one topic";
      isValid = false;
    }

    // if (!feedback.trim()) {
    //   newErrors.feedback = "Please provide your feedback";
    //   isValid = false;
    // }

    if (rating === 0) {
      newErrors.rating = "Please provide a rating";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  }, [selectedMood, topics, feedback, rating]);

  const handleSubmit = async () => {
    if (isSubmitting) return;

    if (!validateForm()) {
      Alert.alert(
        "Missing Information",
        "Please fill in all required fields before submitting.",
        [{ text: "OK" }]
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const feedbackData: FeedbackData = {
        mood: selectedMood,
        topics: topics.filter(t => t.selected).map(t => t.id),
        feedback: feedback.trim(),
        rating,
      };

      await onSubmit(feedbackData);
      onClose();
    } catch (error) {
      Alert.alert(
        "Error",
        "Failed to submit feedback. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1">
      {/* Header */}
      <View className="h-12 mt-3 mb-2 relative justify-center items-center">
        <ThemedText
          colorValue="primaryText"
          type="section"
          className="text-center"
          style={{ fontFamily: "Poppins" }}
        >
          Feedback
        </ThemedText>
        <TouchableOpacity
          onPress={onClose}
          className="absolute right-4 h-10 w-10 justify-center items-center"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <IconSymbol name="close" size={24} color={colors.textTertiary} />
        </TouchableOpacity>
      </View>

      {/* Divider */}
      <View className="w-full h-[1.5px]" style={{ backgroundColor: colors.divider }}/>

      <ScrollView className="flex-1 px-4">
        {/* Mood Selection */}
        <View className="py-6">
          <View className="flex-row justify-center space-x-8">
            {[1, 2, 3].map((mood) => (
              <TouchableOpacity
                key={mood}
                onPress={() => {
                  setSelectedMood(mood);
                  if (errors.mood) {
                    setErrors(prev => ({ ...prev, mood: undefined }));
                  }
                }}
                className={`p-2 rounded-full bg-transparent`}
              >
                <IconSymbol
                  name={mood === 1 ? 'sad' : mood === 2 ? 'neutral' : 'happy'}
                  size={48}
                  color={selectedMood === mood ? colors.brandColor : colors.textTertiary}
                />
              </TouchableOpacity>
            ))}
          </View>
          {errors.mood && (
            <ThemedText
              colorValue="burish"
              type="semiSmall"
              className="text-center mt-2"
            >
              {errors.mood}
            </ThemedText>
          )}
        </View>

        {/* Topics Grid */}
        <View className="flex-row flex-wrap justify-center gap-x-2 gap-y-2 w-2/3 mx-auto">
          {topics.map((topic) => (
            <TouchableOpacity
              key={topic.id}
              onPress={() => toggleTopic(topic.id)}
              className={`px-4 py-2 rounded-full flex-row justify-center items-center ${
                topic.selected ? 'bg-[#f1fbfd]' : 'bg-[#f3f4f6]'
              }`}
            >
              <ThemedText
                colorValue={topic.selected ? "selectedText" : "cardText"}
                type="defautlSmall"
              >
                {topic.label}
              </ThemedText>
              {topic.selected ? (
                <IconSymbol
                  name="checkSingle"
                  size={20}
                  color={colors.selectedText}
                  className="ml-2"
                />
              ): (
                <IconSymbol
                  name="plus"
                  size={20}
                  color={colors.cardText}
                  className="ml-2"
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
        {errors.topics && (
          <ThemedText
            colorValue="burish"
            type="semiSmall"
            className="text-center mt-2"
          >
            {errors.topics}
          </ThemedText>
        )}

        {/* Feedback Input */}
        <View className="mt-6">
          <ThemedText
            colorValue="primaryText"
            type="defautlSmall"
            style={{ fontWeight: 700 }}
            className="mb-2"
          >
            How about your feelings?
          </ThemedText>
          <TextInput
            className={`bg-gray-100 rounded-lg p-4 min-h-[80px] ${
              errors.feedback ? 'border-2 border-red-500' : ''
            }`}
            multiline
            placeholder="Type your feedbacks"
            placeholderTextColor={colors.textTertiary}
            value={feedback}
            onChangeText={(text) => {
              setFeedback(text);
              if (errors.feedback) {
                setErrors(prev => ({ ...prev, feedback: undefined }));
              }
            }}
            textAlignVertical="top"
          />
          {errors.feedback && (
            <ThemedText
              colorValue="burish"
              type="semiSmall"
              className="mt-1"
            >
              {errors.feedback}
            </ThemedText>
          )}
        </View>

        {/* Rating */}
        <View className="mt-6 mb-6">
          <ThemedText
            colorValue="primaryText"
            type="defautlSmall"
            style={{ fontWeight: 700 }}
            className="mb-2"
          >
            Rating
          </ThemedText>
          <View className="flex-row space-x-2 justify-between px-6 mx-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => {
                  setRating(star);
                  if (errors.rating) {
                    setErrors(prev => ({ ...prev, rating: undefined }));
                  }
                }}
              >
                <IconSymbol
                  name={star <= rating ? 'sharpStar.fill' : 'sharpStar'}
                  size={32}
                  color={star <= rating ? '#FFD700' : '#E5E5E5'}
                />
              </TouchableOpacity>
            ))}
          </View>
          {errors.rating && (
            <ThemedText
              colorValue="burish"
              type="semiSmall"
              className="text-center mt-2"
            >
              {errors.rating}
            </ThemedText>
          )}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isSubmitting}
          className={`mt-6 mb-8 rounded-lg py-4 items-center ${
            isSubmitting ? 'bg-gray-400' : 'bg-[#29c3e5]'
          }`}
        >
          <ThemedText
            colorValue="btnText"
            type="btnText"
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

// How to use

// import Feedback from "@/components/model/Feedback";
// import BottomSheet from "@/components/Dialog";

// const [showFeedback, setShowFeedback] = useState(false);

// <BottomSheet visible={showFeedback} onClose={() => setShowFeedback(false)}>
//   <Feedback onSubmit={() => ""} onClose={() => setShowFeedback(false)}/>
// </BottomSheet>
