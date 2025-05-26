import PageLayout from "@/components/layout/PageLayout";
import HeaderActions from "@/components/post/HeaderActions";
import EditorContent from '@/components/post/EditorContent';
import { PostEditContextProvider } from '@/contexts/PostEditContext';

export default function NewPostPage() {
  return (
    <PageLayout>
      <PostEditContextProvider>
        <PageLayout.Header
          title="게시글 작성"
          actions={<HeaderActions type='new' />}
        />
        <PageLayout.Content>
          <EditorContent isNewPost={true} />
        </PageLayout.Content>
      </PostEditContextProvider>
    </PageLayout>
  );
}
