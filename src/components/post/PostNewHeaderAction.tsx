'use client'

import { Button } from "@/components/ui/button";
import { CheckIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';
import { useRouter } from "next/navigation";
import { PostEditorHandle } from "./PostEditor/PostEditor";
import React, { useState } from "react";

interface PostNewHeaderActionProps {
  editorRef: React.RefObject<PostEditorHandle | null>;
}

const PostNewHeaderAction: React.FC<PostNewHeaderActionProps> = ({ editorRef }) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (editorRef.current) {
      setIsSubmitting(true);
      try {
        await editorRef.current.submit();
      } catch (error) {
        console.error("Submit failed in PostNewHeaderAction:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="flex gap-3">
      <Button key="back" onClick={() => router.back()} variant="outline" disabled={isSubmitting}>
        <ChevronLeftIcon className="size-4" />
        돌아가기
      </Button>
      <Button key="submit" onClick={handleSubmit} disabled={isSubmitting}>
        <CheckIcon className="size-4" />
        {isSubmitting ? "등록 중..." : "작성 완료"}
      </Button>
    </div>
  );
}

export default PostNewHeaderAction;
