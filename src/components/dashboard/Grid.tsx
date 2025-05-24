import React from 'react';

interface GridRootProps {
  children: React.ReactNode;
  className?: string;
}

const GridRoot: React.FC<GridRootProps> = ({ children, className }) => {
  return (
    <div className={className}>
      {children}
    </div>
  );
};

interface GridComponent extends React.FC<GridRootProps> {
  Layout: React.FC<{ children: React.ReactNode }>;
  Overview: React.FC<{ children: React.ReactNode }>;
  Default: React.FC<{ children: React.ReactNode }>;
}

const Grid = GridRoot as GridComponent;

Grid.Layout = ({ children }) => {
  const className = "w-full grid gap-6";
  return <GridRoot className={className}>{children}</GridRoot>;
};
Grid.Layout.displayName = "Grid.Layout";

Grid.Overview = ({ children }) => {
  const className = "grid gap-4 grid-cols-2 md:grid-cols-2 md:gap-6 xl:grid-cols-[3fr_2.5fr_2.5fr_2fr]";
  return <GridRoot className={className}>{children}</GridRoot>;
};
Grid.Overview.displayName = "Grid.Overview";

Grid.Default = ({ children }) => {
  const className = "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-[minmax(0,0.55fr)_minmax(0,0.45fr)] gap-6";
  return <GridRoot className={className}>{children}</GridRoot>;
};
Grid.Default.displayName = "Grid.Default";


export default Grid;
