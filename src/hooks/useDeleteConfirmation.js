// src/hooks/useDeleteConfirmation.js
import { Alert } from 'react-native';
import { useToastStore } from '../store';

/**
 * 삭제 확인 다이얼로그 커스텀 훅
 *
 * Alert.alert를 사용한 삭제 확인 로직을 재사용 가능하게 만듭니다.
 *
 * @returns {Function} showDeleteConfirmation - 삭제 확인 다이얼로그 표시 함수
 *
 * @example
 * const { showDeleteConfirmation } = useDeleteConfirmation();
 *
 * showDeleteConfirmation({
 *   title: '학생 삭제',
 *   message: `${student.name}을(를) 정말 삭제하시겠습니까?`,
 *   onConfirm: async () => {
 *     await deleteStudent(student.id);
 *   },
 *   onSuccess: () => navigation.goBack(),
 *   successMessage: '학생이 삭제되었습니다',
 *   errorMessage: '삭제에 실패했습니다',
 * });
 */
export const useDeleteConfirmation = () => {
  const toast = useToastStore();

  const showDeleteConfirmation = ({
    title = '삭제 확인',
    message = '정말 삭제하시겠습니까?',
    onConfirm,
    onSuccess,
    onError,
    successMessage = '삭제되었습니다',
    errorMessage = '삭제에 실패했습니다',
    confirmText = '삭제',
    cancelText = '취소',
  }) => {
    Alert.alert(
      title,
      message,
      [
        {
          text: cancelText,
          style: 'cancel',
        },
        {
          text: confirmText,
          style: 'destructive',
          onPress: async () => {
            try {
              await onConfirm();
              toast.success(successMessage);
              if (onSuccess) {
                onSuccess();
              }
            } catch (error) {
              console.error('삭제 오류:', error);
              toast.error(errorMessage);
              if (onError) {
                onError(error);
              }
            }
          },
        },
      ]
    );
  };

  return { showDeleteConfirmation };
};
