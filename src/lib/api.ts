import { IPost } from "@/models/Post";
import apiClient from "./apiClient";
import { IComment } from "@/models/Comment";

// --- 일반 API 응답 ---
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  total?: number;
  totalPostsCount?: number;
  todayPostsCount?: number;
  draftPostsCount?: number;
  totalCommentsCount?: number;
  todayCommentsCount?: number;
}

// --- 데이터 타입 인터페이스 ---
export interface VisitData {
  _id: string;
  date: string;
  ip: string;
  pathname: string;
  referrer?: string;
  userAgent?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChartVisitData {
  date: string;
  isUnique: boolean;
}

export interface PostData {
  _id: string;
  title: string;
  content: string;
  tags?: string[];
  status: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CommentData {
  _id: string;
  postId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface GuestbookCommentData {
  _id: string;
  nickname: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface PopularTagData {
  name: string;
  count: number;
}

export interface VisitLogData {
  _id: string;
  ip: string;
  pathname: string;
  date: string;
  userAgent?: string;
  createdAt?: string;
  updatedAt?: string;
}

// fetchRecentCommentsWithPost 용
export interface CommentWithPost extends CommentData {
  post?: PostData;
}

// fetchPosts 용
export interface PostsApiResponse {
  data: IPost[];
  tagCounts?: Record<string, number>;
  totalPosts?: number;
}

// fetchCommentsForPost 용
export interface CommentsApiResponse {
  success: boolean;
  data: IComment[];
  totalPages?: number;
  currentPage?: number;
  totalCommentsInQuery?: number;
  totalAllComments?: number;
}

// --- 쿼리 문자열 생성을 위한 헬퍼 함수 ---
const buildQueryString = (params: Record<string, string | number | boolean | undefined>): string => {
  const usp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      usp.append(key, String(value));
    }
  }
  const queryString = usp.toString();
  return queryString ? `?${queryString}` : "";
};

// --- 방문자 통계 API ---

/**
 * 대시보드용 방문자 통계를 가져옵니다.
 */
export const fetchDashboardVisits = async (): Promise<ApiResponse<{ totalViews: number, todayViews: number }>> => {
  const today = new Date();
  const localStartDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
  const localEndDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
  const startDate = localStartDate.toISOString();
  const endDate = localEndDate.toISOString();

  const queryParams = buildQueryString({ type: 'dashboard', endDate, startDate });

  const response = await apiClient.get<ApiResponse<{ totalViews: number, todayViews: number }>>(`/visits${queryParams}`);
  return response.data;
};

/**
 * 차트용 방문자 통계를 가져오며, 선택적으로 기간 필터링 및 IP 포함 여부를 설정할 수 있습니다.
 * @param startDate 필터링 시작 날짜 (YYYY-MM-DD).
 * @param endDate 필터링 종료 날짜 (YYYY-MM-DD).
 * @param includeLocalIps 로컬 IP의 방문을 포함할지 여부.
 */
const getLocalTimeZone = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

/**
 * 차트용 방문자 통계를 가져오며, 선택적으로 기간 필터링 및 IP 포함 여부를 설정할 수 있습니다.
 * @param startDate 필터링 시작 날짜 (YYYY-MM-DD).
 * @param endDate 필터링 종료 날짜 (YYYY-MM-DD).
 * @param includeLocalIps 로컬 IP의 방문을 포함할지 여부.
 */
export const fetchChartVisits = async (startDate?: string, endDate?: string, includeLocalIps?: boolean): Promise<ApiResponse<ChartVisitData[]>> => {
  const queryParams = buildQueryString({ type: 'chart-stats', startDate, endDate, includeLocalIps });
  const response = await apiClient.get<ApiResponse<ChartVisitData[]>>(`/visits${queryParams}`);
  return response.data;
};

/**
 * 경로명 기반 방문자 통계를 가져옵니다.
 * @param startDate 필터링 시작 날짜 (YYYY-MM-DD).
 * @param endDate 필터링 종료 날짜 (YYYY-MM-DD).
 * @param includeLocalIps 로컬 IP의 방문을 포함할지 여부.
 */
export const fetchPathnameStats = async (startDate?: string, endDate?: string, includeLocalIps?: boolean) => {
  const timeZone = getLocalTimeZone();
  const queryParams = buildQueryString({ type: 'pathname-stats', startDate, endDate, includeLocalIps, timeZone });
  const response = await apiClient.get(`/visits${queryParams}`);
  return response.data;
};

/**
 * 최근 방문 로그를 가져옵니다.
 * @param limit 가져올 최대 로그 수.
 * @param startDate 필터링 시작 날짜 (YYYY-MM-DD).
 * @param endDate 필터링 종료 날짜 (YYYY-MM-DD).
 */
export const fetchRecentVisitLogs = async (
  limit: number = 1000,
  startDate?: string,
  endDate?: string
): Promise<ApiResponse<VisitLogData[]>> => {
  const queryParams = buildQueryString({ type: 'logs', limit, sort: '-date', startDate, endDate });
  const response = await apiClient.get<ApiResponse<VisitLogData[]>>(`/visits${queryParams}`);
  return response.data;
};

// --- 게시물 API ---

/**
 * 모든 게시물을 가져옵니다.
 */
export const fetchPosts = async (): Promise<PostsApiResponse> => {
  const response = await apiClient.get<PostsApiResponse>("/posts");
  return response.data;
};

/**
 * 태그 관련 뷰 또는 목록에 사용될 게시물을 가져옵니다.
 */
export const fetchPostsForTags = async (): Promise<IPost[]> => {
  const response = await apiClient.get<{ data: IPost[] }>("/posts");
  return response.data.data;
};

/**
 * 대시보드용 총 게시물 수 및 임시 저장된 게시물 수를 가져옵니다.
 */
export const fetchPostsForDashboard = async (): Promise<{ totalPostsCount: number; todayPostsCount: number; draftPostsCount: number }> => {
  const today = new Date();
  const localStartDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
  const localEndDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
  const startDate = localStartDate.toISOString();
  const endDate = localEndDate.toISOString();

  const queryParams = buildQueryString({ type: 'dashboard', endDate, startDate });

  const postsResponse = await apiClient.get<ApiResponse<{ totalPostsCount: number, todayPostsCount: number, draftPostsCount: number }>>(`/posts${queryParams}`);
  const totalPostsCount = postsResponse.data.totalPostsCount || 0;
  const todayPostsCount = postsResponse.data.todayPostsCount || 0;
  const draftPostsCount = postsResponse.data.draftPostsCount || 0;

  return { totalPostsCount, todayPostsCount, draftPostsCount };
};

/**
 * 최근 게시물을 가져옵니다.
 * @param limit 가져올 최대 게시물 수.
 */
export const fetchRecentPosts = async (limit: number = 5): Promise<ApiResponse<IPost[]>> => {
  const queryParams = buildQueryString({ sort: '-createdAt', limit });
  const response = await apiClient.get<ApiResponse<IPost[]>>(`/posts${queryParams}`);
  return response.data;
};

/**
 * ID로 단일 게시물을 가져옵니다.
 * @param id 게시물 ID.
 */
export const fetchPostById = async (id: string): Promise<IPost> => {
  const response = await apiClient.get<{ post: IPost }>(`/posts/${id}`);
  return response.data.post;
};

/**
 * 새 게시물을 생성합니다.
 * @param postData 새 게시물 데이터.
 */
export const createPost = async (postData: Partial<IPost>): Promise<IPost> => {
  const newPostData = {
    ...postData,
    name: "JongYeon",
  };
  const response = await apiClient.post<{ post: IPost }>("/posts", newPostData);
  return response.data.post;
};

/**
 * 기존 게시물을 업데이트합니다.
 * @param id 업데이트할 게시물 ID.
 * @param data 업데이트할 데이터.
 */
export const updatePost = async ({ id, data }: { id: string; data: Partial<IPost> }): Promise<IPost> => {
  const response = await apiClient.put<{ post: IPost }>(`/posts/${id}`, data);
  return response.data.post;
};

// --- 댓글 API ---

/**
 * 특정 게시물의 댓글을 가져옵니다.
 * @param postId 게시물 ID.
 */
export const fetchCommentsForPost = async (postId: number | null): Promise<CommentsApiResponse> => {
  if (postId === null) {
    return { success: true, data: [] };
  }
  const queryParams = buildQueryString({ postId });
  const response = await apiClient.get<CommentsApiResponse>(`/comments${queryParams}`);
  return response.data;
};

/**
 * 대시보드용 댓글 수(총 댓글 및 오늘 댓글)를 가져옵니다.
 */
export const fetchCommentsForDashboard = async (): Promise<{ totalCommentsCount: number; todayCommentsCount: number }> => {
  const today = new Date();
  const localStartDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
  const localEndDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
  const startDate = localStartDate.toISOString();
  const endDate = localEndDate.toISOString();

  const queryParams = buildQueryString({ type: 'dashboard', endDate, startDate });

  const commentsResponse = await apiClient.get<ApiResponse<{ totalCommentsCount: number; todayCommentsCount: number }>>(`/comments${queryParams}`);
  const totalCommentsCount = commentsResponse.data.totalCommentsCount || 0;
  const todayCommentsCount = commentsResponse.data.todayCommentsCount || 0;

  return { totalCommentsCount, todayCommentsCount };
};

/**
 * 연관된 게시물 정보와 함께 최근 댓글을 가져옵니다.
 * @param limit 가져올 최대 댓글 수.
 */
export const fetchRecentCommentsWithPost = async (limit: number = 5): Promise<ApiResponse<CommentWithPost[]>> => {
  const queryParams = buildQueryString({ sort: '-createdAt', limit, populatePost: 'true' });
  const response = await apiClient.get<ApiResponse<CommentWithPost[]>>(`/comments${queryParams}`);
  return response.data;
};

/**
 * 댓글을 업데이트합니다.
 * @param id 댓글 ID.
 * @param content 댓글의 새 내용.
 * @param isEdited 댓글이 수정되었는지 여부.
 * @param isShow 댓글을 표시할지 여부.
 */
export const updateComment = async ({ id, content, isEdited, isShow }: { id: string; content?: string; isEdited?: boolean; isShow?: boolean }): Promise<IComment> => {
  const updateData: Partial<IComment> = {};
  if (content !== undefined) updateData.content = content;
  if (isEdited !== undefined) (updateData as any).isEdited = isEdited;
  if (isShow !== undefined) (updateData as any).isShow = isShow;


  const response = await apiClient.put<IComment>(`/comments/${id}`, updateData);
  return response.data;
};


// --- 방명록 댓글 API ---

/**
 * 최근 방명록 댓글을 가져옵니다.
 * @param limit 가져올 최대 방명록 댓글 수.
 */
export const fetchRecentGuestbookComments = async (limit: number = 5): Promise<ApiResponse<GuestbookCommentData[]>> => {
  const queryParams = buildQueryString({ sort: '-createdAt', limit });
  const response = await apiClient.get<ApiResponse<GuestbookCommentData[]>>(`/guestbookcomments${queryParams}`);
  return response.data;
};

// --- 인기 태그 API ---

/**
 * 인기 태그를 가져오며, 선택적으로 날짜 범위 필터링을 할 수 있습니다.
 * @param startDate 필터링 시작 날짜 (YYYY-MM-DD).
 * @param endDate 필터링 종료 날짜 (YYYY-MM-DD).
 */
export const fetchPopularTags = async (startDate?: string, endDate?: string): Promise<ApiResponse<PopularTagData[]>> => {
  const queryParams = buildQueryString({ startDate, endDate });
  const response = await apiClient.get<ApiResponse<PopularTagData[]>>(`/popular-tags${queryParams}`);
  return response.data;
};
