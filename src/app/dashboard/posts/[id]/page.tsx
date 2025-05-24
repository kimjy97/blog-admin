import PageLayout from "@/components/layout/PageLayout";
import HeaderActions from "@/components/post/HeaderActions";
import EditorContent from "@/components/post/EditorContent";
import { PostEditContextProvider } from "@/contexts/PostEditContext";

export default function EditPostPage() {
  return (
    <PageLayout>
      <PostEditContextProvider>
        <PageLayout.Header
          title="게시글 수정"
          actions={<HeaderActions type='edit' />}
        />
        <PageLayout.Content>
          <EditorContent />
        </PageLayout.Content>
      </PostEditContextProvider>
    </PageLayout>
  );
}
