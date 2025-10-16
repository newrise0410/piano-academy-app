// src/components/teacher/AttendanceStatusBadge.js
import React from "react";
import { View, Text } from "react-native";
import { SEMANTIC_COLORS } from "../../styles/colors";

export default function AttendanceStatusBadge({ status }) {
  const statusConfig = {
    present: {
      label: "출석",
      color: SEMANTIC_COLORS.present,
      bgClass: "bg-success-50",
      textClass: "text-success-700",
    },
    absent: {
      label: "결석",
      color: SEMANTIC_COLORS.absent,
      bgClass: "bg-danger-50",
      textClass: "text-danger-700",
    },
    makeup: {
      label: "보강",
      color: SEMANTIC_COLORS.makeup,
      bgClass: "bg-secondary-50",
      textClass: "text-secondary-700",
    },
  };

  const config = statusConfig[status] || statusConfig.absent;

  return (
    <View className={`${config.bgClass} px-3 py-1 rounded-full`}>
      <Text className={`${config.textClass} text-xs font-medium`}>
        {config.label}
      </Text>
    </View>
  );
}
