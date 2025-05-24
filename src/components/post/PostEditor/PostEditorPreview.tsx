import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PrismAsyncLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Card, CardContent } from "@/components/ui/card";
import { IPost } from '@/models/Post';
import { formatDate } from '@/utils/formatDate';

interface PostEditorPreviewProps {
  postData: Partial<IPost>;
}

const PostEditorPreview: React.FC<PostEditorPreviewProps> = ({ postData }) => {
  const markdownComponents = {
    code({ inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <SyntaxHighlighter
          style={vscDarkPlus}
          language={match[1]}
          PreTag="div"
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
  };

  return (
    <Card className="w-1/2 pt-0 lg:block hidden">
      <CardContent className="pt-6 h-full flex flex-col">
        <p className="text-xl text-muted-foreground font-semibold pb-4 mb-6 border-b">마크다운 미리보기</p>
        <h1 className="text-3xl font-bold mb-4">
          <span className='text-accent'>{postData.tags ? postData.tags[0] : ""} </span>{postData.title || ""}
        </h1>
        {(postData.updatedAt || postData.createdAt) && <p className='text-sm mb-6'>{formatDate(postData.updatedAt || postData.createdAt)}</p>}
        <div className='flex gap-2 flex-wrap mb-8'>
          {postData.tags?.map((tag) => (
            <span className="text-sm rounded-sm bg-primary px-2" key={tag}>
              {tag}
            </span>
          ))}
        </div>
        <div className="prose prose-sm dark:prose-invert overflow-y-auto flex-1">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={markdownComponents}
          >
            {postData.content || ""}
          </ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  );
};

export default PostEditorPreview;
