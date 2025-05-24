import PostList from "@/components/post/PostList";
import BoardList from "@/components/post/BoardList";
import PageLayout from "@/components/layout/PageLayout";
import PostHeaderAction from "@/components/post/PostHeaderAction";

export default function PostsPage() {
  return (
    <PageLayout>
      <PageLayout.Header
        title="게시글 관리"
        actions={<PostHeaderAction />}
      >
        <BoardList />
      </PageLayout.Header>
      <PageLayout.Content>
        <PostList />
      </PageLayout.Content>
    </PageLayout>
  );
}
