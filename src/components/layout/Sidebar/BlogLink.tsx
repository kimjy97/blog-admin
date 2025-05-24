"use client";

import Image from "next/image";
import BlogLogoSrc from "@/assets/blogLogo/Logo.png"
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";

interface BlogLinkProps {
  isCompact: boolean;
  onLinkClick?: () => void;
}

export default function BlogLink({ isCompact, onLinkClick }: BlogLinkProps) {
  if (isCompact) {
    return (
      <a href={process.env.NEXT_PUBLIC_BLOG_URL} target="_blank" onClick={onLinkClick}>
        <div className="flex justify-center items-center rounded-full bg-background/70 w-13 h-13">
          <div className="w-6 h-6">
            <Image src={BlogLogoSrc} alt='blogLogo' />
          </div>
        </div>
      </a>
    );
  }

  return (
    <a href={process.env.NEXT_PUBLIC_BLOG_URL} target="_blank" onClick={onLinkClick}>
      <div className="text-card-foreground group rounded-xl flex justify-center items-center py-4 bg-background/70">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5">
            <Image src={BlogLogoSrc} alt='blogLogo' />
          </div>
          <p className="text-sm font-medium leading-none truncate" title="블로그 바로가기">
            블로그 바로가기
          </p>
          <ArrowTopRightOnSquareIcon className="size-4 text-muted-foreground group-hover:text-foreground" />
        </div>
      </div>
    </a>
  );
}
