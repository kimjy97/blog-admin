import { useState, useEffect } from "react";
import { IPost } from "@/models/Post";
import InputRow from "@/components/post/form/InputRow";
import TextareaRow from "@/components/post/form/TextareaRow";
import TagInputRow from "@/components/post/form/TagInputRow";
import SelectRow from "@/components/post/form/SelectRow";
import CalendarRow from "@/components/post/form/CalendarRow";

interface PostEditorFormProps {
  initialData?: Partial<IPost>;
  onDataChange: (data: Partial<IPost>) => void;
  isSubmitting: boolean;
  existingTags?: string[];
}

const PostEditorForm: React.FC<PostEditorFormProps> = ({
  initialData,
  onDataChange,
  isSubmitting,
  existingTags,
}) => {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [currentTag, setCurrentTag] = useState("");
  const [status, setStatus] = useState(initialData?.status);
  const [createdAt, setCreatedAt] = useState<Date | undefined>(
    initialData?.createdAt ? new Date(initialData.createdAt) : undefined
  );
  const [updatedAt, setUpdatedAt] = useState<Date | undefined>(
    initialData?.updatedAt ? new Date(initialData.updatedAt) : undefined
  );

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setDescription(initialData.description || "");
      setContent(initialData.content || "");
      setTags(initialData.tags || []);
      setStatus(initialData.status);
      setCreatedAt(initialData.createdAt ? new Date(initialData.createdAt) : undefined);
      setUpdatedAt(initialData.updatedAt ? new Date(initialData.updatedAt) : undefined);
    }
  }, [initialData]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    onDataChange({ title: newTitle });
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newDescription = e.target.value;
    setDescription(newDescription);
    onDataChange({ description: newDescription });
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    onDataChange({ content: newContent });
  };

  const handleAddTag = () => {
    if (currentTag && !tags.includes(currentTag)) {
      const newTags = [...tags, currentTag];
      setTags(newTags);
      setCurrentTag("");
      onDataChange({ tags: newTags });
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(newTags);
    onDataChange({ tags: newTags });
  };

  const handleStatusChange = (value: string) => {
    const isPublished = value === 'published';
    setStatus(isPublished);
    onDataChange({ status: isPublished });
  };

  const handleCreatedAtChange = (date: Date | undefined) => {
    setCreatedAt(date);
    onDataChange({ createdAt: date });
  };

  const handleUpdatedAtChange = (date: Date | undefined) => {
    setUpdatedAt(date);
    onDataChange({ updatedAt: date });
  };

  const statusOptions = [
    { value: 'draft', label: '임시저장' },
    { value: 'published', label: '발행' },
  ];

  return (
    <form>
      <div className="space-y-4">
        <InputRow
          label='제목'
          id='title'
          value={title}
          onChange={handleTitleChange}
          placeholder="게시글 제목"
          required
          disabled={isSubmitting}
        />
        <TextareaRow
          label="요약"
          id="description"
          value={description}
          onChange={handleDescriptionChange}
          placeholder="게시글 요약 (검색 결과 및 미리보기에 사용)"
          rows={3}
          required
          disabled={isSubmitting}
        />
        <TextareaRow
          label="내용"
          id="content"
          value={content}
          onChange={handleContentChange}
          placeholder="마크다운 형식으로 게시글 내용을 작성하세요."
          rows={15}
          required
          disabled={isSubmitting}
        />
        <TagInputRow
          id="tags"
          label="태그"
          tags={tags}
          currentTag={currentTag}
          onCurrentTagChange={(e) => setCurrentTag(e.target.value)}
          onAddTag={handleAddTag}
          onRemoveTag={handleRemoveTag}
          placeholder="태그 입력 후 Enter 또는 추가 버튼 클릭"
          disabled={isSubmitting}
          existingTags={existingTags}
        />
        <SelectRow
          id="status"
          label="상태"
          value={status ? 'published' : 'draft'}
          onValueChange={handleStatusChange}
          options={statusOptions}
          disabled={isSubmitting}
          placeholder="상태 선택"
        />
        <CalendarRow
          label="생성일"
          id="createdAt"
          value={createdAt}
          onChange={handleCreatedAtChange}
          disabled={isSubmitting}
          placeholder="생성 날짜 선택"
        />
        <CalendarRow
          label="수정일"
          id="updatedAt"
          value={updatedAt}
          onChange={handleUpdatedAtChange}
          disabled={isSubmitting}
          placeholder="수정 날짜 선택"
        />
      </div>
    </form>
  );
};

export default PostEditorForm;
