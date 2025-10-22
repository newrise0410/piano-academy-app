// src/components/common/CommentSection.js
import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Text from './Text';
import {
  getCommentsByNotice,
  createComment,
  deleteComment,
  subscribeToComments
} from '../../services/firestoreService';
import { useToastStore, useAuthStore } from '../../store';
import TEACHER_COLORS from '../../styles/teacher_colors';

/**
 * 댓글 섹션 컴포넌트
 * @param {string} noticeId - 알림장 ID
 * @param {string} userType - 'teacher' | 'parent'
 */
export default function CommentSection({ noticeId, userType = 'parent' }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const toast = useToastStore();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!noticeId) return;

    // 실시간 댓글 구독
    const unsubscribe = subscribeToComments(noticeId, (updatedComments) => {
      setComments(updatedComments);
    });

    return () => unsubscribe();
  }, [noticeId]);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) {
      toast.warning('댓글 내용을 입력해주세요');
      return;
    }

    if (!user?.uid) {
      toast.error('로그인이 필요합니다');
      return;
    }

    setSubmitting(true);
    try {
      const commentData = {
        userId: user.uid,
        userName: user.name || (userType === 'teacher' ? '선생님' : '학부모'),
        userType,
        content: newComment.trim(),
      };

      const result = await createComment(noticeId, commentData);

      if (result.success) {
        setNewComment('');
        toast.success('댓글이 작성되었습니다');
      } else {
        toast.error('댓글 작성에 실패했습니다');
      }
    } catch (error) {
      console.error('댓글 작성 오류:', error);
      toast.error('댓글 작성 중 오류가 발생했습니다');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = (commentId, commentUserId) => {
    // 본인의 댓글만 삭제 가능
    if (commentUserId !== user?.uid) {
      toast.warning('본인의 댓글만 삭제할 수 있습니다');
      return;
    }

    Alert.alert(
      '댓글 삭제',
      '이 댓글을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteComment(commentId);
            if (result.success) {
              toast.success('댓글이 삭제되었습니다');
            } else {
              toast.error('댓글 삭제에 실패했습니다');
            }
          }
        }
      ]
    );
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return '';

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return '방금 전';
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;

    return `${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  return (
    <View>
      {/* 댓글 헤더 */}
      <View className="flex-row items-center mb-3">
        <Ionicons name="chatbubbles-outline" size={18} color={TEACHER_COLORS.primary.DEFAULT} />
        <Text className="text-sm font-bold text-gray-800 ml-2">
          댓글 ({comments.length})
        </Text>
      </View>

      {/* 댓글 목록 */}
      {comments.length > 0 ? (
        <View className="mb-4">
          {comments.map((comment) => (
            <View
              key={comment.id}
              className="bg-gray-50 rounded-xl p-3 mb-2"
            >
              {/* 댓글 헤더 */}
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center">
                  <View
                    className="rounded-full w-6 h-6 items-center justify-center mr-2"
                    style={{
                      backgroundColor: comment.userType === 'teacher'
                        ? TEACHER_COLORS.primary.DEFAULT
                        : TEACHER_COLORS.blue[500]
                    }}
                  >
                    <Text className="text-white text-xs font-bold">
                      {comment.userType === 'teacher' ? '선' : '학'}
                    </Text>
                  </View>
                  <Text className="text-sm font-bold text-gray-800">
                    {comment.userName}
                  </Text>
                  <Text className="text-xs text-gray-500 ml-2">
                    {formatTimeAgo(comment.createdAt)}
                  </Text>
                </View>

                {/* 삭제 버튼 (본인 댓글만) */}
                {comment.userId === user?.uid && (
                  <TouchableOpacity
                    onPress={() => handleDeleteComment(comment.id, comment.userId)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="trash-outline" size={16} color={TEACHER_COLORS.gray[500]} />
                  </TouchableOpacity>
                )}
              </View>

              {/* 댓글 내용 */}
              <Text className="text-sm text-gray-700 leading-5">
                {comment.content}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <View className="py-6 items-center">
          <Ionicons name="chatbubbles-outline" size={32} color={TEACHER_COLORS.gray[300]} />
          <Text className="text-sm text-gray-400 mt-2">
            첫 댓글을 남겨보세요
          </Text>
        </View>
      )}

      {/* 댓글 입력 */}
      <View className="flex-row items-end">
        <View className="flex-1 mr-2">
          <TextInput
            className="bg-gray-50 rounded-xl px-4 py-3 text-sm"
            style={{ color: TEACHER_COLORS.gray[800] }}
            placeholder="댓글을 입력하세요..."
            placeholderTextColor={TEACHER_COLORS.gray[400]}
            value={newComment}
            onChangeText={setNewComment}
            multiline
            maxLength={500}
            editable={!submitting}
          />
          <Text className="text-xs text-gray-400 mt-1 text-right">
            {newComment.length}/500
          </Text>
        </View>

        <TouchableOpacity
          className="rounded-xl px-4 py-3"
          style={{
            backgroundColor: submitting || !newComment.trim()
              ? TEACHER_COLORS.gray[200]
              : TEACHER_COLORS.primary.DEFAULT
          }}
          onPress={handleSubmitComment}
          disabled={submitting || !newComment.trim()}
          activeOpacity={0.7}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Ionicons
              name="send"
              size={20}
              color={newComment.trim() ? 'white' : TEACHER_COLORS.gray[400]}
            />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
