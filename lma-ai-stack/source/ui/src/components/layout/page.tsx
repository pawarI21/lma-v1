import React from 'react';
import { AppSidebar } from './app-sidebar';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from 'components/ui/breadcrumb';
import { Separator } from 'components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from 'components/ui/sidebar';
import { cn } from 'lib/utils';
import { Link } from 'react-router-dom';

interface IPage {
  children: any;
  breadcrumbs?: {
    title: string;
    url?: string;
  }[];
}

export default function Page({ children, breadcrumbs }: IPage) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 sticky top-0 bg-white z-9">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs?.map((breadcrumb, index) => (
                  <React.Fragment>
                    <BreadcrumbItem className={cn(index !== breadcrumbs.length - 1 && 'hidden md:block')}>
                      {breadcrumb.url ? (
                        <BreadcrumbLink className="text-xs" asChild>
                          <Link to={breadcrumb.url}>{breadcrumb.title}</Link>
                        </BreadcrumbLink>
                      ) : (
                        <BreadcrumbPage className="text-xs">{breadcrumb.title}</BreadcrumbPage>
                      )}
                    </BreadcrumbItem>
                    {index !== breadcrumbs.length - 1 ? <BreadcrumbSeparator className="hidden md:block" /> : null}
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
