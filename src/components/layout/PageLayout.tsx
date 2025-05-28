import { ReactNode } from "react";

interface PageLayoutProps {
  children: ReactNode;
}

interface PageHeaderProps {
  title: string;
  actions?: ReactNode;
  children?: ReactNode;
}

const PageLayout = ({ children }: PageLayoutProps) => {
  return (
    <div className="page-layout">
      {children}
    </div>
  );
};

const Header = ({ title, actions, children }: PageHeaderProps) => {
  return (
    <div className="sticky top-0 bg-background/70 backdrop-blur-xl md:px-10 md:pt-6 pb-4 px-4 pt-4 z-20">
      <div className="flex justify-between items-center mb-0">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">
          {title}
        </h1>
        {actions}
      </div>
      {children && <div className="mt-5">{children}</div>}
    </div>
  );
};

const Content = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex flex-col px-4 md:px-10 pb-40 sm:pb-30">
      {children}
    </div>
  );
};

PageLayout.Header = Header;
PageLayout.Content = Content;

export default PageLayout;
